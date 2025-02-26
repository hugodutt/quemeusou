'use client';

import React, { memo, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { FiAward, FiStar, FiTarget, FiZap } from 'react-icons/fi';
import { PlayerProfile } from './PlayerProfile';

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

// Tipos
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Componentes memorizados
const AchievementCard = memo(({ achievement }: { achievement: Achievement }) => {
  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-green-500/20';
      case 'rare': return 'border-blue-500/20';
      case 'epic': return 'border-purple-500/20';
      case 'legendary': return 'border-yellow-500/20';
      default: return 'border-gray-500/20';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-green-300';
      case 'rare': return 'text-blue-300';
      case 'epic': return 'text-purple-300';
      case 'legendary': return 'text-yellow-300';
      default: return 'text-gray-300';
    }
  };

  const progress = Math.min(100, (achievement.progress / achievement.maxProgress) * 100);

  return (
    <motion.div
      variants={item}
      className={`p-4 bg-gray-800/40 rounded-xl border ${getRarityBorder(achievement.rarity)} transition-all hover:bg-gray-800/60`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${achievement.rarity}-500/30 to-${achievement.rarity}-600/30 flex items-center justify-center shadow-lg`}>
          {achievement.icon}
        </div>
        <div className="flex-1">
          <h3 className={`text-sm font-medium ${getRarityTextColor(achievement.rarity)} mb-1`}>
            {achievement.title}
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            {achievement.description}
          </p>
          <div className="relative h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`absolute inset-0 bg-gradient-to-r from-${achievement.rarity}-500 to-${achievement.rarity}-600`}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${getRarityTextColor(achievement.rarity)}`}>
              {achievement.progress}/{achievement.maxProgress}
            </span>
            {achievement.unlocked && (
              <span className={`text-xs px-2 py-0.5 rounded-full bg-${achievement.rarity}-500/20 ${getRarityTextColor(achievement.rarity)} border border-${achievement.rarity}-500/30`}>
                Concluído
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});
AchievementCard.displayName = 'AchievementCard';

export const Achievements = memo(() => {
  const { user } = useGame();

  const achievements = useMemo<Achievement[]>(() => [
    {
      id: 'first_win',
      title: 'Primeira Vitória',
      description: 'Vença sua primeira partida',
      icon: <FiStar className="w-5 h-5 text-green-400" />,
      progress: user?.gamesWon || 0,
      maxProgress: 1,
      unlocked: (user?.gamesWon || 0) >= 1,
      rarity: 'common'
    },
    {
      id: 'streak_3',
      title: 'Sequência Perfeita',
      description: 'Mantenha uma sequência de 3 vitórias',
      icon: <FiTarget className="w-5 h-5 text-blue-400" />,
      progress: user?.currentStreak || 0,
      maxProgress: 3,
      unlocked: (user?.currentStreak || 0) >= 3,
      rarity: 'rare'
    },
    {
      id: 'master',
      title: 'Mestre do Jogo',
      description: 'Vença 10 partidas',
      icon: <FiAward className="w-5 h-5 text-purple-400" />,
      progress: user?.gamesWon || 0,
      maxProgress: 10,
      unlocked: (user?.gamesWon || 0) >= 10,
      rarity: 'epic'
    },
    {
      id: 'legend',
      title: 'Lenda',
      description: 'Mantenha uma sequência de 7 vitórias',
      icon: <FiZap className="w-5 h-5 text-yellow-400" />,
      progress: user?.currentStreak || 0,
      maxProgress: 7,
      unlocked: (user?.currentStreak || 0) >= 7,
      rarity: 'legendary'
    }
  ], [user?.gamesWon, user?.currentStreak]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PlayerProfile />
      </div>
      
      <div className="flex-1 p-4">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {achievements.map((achievement) => (
            <AchievementCard 
              key={achievement.id} 
              achievement={achievement} 
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
});

Achievements.displayName = 'Achievements'; 
//