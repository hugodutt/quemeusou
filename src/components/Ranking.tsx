'use client';

import { useState, memo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiStar } from 'react-icons/fi';
import { useGame } from '@/contexts/GameContext';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type Period = 'daily' | 'weekly' | 'monthly';

interface Player {
  id: string;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

// Constantes
const COLLECTIONS = {
  USERS: 'users',
  SCORES: 'scores'
} as const;

const PeriodSelector = memo(({ 
  period, 
  setPeriod 
}: { 
  period: Period;
  setPeriod: (p: Period) => void;
}) => {
  const periods = {
    daily: 'Hoje',
    weekly: 'Semana',
    monthly: 'Mês'
  };

  return (
    <div className="flex gap-2 mb-4">
      {(Object.keys(periods) as Period[]).map((p) => (
        <button
          key={p}
          onClick={() => setPeriod(p)}
          className={`flex-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            period === p
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800/70'
          }`}
        >
          {periods[p]}
        </button>
      ))}
    </div>
  );
});

export const Ranking = () => {
  const { user } = useGame();
  const [period, setPeriod] = useState<Period>('daily');
  const [rankings, setRankings] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setRankings([]);

        console.log('=== INÍCIO DA BUSCA ===');
        console.log('Período:', period);
        console.log('Usuário:', user?.id);

        // Busca as pontuações ordenadas
        const scoresRef = collection(db, COLLECTIONS.SCORES);
        
        // Primeiro, vamos verificar se existem documentos na coleção
        const countSnapshot = await getDocs(scoresRef);
        console.log('Total de documentos em scores:', countSnapshot.size);

        // Agora busca ordenado por pontos do período
        const scoresQuery = query(
          scoresRef,
          orderBy(`points_${period}`, 'desc'),
          limit(10)
        );

        console.log('Buscando ranking...');
        const scoresSnapshot = await getDocs(scoresQuery);
        console.log(`Encontrados ${scoresSnapshot.size} jogadores`);

        // Log de cada documento encontrado
        scoresSnapshot.forEach(doc => {
          console.log('Documento encontrado:', {
            id: doc.id,
            data: doc.data()
          });
        });

        // Mapeia os resultados
        const players = scoresSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.nickname || 'Jogador',
            points: data[`points_${period}`] || 0,
            isCurrentUser: user ? doc.id === user.id : false
          };
        }).filter(player => player.points > 0); // Só mostra jogadores com pontos

        console.log('Ranking final:', players);
        setRankings(players);
      } catch (error) {
        console.error('Erro ao buscar ranking:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setRankings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankings();
  }, [period, user?.id]);

  if (error) {
    return (
      <div className="p-3">
        <div className="text-center py-8 text-red-400">
          <p>Erro ao carregar ranking: {error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-3">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-800/50 rounded-xl"></div>
          <div className="h-12 bg-gray-800/50 rounded-xl"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-800/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center shadow-lg">
          <FiTrendingUp className="w-5 h-5 text-purple-300" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-purple-300">Ranking</h2>
          <p className="text-xs text-gray-400">Os melhores jogadores</p>
        </div>
      </div>

      <PeriodSelector period={period} setPeriod={setPeriod} />

      <div className="space-y-2">
        {rankings.length > 0 ? (
          rankings.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`p-3 bg-gradient-to-br from-gray-800/40 to-gray-800/20 rounded-xl border transition-all shadow-lg
                ${player.isCurrentUser 
                  ? 'border-purple-500/50 ring-1 ring-purple-500/20' 
                  : 'border-gray-700/50'}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
                    index === 0 ? 'from-yellow-400 to-yellow-600' :
                    index === 1 ? 'from-gray-300 to-gray-500' :
                    index === 2 ? 'from-amber-600 to-amber-800' :
                    'from-gray-700 to-gray-800'
                  } flex items-center justify-center shadow-lg`}>
                    {index < 3 ? (
                      <FiAward className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-gray-300">{index + 1}º</span>
                    )}
                  </div>
                  <h3 className={`font-medium text-sm ${player.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                    {player.name}
                  </h3>
                  {player.isCurrentUser && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Você
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <FiStar className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">{player.points}</span>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Nenhum jogador encontrado neste período</p>
          </div>
        )}
      </div>
    </div>
  );
};

Ranking.displayName = 'Ranking'; 