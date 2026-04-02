import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { Level, Track } from '../types';

// ─── Date Formatters ──────────────────────────────────────
export const formatDate = (dateStr: string): string => {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return 'Unknown date';
    return format(d, 'MMM d, yyyy');
  } catch {
    return 'Unknown date';
  }
};

export const formatRelative = (dateStr: string): string => {
  try {
    const d = parseISO(dateStr);
    if (!isValid(d)) return '';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '';
  }
};

export const formatToday = (): string => format(new Date(), 'yyyy-MM-dd');

// ─── Hours Formatter ──────────────────────────────────────
export const formatHours = (hours: number): string => {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ─── Percentage ───────────────────────────────────────────
export const formatPercent = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

// ─── Level → Color ────────────────────────────────────────
export const getLevelColor = (level: Level): string => {
  const colors: Record<Level, string> = {
    Beginner: '#3FB950',
    Intermediate: '#58A6FF',
    Advanced: '#D29922',
    Expert: '#F85149',
  };
  return colors[level] ?? '#667eea';
};

// ─── Track → Color ────────────────────────────────────────
export const getTrackColor = (track: Track | string): string => {
  const colors: Record<string, string> = {
    Fresher: '#1D9E75',
    'Mid-Level': '#378ADD',
    Senior: '#764ba2',
    Staff: '#F85149',
  };
  return colors[track] ?? '#667eea';
};

// ─── Streak Message ───────────────────────────────────────
export const getStreakMessage = (streak: number): string => {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start! Keep going!';
  if (streak < 7) return `${streak} days strong! Keep it up!`;
  if (streak < 14) return `${streak} days! You are on fire! 🔥`;
  if (streak < 30) return `${streak} days! Incredible discipline!`;
  if (streak < 60) return `${streak} days! You are unstoppable!`;
  return `${streak} days! Absolute legend! 🏆`;
};

// ─── Greeting ─────────────────────────────────────────────
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Day Range Display ───────────────────────────────────
export const formatDayRange = (days: string): string => {
  const [start, end] = days.split('–').map(Number);
  return `Days ${start}–${end}`;
};

// ─── Phase Number → Ordinal ──────────────────────────────
export const toOrdinal = (n: number): string => {
  const suffix = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

// ─── Score Color ──────────────────────────────────────────
export const getScoreColor = (
  knew: number,
  review: number
): string => {
  if (knew + review === 0) return '#8B949E';
  const pct = knew / (knew + review);
  if (pct >= 0.8) return '#3FB950';
  if (pct >= 0.6) return '#D29922';
  return '#F85149';
};

// ─── Truncate ─────────────────────────────────────────────
export const truncate = (str: string, maxLen: number): string => {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
};

// ─── Phase Icon ───────────────────────────────────────────
export const getPhaseIcon = (phaseNum: number): string => {
  const icons = ['☕', '🎯', '🔄', '⚡', '🌱', '🔌', '📡', '☁️', '🏗️', '🧪'];
  return icons[phaseNum - 1] ?? '📚';
};
