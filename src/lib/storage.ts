// Storage keys
export const STORAGE_KEYS = {
  USERS: 'members-users',
  COURSES: 'members-courses',
  LESSONS: 'members-lessons',
  PROGRESS: 'members-progress',
  COMMENTS: 'members-comments',
  SESSION: 'members-session',
  SWIPEFILE_PROCESSES: 'swipefile-processes',
  SWIPEFILE_CATEGORIES: 'swipefile-categories',
} as const;

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  type: 'admin' | 'instructor' | 'user';
  avatar?: string;
  bio?: string;
  instagram?: string;
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  unlockedCourses?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  category: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: 'draft' | 'published' | 'private';
  locked: boolean;
  totalDuration: string;
  createdAt: string;
  modules: Module[];
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  vimeoId: string;
  duration: string;
  order: number;
  locked: boolean;
  resources: {
    type: 'pdf' | 'link';
    name: string;
    url: string;
  }[];
}

export interface Progress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  currentLesson: string;
  startedAt: string;
  lastAccessAt: string;
  progress: number;
  liked: string[];
  disliked: string[];
  favorites: string[];
}

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  text: string;
  createdAt: string;
  likes: number;
}

export interface Session {
  userId: string;
  email: string;
  type: 'admin' | 'instructor' | 'user';
  loginAt: string;
}

// Storage utilities
export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from storage:', error);
  }
}

// Session management
export function getSession(): Session | null {
  return getFromStorage<Session | null>(STORAGE_KEYS.SESSION, null);
}

export function setSession(session: Session): void {
  setToStorage(STORAGE_KEYS.SESSION, session);
}

export function clearSession(): void {
  removeFromStorage(STORAGE_KEYS.SESSION);
}

export function getCurrentUser(): User | null {
  const session = getSession();
  if (!session) return null;
  
  const users = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  return users.find(u => u.id === session.userId) || null;
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
