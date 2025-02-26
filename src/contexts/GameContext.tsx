'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { getRandomPersonality } from '@/data/personalities';
import { GameState, Personality, User, GuessResult } from '@/types/game';
import { toast } from 'react-hot-toast';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';

interface GameContextData {
  user: User | null;
  setUser: (user: User | null) => void;
  gameState: GameState | null;
  makeGuess: (guess: string) => Promise<GuessResult>;
  revealHint: () => Promise<void>;
  isLoading: boolean;
}

const GameContext = createContext<GameContextData | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Memoriza a função de fazer palpite
  const makeGuess = useCallback(async (guess: string): Promise<GuessResult> => {
    if (!user || !gameState || gameState.status !== 'playing') {
      return { correct: false, message: 'Jogo não está ativo' };
    }

    try {
      const normalizedGuess = guess.toLowerCase().trim();
      const normalizedAnswer = gameState.personality.name.toLowerCase().trim();
      const isCorrect = normalizedGuess === normalizedAnswer;

      // Atualiza tentativas
      const newAttempts = [...gameState.attempts, guess];
      const newStatus = isCorrect ? 'won' : newAttempts.length >= gameState.maxAttempts ? 'lost' : 'playing';

      // Atualiza o jogo no Firestore
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const gameRef = doc(db, `users/${user.id}/games/${today.toISOString()}`);
      
      await updateDoc(gameRef, {
        attempts: newAttempts,
        status: newStatus
      });

      // Atualiza o estado local
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          attempts: newAttempts,
          status: newStatus
        };
      });

      // Se acertou ou perdeu, atualiza estatísticas
      if (newStatus === 'won' || newStatus === 'lost') {
        const userRef = doc(db, 'users', user.id);
        const basePoints = 100;
        const hintsUsed = (gameState.hintsRevealed || 1) - 1;
        const points = Math.max(20, basePoints - (hintsUsed * 20));

        // Atualiza pontuações do usuário
        await updateDoc(userRef, {
          gamesPlayed: increment(1),
          ...(newStatus === 'won' ? {
            gamesWon: increment(1),
            score: increment(points),
            xp: increment(10),
            currentStreak: increment(1),
            bestStreak: increment(user.currentStreak + 1 > user.bestStreak ? 1 : 0)
          } : {
            currentStreak: 0
          })
        });

        // Se ganhou, atualiza o ranking
        if (newStatus === 'won') {
          const scoreRef = doc(db, 'scores', user.id);
          
          // Verifica se o documento existe
          const scoreDoc = await getDoc(scoreRef);
          
          if (!scoreDoc.exists()) {
            // Se não existe, cria com valores iniciais
            await setDoc(scoreRef, {
              userId: user.id,
              nickname: user.nickname || 'Jogador',
              points_daily: 0,
              points_weekly: 0,
              points_monthly: 0,
              lastUpdated: serverTimestamp()
            });
          }

          // Agora atualiza os pontos
          await updateDoc(scoreRef, {
            userId: user.id,
            nickname: user.nickname || 'Jogador',
            points_daily: increment(points),
            points_weekly: increment(points),
            points_monthly: increment(points),
            lastUpdated: serverTimestamp()
          });

          console.log('Pontuação atualizada:', {
            userId: user.id,
            points,
            total: (scoreDoc.exists() ? scoreDoc.data().points_daily || 0 : 0) + points
          });
        }

        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            ...(newStatus === 'won' ? {
              gamesWon: prev.gamesWon + 1,
              score: prev.score + points,
              xp: prev.xp + 10,
              currentStreak: prev.currentStreak + 1,
              bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1)
            } : {
              currentStreak: 0
            })
          };
        });

        if (isCorrect) {
          toast.success(`Parabéns! Você ganhou ${points} pontos!`);
        } else {
          toast.error(`Você perdeu! A resposta era: ${gameState.personality.name}`);
        }
      } else {
        toast.error('Tente novamente!');
      }

      return {
        correct: isCorrect,
        message: isCorrect ? 'Resposta correta!' : 'Tente novamente'
      };
    } catch (error) {
      console.error('Erro ao fazer palpite:', error);
      toast.error('Erro ao processar seu palpite');
      return { correct: false, message: 'Erro ao processar seu palpite' };
    }
  }, [user, gameState]);

  // Memoriza a função de revelar dica
  const revealHint = useCallback(async () => {
    if (!user || !gameState || gameState.status !== 'playing') return;

    try {
      const newHintsRevealed = Math.min(
        (gameState.hintsRevealed || 1) + 1,
        gameState.personality.hints.length
      );

      // Atualiza o jogo no Firestore
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const gameRef = doc(db, `users/${user.id}/games/${today.toISOString()}`);
      
      await updateDoc(gameRef, {
        hintsRevealed: newHintsRevealed
      });

      // Atualiza o estado local
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          hintsRevealed: newHintsRevealed
        };
      });

      // Desconta pontos se não for a primeira dica
      if (newHintsRevealed > 1) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          score: increment(-20)
        });

        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            score: prev.score - 20
          };
        });

        toast.success('Nova dica revelada! (-20 pontos)');
      }
    } catch (error) {
      console.error('Erro ao revelar dica:', error);
      toast.error('Erro ao revelar dica');
    }
  }, [user, gameState]);

  // Inicializa o jogo
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setGameState(null);
        setIsLoading(false);
        return;
      }

      try {
        // Carrega ou cria usuário
        const userRef = doc(db, 'users', authUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          const newUser: User = {
            id: authUser.uid,
            email: authUser.email || '',
            nickname: authUser.displayName || 'Jogador',
            score: 0,
            xp: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            bestStreak: 0,
            achievements: []
          };
          await setDoc(userRef, newUser);

          // Inicializa documento de pontuação
          const scoreRef = doc(db, 'scores', authUser.uid);
          await setDoc(scoreRef, {
            userId: authUser.uid,
            nickname: authUser.displayName || 'Jogador',
            points_daily: 0,
            points_weekly: 0,
            points_monthly: 0,
            lastUpdated: serverTimestamp()
          });

          setUser(newUser);
        }

        // Carrega ou cria jogo
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const gameRef = doc(db, `users/${authUser.uid}/games/${today.toISOString()}`);
        const gameDoc = await getDoc(gameRef);

        if (gameDoc.exists()) {
          const gameData = gameDoc.data() as GameState;
          const updatedGameState = {
            ...gameData,
            hintsRevealed: gameData.hintsRevealed || 1,
            attempts: gameData.attempts || [],
            status: gameData.status || 'playing',
            maxAttempts: 6
          };
          setGameState(updatedGameState);
          
          // Garante que o estado está sincronizado no Firestore
          await updateDoc(gameRef, updatedGameState);
        } else {
          const personality = getRandomPersonality();
          const newGame: GameState = {
            personality,
            hintsRevealed: 1,
            attempts: [],
            status: 'playing',
            maxAttempts: 6
          };
          await setDoc(gameRef, newGame);
          setGameState(newGame);
        }
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        toast.error('Erro ao carregar o jogo');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    gameState,
    makeGuess,
    revealHint,
    isLoading
  }), [user, gameState, makeGuess, revealHint, isLoading]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
} 