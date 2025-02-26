export type PersonalityCategory =
  | 'actor'
  | 'musician'
  | 'athlete'
  | 'fictional'
  | 'scientist'
  | 'historical'
  | 'influencer';

export interface Personality {
  id: string;
  name: string;
  category: string;
  hints: string[];
  imageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  nickname: string;
  score: number;
  xp: number;
  achievements: Achievement[];
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt?: Date;
}

export type GameStatus = 'playing' | 'won' | 'lost' | 'surrendered';

export interface GameState {
  personality: Personality;
  hintsRevealed: number;
  attempts: string[];
  status: GameStatus;
  maxAttempts: number;
}

export interface GuessResult {
  correct: boolean;
  message: string;
} 