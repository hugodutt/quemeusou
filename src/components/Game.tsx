'use client';

import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { FiSend, FiClock, FiHelpCircle, FiTarget, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { getTimeUntilNextGame } from '@/utils/game';

// Tipos
type GameStatusType = 'won' | 'lost' | 'playing' | 'surrendered';

// Animações memorizadas
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// Componentes memorizados
const GameStatus = memo(({ status, attempts, personality, nextGameTime }: {
  status: GameStatusType;
  attempts: number;
  personality?: string;
  nextGameTime?: number;
}) => {
  const formatTime = useCallback((ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor(ms / 1000 / 60 / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return useMemo(() => {
    if (status === 'won') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 p-6 bg-green-500/10 rounded-2xl border border-green-500/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
            <FiAward className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-green-400 mb-3">🎉 Parabéns!</h3>
          <p className="text-green-300">Você acertou em {attempts} tentativas!</p>
          {nextGameTime && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-green-300/80">
              <FiClock className="w-4 h-4" />
              <span>Próximo jogo em: {formatTime(nextGameTime)}</span>
            </div>
          )}
        </motion.div>
      );
    }

    if (status === 'lost') {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 p-6 bg-red-500/10 rounded-2xl border border-red-500/20"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <FiTarget className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400 mb-3">😔 Não foi dessa vez!</h3>
          <p className="text-red-300">A resposta era: {personality}</p>
          {nextGameTime && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-red-300/80">
              <FiClock className="w-4 h-4" />
              <span>Próximo jogo em: {formatTime(nextGameTime)}</span>
            </div>
          )}
        </motion.div>
      );
    }

    return null;
  }, [status, attempts, personality, nextGameTime, formatTime]);
});
GameStatus.displayName = 'GameStatus';

const GuessInput = memo(({ 
  value, 
  onChange, 
  onSubmit, 
  disabled, 
  isSubmitting 
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled: boolean;
  isSubmitting: boolean;
}) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity" />
    <div className="relative flex items-center">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Digite seu palpite..."
        className="w-full px-6 py-5 bg-gray-900/70 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-lg placeholder-gray-400 border-2 border-purple-500/30 text-white transition-all focus:bg-gray-900/90 focus:border-purple-500/50 pr-32"
        disabled={disabled || isSubmitting}
      />
      <button
        type="submit"
        disabled={disabled || isSubmitting}
        className={`absolute right-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-purple-500/20 hover:shadow-xl'
        }`}
        onClick={onSubmit}
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <FiSend className="w-4 h-4" />
            <span>Enviar</span>
          </>
        )}
      </button>
    </div>
  </div>
));
GuessInput.displayName = 'GuessInput';

const AttemptsDisplay = memo(({ 
  attempts, 
  maxAttempts 
}: { 
  attempts: string[];
  maxAttempts: number;
}) => {
  const remainingAttempts = maxAttempts - attempts.length;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
        <span>Tentativas restantes: {remainingAttempts}</span>
        <span>{attempts.length}/{maxAttempts}</span>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {attempts.map((attempt, index) => (
          <motion.div
            key={`${attempt}-${index}`}
            variants={item}
            className="bg-gray-800/50 rounded-lg p-2 text-center"
          >
            <span className="text-sm text-gray-300">{attempt}</span>
          </motion.div>
        ))}
        {Array.from({ length: remainingAttempts }).map((_, index) => (
          <motion.div
            key={`empty-${index}`}
            variants={item}
            className="bg-gray-800/20 rounded-lg p-2 text-center"
          >
            <span className="text-sm text-gray-500">?</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});
AttemptsDisplay.displayName = 'AttemptsDisplay';

const PotentialPoints = memo(({ points }: { points: number }) => (
  <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/30 transition-all shadow-lg">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center shadow-lg">
          <FiTarget className="w-5 h-5 text-indigo-300" />
        </div>
        <span className="text-indigo-300 font-medium text-base">Pontuação possível:</span>
      </div>
      <span className="text-2xl font-bold text-indigo-300">{points}</span>
    </div>
  </div>
));
PotentialPoints.displayName = 'PotentialPoints';

// Componente de Dicas
const HintsDisplay = memo(({ hints, revealedCount, onRevealHint, canRevealMore }: {
  hints: string[];
  revealedCount: number;
  onRevealHint: () => void;
  canRevealMore: boolean;
}) => (
  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/30 transition-all shadow-lg space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg">
          <FiHelpCircle className="w-5 h-5 text-purple-300" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-purple-300">Dicas Disponíveis</h3>
          <p className="text-xs text-gray-400">Primeira dica é grátis! Demais custam 20 pontos</p>
        </div>
      </div>
      {canRevealMore && (
        <button
          onClick={onRevealHint}
          className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/20 flex items-center gap-2"
        >
          <FiHelpCircle className="w-4 h-4" />
          Revelar Nova Dica
        </button>
      )}
    </div>
    <div className="space-y-2">
      {hints.map((hint, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: index < revealedCount ? 1 : 0.3, 
            y: 0,
            scale: index < revealedCount ? 1 : 0.98
          }}
          transition={{ duration: 0.2 }}
          className={`p-4 rounded-xl ${
            index < revealedCount
              ? 'bg-gray-800/50 text-gray-300 border border-purple-500/20'
              : 'bg-gray-800/20 text-gray-500'
          }`}
        >
          {index < revealedCount ? (
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-purple-300">{index + 1}</span>
              </div>
              <span>{hint}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FiHelpCircle className="w-5 h-5 text-gray-500" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  </div>
));
HintsDisplay.displayName = 'HintsDisplay';

export function Game() {
  const { gameState, user, makeGuess, revealHint } = useGame();
  const [guess, setGuess] = useState('');
  const [nextGameTime, setNextGameTime] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Memoriza o cálculo da pontuação potencial
  const potentialPoints = useMemo(() => {
    if (!gameState?.hintsRevealed) return 100;
    const basePoints = 100;
    const hintsUsed = (gameState.hintsRevealed || 1) - 1;
    const pointsLost = hintsUsed * 20;
    return Math.max(20, basePoints - pointsLost);
  }, [gameState?.hintsRevealed]);

  // Memoriza o handler de submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await makeGuess(guess);
      setGuess('');
    } finally {
      setIsSubmitting(false);
    }
  }, [guess, isSubmitting, makeGuess]);

  // Atualiza o timer do próximo jogo
  useEffect(() => {
    if (gameState?.status === 'won' || gameState?.status === 'lost') {
      const nextGame = getTimeUntilNextGame();
      setNextGameTime(nextGame.getTime() - Date.now());

      const timer = setInterval(() => {
        setNextGameTime(prev => prev ? prev - 1000 : null);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState?.status]);

  if (!gameState || !user) {
    return (
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-blue-400">Carregando...</p>
      </div>
    );
  }

  // Garante que temos pelo menos a primeira dica
  const currentHints = gameState.personality?.hints || [];
  const revealedHints = currentHints.slice(0, Math.max(1, gameState.hintsRevealed || 1));
  const canRevealMoreHints = gameState.status === 'playing' && revealedHints.length < currentHints.length;

  return (
    <div className="space-y-8">
      <GameStatus 
        status={gameState.status as GameStatusType}
        attempts={gameState.attempts.length}
        personality={gameState.personality?.name}
        nextGameTime={nextGameTime || undefined}
      />

      <div className="space-y-8">
        {/* Dicas */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/30 transition-all shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg">
                <FiHelpCircle className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-purple-300">Dicas</h3>
                <p className="text-xs text-gray-400">Primeira dica é grátis! Demais custam 20 pontos</p>
              </div>
            </div>
            {canRevealMoreHints && (
              <button
                onClick={revealHint}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/20 flex items-center gap-2"
              >
                <FiHelpCircle className="w-4 h-4" />
                Revelar Nova Dica
              </button>
            )}
          </div>
          <div className="space-y-2">
            {revealedHints.map((hint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-xl bg-gray-800/50 text-gray-300 border border-purple-500/20"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-purple-300">{index + 1}</span>
                  </div>
                  <span>{hint}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <PotentialPoints points={potentialPoints} />

        <form onSubmit={handleSubmit}>
          <GuessInput
            value={guess}
            onChange={setGuess}
            onSubmit={handleSubmit}
            disabled={gameState.status !== 'playing'}
            isSubmitting={isSubmitting}
          />
        </form>

        {/* Tentativas */}
        <AttemptsDisplay 
          attempts={gameState.attempts}
          maxAttempts={gameState.maxAttempts}
        />
      </div>
    </div>
  );
}

Game.displayName = 'Game'; 