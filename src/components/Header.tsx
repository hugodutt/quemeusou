'use client';

import { useGame } from '@/contexts/GameContext';
import { FiLogOut, FiUser, FiAward, FiStar, FiTarget, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export function Header() {
  const { user, setUser } = useGame();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('gameState');
    toast.success('Até logo!');
  };

  if (!user) return null;

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo e título */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
              <FiTarget className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
              Quem Eu Sou?
            </h1>
          </motion.div>

          {/* Stats do usuário */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6"
          >
            {/* Pontos */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30"
            >
              <FiAward className="w-4 h-4 text-yellow-400" />
              <span className="font-medium text-yellow-300">{user.score} pontos</span>
            </motion.div>

            {/* XP */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30"
            >
              <FiZap className="w-4 h-4 text-green-400" />
              <span className="font-medium text-green-300">{user.xp} XP</span>
            </motion.div>

            {/* Streak */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30"
            >
              <FiStar className="w-4 h-4 text-blue-400" />
              <span className="font-medium text-blue-300">Sequência: {user.currentStreak}</span>
            </motion.div>

            {/* Usuário e Logout */}
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30"
              >
                <FiUser className="w-4 h-4 text-purple-400" />
                <span className="font-medium text-purple-300">{user.nickname}</span>
              </motion.div>

              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/30"
              >
                <FiLogOut className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
} 