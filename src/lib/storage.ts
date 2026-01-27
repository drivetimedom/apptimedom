// Storage keys
export const STORAGE_KEYS = {
  USERS: 'members-users',
  COURSES: 'members-courses',
  LESSONS: 'members-lessons',
  PROGRESS: 'members-progress',
  COMMENTS: 'members-comments',
  SESSION: 'members-session',
  BANNERS: 'members-banners',
  CATEGORIES: 'members-categories',
  SWIPEFILE_PROCESSES: 'swipefile-processes',
  SWIPEFILE_CATEGORIES: 'swipefile-categories',
  ACTIVATION_TEMPLATES: 'activation-plan-templates',
  HOF_MAPS: 'hof-circle-maps',
  HOF_CHALLENGES: 'hof-circle-challenges',
} as const;

// User status levels
export type UserStatus = 'iniciante' | 'primeiras-vendas' | 'intermediario' | 'avancado' | 'elite';

// User map prescriptions (now accepts any map ID or empty string)
export type PrescribedMap = string;

// Activation plan task (enhanced with template tracking)
export interface ActivationTask {
  id: string;
  text: string;
  done: boolean;
  fromTemplate?: string | null; // Template name or null for individual tasks
  order?: number;
}

// Activation Plan Template
export type TemplateCategory = 'setup' | 'trafego' | 'vendas' | 'operacional' | 'financeiro' | 'geral';

export interface ActivationPlanTemplate {
  id: string;
  name: string;
  description?: string;
  category?: TemplateCategory;
  tasks: string[];
  createdAt: string;
  updatedAt: string;
}

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
  // HOF Circle prescription fields
  status?: UserStatus;
  prescribedMap?: PrescribedMap;
  visibleChallenges?: string[];
  activationPlan?: ActivationTask[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessonIds: string[];
}

// Sequence configuration for courses
export interface SequenceConfig {
  isSequential: boolean;
  position: number;
  isPillar: boolean;
  requiresPrevious: boolean;
  prerequisiteCourseId: string | null;
  unlocksAfter: string | null;
}

// Roadmap configuration for courses
export interface RoadmapConfig {
  showInRoadmap: boolean;
  roadmapPosition: { x: number; y: number } | null;
  roadmapIcon: string;
  roadmapLabel: string;
}

// Course type
export type CourseType = 'trilha' | 'desafio' | 'material';

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail?: string;
  instructorId: string;
  category: string;
  categoryIds?: string[];
  subcategoryId?: string;
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  status: 'draft' | 'published' | 'private';
  locked: boolean;
  totalDuration: string;
  createdAt: string;
  modules: Module[];
  isNew?: boolean;
  sequenceConfig?: SequenceConfig;
  roadmapConfig?: RoadmapConfig;
  // Course type for direct navigation
  courseType?: CourseType;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkType: 'course' | 'external' | 'page';
  linkTo: string;
  ctaText?: string;
  active: boolean;
  order: number;
}

// Subcategory for dedicated pages
export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  order: number;
  showRoadmap: boolean;
}

// Page configuration for dedicated category pages
export interface PageConfig {
  bannerTitle: string;
  bannerSubtitle?: string;
  bannerImageUrl?: string;
  bannerCtaText?: string;
  aboutText?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  slug: string;
  order: number;
  active: boolean;
  // Dedicated page configuration
  hasDedicatedPage?: boolean;
  showInMainMenu?: boolean;
  pageConfig?: PageConfig;
  subcategories?: Subcategory[];
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

// Category progress tracking
export interface CategoryCourseProgress {
  completed: boolean;
  completedAt?: string;
  progress: number;
  currentLesson?: string;
}

export interface CategoryProgress {
  totalCourses: number;
  completedCourses: number;
  percentage: number;
  currentCourse?: string;
  unlockedCourses: string[];
  courseProgress: Record<string, CategoryCourseProgress>;
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
  categoryProgress?: Record<string, CategoryProgress>;
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

// Course access checking utilities
export function checkCourseAccess(courseId: string, userId: string): boolean {
  const courses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  const progressList = getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);
  
  const course = courses.find(c => c.id === courseId);
  if (!course) return false;
  
  // If no sequence config or doesn't require previous, allow access
  if (!course.sequenceConfig?.requiresPrevious) {
    return true;
  }
  
  // Check if prerequisite is completed
  const prerequisiteId = course.sequenceConfig.prerequisiteCourseId;
  if (!prerequisiteId) return true;
  
  const prerequisiteCourse = courses.find(c => c.id === prerequisiteId);
  if (!prerequisiteCourse) return true;
  
  // Find user progress for prerequisite
  const userProgress = progressList.find(p => p.userId === userId && p.courseId === prerequisiteId);
  
  // Check if prerequisite is 100% complete
  if (!userProgress) return false;
  
  return userProgress.progress >= 100;
}

export function getCourseStatus(courseId: string, userId: string): 'locked' | 'available' | 'in_progress' | 'completed' {
  const courses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
  const progressList = getFromStorage<Progress[]>(STORAGE_KEYS.PROGRESS, []);
  
  const course = courses.find(c => c.id === courseId);
  if (!course) return 'locked';
  
  // Check access first
  if (!checkCourseAccess(courseId, userId)) {
    return 'locked';
  }
  
  // Check user progress
  const userProgress = progressList.find(p => p.userId === userId && p.courseId === courseId);
  
  if (!userProgress) return 'available';
  if (userProgress.progress >= 100) return 'completed';
  return 'in_progress';
}
