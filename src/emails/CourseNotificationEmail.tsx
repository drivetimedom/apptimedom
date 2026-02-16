import React from 'react';
import { EmailLayout, EmailHeader, EmailBody, EmailButton, EmailAlert, EmailSignature } from './EmailLayout';

interface CourseNotificationEmailProps {
  nome: string;
  courseName: string;
  courseDescription?: string;
  action?: 'unlocked' | 'new_lesson' | 'completed';
}

export const CourseNotificationEmail: React.FC<CourseNotificationEmailProps> = ({
  nome,
  courseName,
  courseDescription,
  action = 'unlocked',
}) => {
  const config = {
    unlocked: {
      emoji: '🔓',
      title: 'Novo Curso Liberado!',
      gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      message: `O curso "${courseName}" foi liberado para você!`,
      cta: 'Acessar Curso',
    },
    new_lesson: {
      emoji: '📚',
      title: 'Nova Aula Disponível!',
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      message: `Uma nova aula foi adicionada ao curso "${courseName}".`,
      cta: 'Assistir Agora',
    },
    completed: {
      emoji: '🏆',
      title: 'Parabéns! Curso Concluído!',
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      message: `Você concluiu o curso "${courseName}"! Continue sua jornada.`,
      cta: 'Ver Certificado',
    },
  };

  const c = config[action];

  return (
    <EmailLayout previewText={`${c.emoji} ${c.message}`}>
      <EmailHeader title={c.title} emoji={c.emoji} gradient={c.gradient} />
      <EmailBody>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
        <p style={{ fontSize: '16px' }}>{c.message}</p>

        {courseDescription && (
          <EmailAlert variant="success">
            <p style={{ margin: 0 }}>{courseDescription}</p>
          </EmailAlert>
        )}

        <EmailButton href="https://apptimedom.lovable.app/my-courses" gradient={c.gradient}>
          {c.cta}
        </EmailButton>

        <EmailSignature />
      </EmailBody>
    </EmailLayout>
  );
};
