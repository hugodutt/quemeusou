import { User, Achievement } from '@/types/game';

export function calculatePoints(attempts: number, hintsRevealed: number): number {
  // Primeira dica é gratuita, então começamos a contar a partir da segunda
  const paidHints = Math.max(0, hintsRevealed - 1);
  
  // Acertou sem usar dicas extras (apenas a primeira que é gratuita)
  if (paidHints === 0) {
    return 100; // Pontuação máxima
  }

  // A cada dica extra revelada (após a primeira), perde 20 pontos
  const points = Math.max(20, 100 - (paidHints * 20));
  return points;
}

export function checkAchievements(user: User): Achievement[] {
  const newAchievements: Achievement[] = [];

  // Primeira vitória
  if (user.correctGuesses === 1 && !user.achievements.includes('first-win')) {
    newAchievements.push('first-win');
  }

  // Streak de 10 dias
  if (user.currentStreak >= 10 && !user.achievements.includes('streak-10')) {
    newAchievements.push('streak-10');
  }

  // Streak de 30 dias
  if (user.currentStreak >= 30 && !user.achievements.includes('streak-30')) {
    newAchievements.push('streak-30');
  }

  // 100 acertos
  if (user.correctGuesses >= 100 && !user.achievements.includes('correct-100')) {
    newAchievements.push('correct-100');
  }

  return newAchievements;
}

export function getTimeUntilNextGame(): Date {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);
  return tomorrow;
}

export function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function normalizeGuess(guess: string): string {
  return guess
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function compareGuesses(guess: string, answer: string): boolean {
  return normalizeGuess(guess) === normalizeGuess(answer);
} 