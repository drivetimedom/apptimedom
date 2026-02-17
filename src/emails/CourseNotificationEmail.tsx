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
      title: 'Novo Curso Liberado!',
      message: `O curso "${courseName}" foi liberado para você!`,
      cta: 'Acessar Curso',
    },
    new_lesson: {
      title: 'Nova Aula Disponível!',
      message: `Uma nova aula foi adicionada ao curso "${courseName}".`,
      cta: 'Assistir Agora',
    },
    completed: {
      title: 'Parabéns! Curso Concluído!',
      message: `Você concluiu o curso "${courseName}"! Continue sua jornada.`,
      cta: 'Ver Certificado',
    },
  };

  const c = config[action];

  return (
    <EmailLayout previewText={c.message}>
      <EmailHeader title={c.title} />
      <EmailBody>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
        <p style={{ fontSize: '16px' }}>{c.message}</p>
        {courseDescription && (
          <EmailAlert variant="success">
            <p style={{ margin: 0 }}>{courseDescription}</p>
          </EmailAlert>
        )}
        <EmailButton href="https://apptimedom.lovable.app/my-courses">
          {c.cta}
        </EmailButton>
        <EmailSignature />
      </EmailBody>
    </EmailLayout>
  );
};
