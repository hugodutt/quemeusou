import { FiStar, FiTarget, FiAward } from 'react-icons/fi';

export const ACHIEVEMENTS = {
  FIRST_WIN: {
    id: 'first-win',
    name: 'Primeira Vitória',
    description: 'Vença sua primeira partida',
    icon: <FiStar className="w-5 h-5 text-green-400" />,
  },
  STREAK_10: {
    id: 'streak-10',
    name: 'Sequência de 10',
    description: 'Mantenha uma sequência de 10 vitórias',
    icon: <FiTarget className="w-5 h-5 text-blue-400" />,
  },
  STREAK_30: {
    id: 'streak-30',
    name: 'Sequência de 30',
    description: 'Mantenha uma sequência de 30 vitórias',
    icon: <FiTarget className="w-5 h-5 text-purple-400" />,
  },
  CORRECT_100: {
    id: 'correct-100',
    name: 'Centenário',
    description: 'Acerte 100 palpites',
    icon: <FiAward className="w-5 h-5 text-yellow-400" />,
  }
}; 