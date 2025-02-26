import React, { memo, useMemo } from 'react';
import { useGame } from '@/contexts/GameContext';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiZap } from 'react-icons/fi';

// Funções utilitárias memorizadas
const calculateLevel = (xp: number) => {
  // Cada nível requer 20% mais XP que o anterior
  // Nível 1: 0-100 XP
  // Nível 2: 101-220 XP
  // Nível 3: 221-364 XP
  // etc...
  return Math.floor(Math.log(xp / 100 * 0.2 + 1) / Math.log(1.2)) + 1;
};

const calculateXPForNextLevel = (level: number) => {
  return Math.floor(100 * (Math.pow(1.2, level - 1) - 1) / 0.2);
};

// Componentes memorizados
const StatCard = memo(({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode;
  value: number;
  label: string;
  color: string;
}) => (
  <div className={`bg-gray-800/50 rounded-lg p-2 text-center hover:bg-gray-800/70 transition-colors`}>
    <div className={`flex items-center justify-center gap-1 ${color} mb-1`}>
      {icon}
      <span className="font-bold">{value}</span>
    </div>
    <span className={`text-xs ${color}/70`}>{label}</span>
  </div>
));
StatCard.displayName = 'StatCard';

const XPBar = memo(({ 
  xp, 
  level, 
  nextLevelXP 
}: { 
  xp: number;
  level: number;
  nextLevelXP: number;
}) => {
  const progress = ((xp - calculateXPForNextLevel(level)) / (nextLevelXP - calculateXPForNextLevel(level))) * 100;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Nível {level}</span>
        <span>{xp} / {nextLevelXP} XP</span>
      </div>
      <div className="h-2 bg-gray-800/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
        />
      </div>
    </div>
  );
});
XPBar.displayName = 'XPBar';

export const PlayerProfile = memo(() => {
  const { user } = useGame();

  const { level, nextLevelXP } = useMemo(() => {
    if (!user) return { level: 1, nextLevelXP: 100 };
    const level = calculateLevel(user.xp);
    const nextLevelXP = calculateXPForNextLevel(level + 1);
    return { level, nextLevelXP };
  }, [user]);

  if (!user) return null;

  return (
    <div className="p-4 space-y-4">
      {/* Informações do usuário */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg">
          <span className="text-lg font-bold text-white">{user.nickname[0].toUpperCase()}</span>
        </div>
        <div>
          <h2 className="font-semibold text-white">{user.nickname}</h2>
          <p className="text-sm text-gray-400">Nível {level}</p>
        </div>
      </div>

      {/* Barra de XP */}
      <XPBar xp={user.xp} level={level} nextLevelXP={nextLevelXP} />

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard
          icon={<FiTrendingUp className="w-4 h-4" />}
          value={user.currentStreak}
          label="Sequência"
          color="text-yellow"
        />
        <StatCard
          icon={<FiAward className="w-4 h-4" />}
          value={user.bestStreak}
          label="Recorde"
          color="text-orange"
        />
        <StatCard
          icon={<FiZap className="w-4 h-4" />}
          value={user.gamesWon}
          label="Vitórias"
          color="text-green"
        />
      </div>
    </div>
  );
});

PlayerProfile.displayName = 'PlayerProfile'; 