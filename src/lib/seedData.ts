import { 
  STORAGE_KEYS, 
  User, 
  Course, 
  Lesson, 
  Progress,
  Comment,
  getFromStorage, 
  setToStorage 
} from './storage';

// Initial users
const initialUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Administrador',
    email: 'admin@sistema.com',
    password: 'admin123',
    type: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Administrador do sistema',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'instructor-1',
    name: 'Ana Silva',
    email: 'instrutor@sistema.com',
    password: 'inst123',
    type: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    bio: 'Especialista em estratégias digitais e growth hacking. Mais de 10 anos de experiência no mercado.',
    instagram: '@anasilva',
    active: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'instructor-2',
    name: 'Carlos Mendes',
    email: 'carlos@sistema.com',
    password: 'carlos123',
    type: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Mentor de negócios e especialista em automação de marketing.',
    instagram: '@carlosmendes',
    active: true,
    createdAt: '2026-01-08',
  },
  {
    id: 'user-1',
    name: 'João Santos',
    email: 'usuario@sistema.com',
    password: 'user123',
    type: 'user',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=150&h=150&fit=crop&crop=face',
    active: true,
    createdAt: '2026-01-15',
    unlockedCourses: ['course-1', 'course-2', 'course-3'],
  },
];

// Initial courses
const initialCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Link{Mi}®',
    subtitle: 'ENTREGA EM UM CLIQUE',
    description: 'Aprenda a criar sistemas de entrega automatizados que convertem visitantes em clientes fiéis. Este framework completo vai te ensinar passo a passo como estruturar funis de alta conversão.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
    instructorId: 'instructor-1',
    category: 'Estratégias',
    level: 'Intermediário',
    status: 'published',
    locked: false,
    totalDuration: '5:30:00',
    createdAt: '2026-01-10',
    modules: [
      {
        id: 'mod-1-1',
        title: 'Fundamentos do Link{Mi}',
        description: 'Conceitos essenciais para dominar a metodologia',
        order: 1,
        lessonIds: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3'],
      },
      {
        id: 'mod-1-2',
        title: 'Implementação Prática',
        description: 'Mão na massa: criando seu primeiro sistema',
        order: 2,
        lessonIds: ['lesson-1-4', 'lesson-1-5'],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Ative{Mi}®',
    subtitle: 'ATIVAÇÃO DE AUDIÊNCIA',
    description: 'Transforme seguidores passivos em uma comunidade engajada. Descubra as técnicas avançadas de ativação que grandes marcas utilizam para criar conexões autênticas.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    instructorId: 'instructor-1',
    category: 'Engajamento',
    level: 'Avançado',
    status: 'published',
    locked: false,
    totalDuration: '4:15:00',
    createdAt: '2026-01-12',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Psicologia da Ativação',
        description: 'Entenda o que motiva sua audiência',
        order: 1,
        lessonIds: ['lesson-2-1', 'lesson-2-2'],
      },
      {
        id: 'mod-2-2',
        title: 'Estratégias de Conteúdo',
        description: 'Criando conteúdo que gera ação',
        order: 2,
        lessonIds: ['lesson-2-3', 'lesson-2-4'],
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Scale{Mi}®',
    subtitle: 'ESCALE SEU NEGÓCIO',
    description: 'O framework definitivo para escalar seu negócio de forma sustentável. Aprenda os pilares da escalabilidade e como implementá-los na sua empresa.',
    thumbnail: 'https://images.unsplash.com/photo-1553484771-047a44eee27b?w=800&h=600&fit=crop',
    instructorId: 'instructor-2',
    category: 'Negócios',
    level: 'Avançado',
    status: 'published',
    locked: false,
    totalDuration: '6:45:00',
    createdAt: '2026-01-14',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Mentalidade de Escala',
        description: 'Preparando-se para o crescimento exponencial',
        order: 1,
        lessonIds: ['lesson-3-1', 'lesson-3-2'],
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Auto{Mi}®',
    subtitle: 'AUTOMAÇÃO INTELIGENTE',
    description: 'Automatize processos e libere seu tempo para o que realmente importa. Ferramentas e estratégias de automação para empreendedores.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop',
    instructorId: 'instructor-2',
    category: 'Automação',
    level: 'Iniciante',
    status: 'published',
    locked: true,
    totalDuration: '3:20:00',
    createdAt: '2026-01-16',
    modules: [
      {
        id: 'mod-4-1',
        title: 'Introdução à Automação',
        description: 'Por onde começar sua jornada de automação',
        order: 1,
        lessonIds: ['lesson-4-1'],
      },
    ],
  },
];

// Initial lessons
const initialLessons: Lesson[] = [
  // Course 1 - Link{Mi}
  {
    id: 'lesson-1-1',
    courseId: 'course-1',
    moduleId: 'mod-1-1',
    title: 'Bem-vindo ao Link{Mi}®',
    description: 'Uma introdução completa ao framework Link{Mi} e como ele vai transformar sua forma de entregar valor aos clientes.',
    vimeoId: '76979871',
    duration: '12:30',
    order: 1,
    locked: false,
    resources: [
      { type: 'pdf', name: 'Slides da Aula', url: '#' },
      { type: 'link', name: 'Checklist de Implementação', url: '#' },
    ],
  },
  {
    id: 'lesson-1-2',
    courseId: 'course-1',
    moduleId: 'mod-1-1',
    title: 'Os 5 Pilares da Entrega',
    description: 'Descubra os 5 pilares fundamentais que sustentam qualquer sistema de entrega de alta performance.',
    vimeoId: '76979871',
    duration: '18:45',
    order: 2,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-1-3',
    courseId: 'course-1',
    moduleId: 'mod-1-1',
    title: 'Mapeando sua Jornada',
    description: 'Como mapear a jornada do cliente e identificar pontos de entrega estratégicos.',
    vimeoId: '76979871',
    duration: '22:10',
    order: 3,
    locked: false,
    resources: [
      { type: 'pdf', name: 'Template de Jornada', url: '#' },
    ],
  },
  {
    id: 'lesson-1-4',
    courseId: 'course-1',
    moduleId: 'mod-1-2',
    title: 'Criando seu Sistema',
    description: 'Passo a passo para criar seu primeiro sistema de entrega automatizado.',
    vimeoId: '76979871',
    duration: '35:00',
    order: 4,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-1-5',
    courseId: 'course-1',
    moduleId: 'mod-1-2',
    title: 'Otimização e Métricas',
    description: 'Como medir resultados e otimizar seu sistema para máxima conversão.',
    vimeoId: '76979871',
    duration: '28:15',
    order: 5,
    locked: false,
    resources: [],
  },
  // Course 2 - Ative{Mi}
  {
    id: 'lesson-2-1',
    courseId: 'course-2',
    moduleId: 'mod-2-1',
    title: 'O Poder da Ativação',
    description: 'Entenda por que ativação é mais importante que crescimento de seguidores.',
    vimeoId: '76979871',
    duration: '15:00',
    order: 1,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-2-2',
    courseId: 'course-2',
    moduleId: 'mod-2-1',
    title: 'Gatilhos Mentais na Prática',
    description: 'Os gatilhos mentais mais eficazes para ativar sua audiência.',
    vimeoId: '76979871',
    duration: '20:30',
    order: 2,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-2-3',
    courseId: 'course-2',
    moduleId: 'mod-2-2',
    title: 'Conteúdo que Converte',
    description: 'Formatos de conteúdo com maior taxa de engajamento.',
    vimeoId: '76979871',
    duration: '25:00',
    order: 3,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-2-4',
    courseId: 'course-2',
    moduleId: 'mod-2-2',
    title: 'Calendário de Ativação',
    description: 'Como criar um calendário de conteúdo focado em ativação.',
    vimeoId: '76979871',
    duration: '18:00',
    order: 4,
    locked: false,
    resources: [],
  },
  // Course 3 - Scale{Mi}
  {
    id: 'lesson-3-1',
    courseId: 'course-3',
    moduleId: 'mod-3-1',
    title: 'Mindset de Crescimento',
    description: 'A mentalidade necessária para escalar com sucesso.',
    vimeoId: '76979871',
    duration: '22:00',
    order: 1,
    locked: false,
    resources: [],
  },
  {
    id: 'lesson-3-2',
    courseId: 'course-3',
    moduleId: 'mod-3-1',
    title: 'Estruturando para Escala',
    description: 'Como estruturar sua empresa para crescimento sustentável.',
    vimeoId: '76979871',
    duration: '30:00',
    order: 2,
    locked: false,
    resources: [],
  },
  // Course 4 - Auto{Mi}
  {
    id: 'lesson-4-1',
    courseId: 'course-4',
    moduleId: 'mod-4-1',
    title: 'Primeiros Passos na Automação',
    description: 'Introdução às ferramentas e conceitos de automação.',
    vimeoId: '76979871',
    duration: '16:00',
    order: 1,
    locked: false,
    resources: [],
  },
];

// Initial progress
const initialProgress: Progress[] = [
  {
    userId: 'user-1',
    courseId: 'course-1',
    completedLessons: ['lesson-1-1', 'lesson-1-2'],
    currentLesson: 'lesson-1-3',
    startedAt: '2026-01-20',
    lastAccessAt: '2026-01-23',
    progress: 40,
    liked: ['lesson-1-1'],
    disliked: [],
    favorites: ['lesson-1-2'],
  },
];

// Initial comments
const initialComments: Comment[] = [
  {
    id: 'comment-1',
    lessonId: 'lesson-1-1',
    userId: 'user-1',
    text: 'Excelente aula! Muito didática e fácil de entender.',
    createdAt: '2026-01-21T14:30:00Z',
    likes: 5,
  },
  {
    id: 'comment-2',
    lessonId: 'lesson-1-1',
    userId: 'instructor-1',
    text: 'Obrigada pelo feedback! Fico feliz que tenha gostado.',
    createdAt: '2026-01-21T15:00:00Z',
    likes: 2,
  },
];

// Seed function
export function seedData(): void {
  // Only seed if data doesn't exist
  const existingUsers = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
  
  if (existingUsers.length === 0) {
    setToStorage(STORAGE_KEYS.USERS, initialUsers);
    setToStorage(STORAGE_KEYS.COURSES, initialCourses);
    setToStorage(STORAGE_KEYS.LESSONS, initialLessons);
    setToStorage(STORAGE_KEYS.PROGRESS, initialProgress);
    setToStorage(STORAGE_KEYS.COMMENTS, initialComments);
    console.log('✅ Dados iniciais carregados com sucesso!');
  }
}

// Reset data function (for development)
export function resetData(): void {
  setToStorage(STORAGE_KEYS.USERS, initialUsers);
  setToStorage(STORAGE_KEYS.COURSES, initialCourses);
  setToStorage(STORAGE_KEYS.LESSONS, initialLessons);
  setToStorage(STORAGE_KEYS.PROGRESS, initialProgress);
  setToStorage(STORAGE_KEYS.COMMENTS, initialComments);
  console.log('🔄 Dados resetados com sucesso!');
}
