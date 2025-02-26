'use client';

import { Auth } from '@/components/Auth';
import { Game } from '@/components/Game';
import { Header } from '@/components/Header';
import { Achievements } from '@/components/Achievements';
import { useGame } from '@/contexts/GameContext';
import { Ranking } from '@/components/Ranking';
import { FiAward, FiStar, FiHelpCircle } from 'react-icons/fi';
import { useEffect, useState, memo, useMemo } from 'react';
import dynamic from 'next/dynamic';

// Componentes memorizados para evitar re-renders desnecessários
const MemoizedAchievements = memo(Achievements);
const MemoizedRanking = memo(Ranking);
const MemoizedGame = memo(Game);
const MemoizedHeader = memo(Header);

// Lazy loading do componente de autenticação
const AuthComponent = dynamic(() => import('@/components/Auth').then(mod => mod.Auth), {
  loading: () => <div className="animate-pulse bg-gray-800 h-32 rounded-lg" />
});

// Layout base memorizado
const AppLayout = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen bg-[#0a0b1e] flex">
      <div className="absolute inset-0 bg-[#141627]" />
      <div className="relative z-10 w-full flex">
        {children}
      </div>
    </div>
  );
});
AppLayout.displayName = 'AppLayout';

// Componente de loading memorizado
const LoadingSpinner = memo(() => (
  <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500" />
));
LoadingSpinner.displayName = 'LoadingSpinner';

// Componente de status do usuário memorizado
const UserStats = memo(({ score, xp }: { score: number; xp: number }) => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded">
      <FiStar className="w-3.5 h-3.5 text-yellow-400" />
      <span className="text-xs text-white">{score} pontos</span>
    </div>
    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded">
      <FiAward className="w-3.5 h-3.5 text-green-400" />
      <span className="text-xs text-white">{xp} XP</span>
    </div>
    <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-800 rounded">
      <span className="text-xs text-white">Sequência: 1</span>
    </div>
  </div>
));
UserStats.displayName = 'UserStats';

export default function Home() {
  const { user, isLoading } = useGame();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoriza os stats do usuário para evitar re-renders
  const userStats = useMemo(() => {
    if (!user) return null;
    return {
      score: user.score,
      xp: user.xp
    };
  }, [user?.score, user?.xp]);

  if (!mounted) {
    return null;
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center w-full">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center w-full">
          <div className="w-full max-w-md bg-gray-900/90 rounded-xl p-6 shadow-lg border border-gray-800">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                <FiHelpCircle className="w-6 h-6 text-purple-400" />
                Quem Eu Sou?
              </h1>
            </div>
            <AuthComponent />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex h-screen">
        {/* Conquistas */}
        <div className="w-80 bg-gray-900 border-r border-gray-800">
          <div className="h-12 border-b border-gray-800 flex items-center px-4">
            <h2 className="text-sm font-bold text-yellow-400 flex items-center gap-1">
              <FiAward className="w-3.5 h-3.5" />
              Conquistas
            </h2>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-thin">
            <MemoizedAchievements />
          </div>
        </div>

        {/* Jogo */}
        <div className="flex-1 bg-gray-900 flex flex-col">
          <div className="h-12 border-b border-gray-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <FiHelpCircle className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-white">
                Quem Eu Sou?
              </span>
            </div>
            <div className="flex items-center gap-3">
              <MemoizedHeader />
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <MemoizedGame />
          </div>
        </div>

        {/* Ranking */}
        <div className="w-80 bg-gray-900 border-l border-gray-800">
          <div className="h-12 border-b border-gray-800 flex items-center px-4">
            <h2 className="text-sm font-bold text-blue-400 flex items-center gap-1">
              <FiStar className="w-3.5 h-3.5" />
              Ranking
            </h2>
          </div>
          <div className="h-[calc(100%-3rem)] overflow-y-auto scrollbar-thin">
            <MemoizedRanking />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
