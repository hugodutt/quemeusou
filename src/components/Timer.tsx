'use client';

import { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';
import { formatTimeRemaining } from '@/utils/game';

interface TimerProps {
  nextGameTime: Date;
}

export function Timer({ nextGameTime }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(formatTimeRemaining(nextGameTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(formatTimeRemaining(nextGameTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextGameTime]);

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <FiClock className="w-5 h-5" />
      <span className="font-mono text-lg">{timeRemaining}</span>
    </div>
  );
} 