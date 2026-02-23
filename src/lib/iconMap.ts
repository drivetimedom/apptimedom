import {
  Target, Rocket, Zap, Dumbbell, Flame, Diamond, TrendingUp, Shield, Star, Award,
  Compass, Map, Trophy, type LucideIcon,
} from 'lucide-react';

export const lucideIconMap: Record<string, LucideIcon> = {
  Target,
  Rocket,
  Zap,
  Dumbbell,
  Flame,
  Diamond,
  TrendingUp,
  Shield,
  Star,
  Award,
  Compass,
  Map,
  Trophy,
};

export function getLucideIcon(name: string): LucideIcon | null {
  return lucideIconMap[name] || null;
}
