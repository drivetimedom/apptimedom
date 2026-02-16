import React from 'react';
import { EmailLayout, EmailHeader, EmailBody, EmailButton, EmailAlert, EmailSignature } from './EmailLayout';

interface WelcomeEmailProps {
  nome: string;
  senhaTemporaria?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ nome, senhaTemporaria }) => (
  <EmailLayout previewText={`Bem-vindo ao HOF Circle, ${nome}!`}>
    <EmailHeader title="Bem-vindo ao HOF Circle!" emoji="🎉" />
    <EmailBody>
      <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
      <p style={{ fontSize: '16px' }}>
        Seu acesso ao <strong>HOF Circle</strong> foi liberado com sucesso! 🎊
      </p>

      {senhaTemporaria && (
        <EmailAlert variant="warning">
          <p style={{ margin: 0, fontWeight: 'bold' }}>🔐 Senha temporária: {senhaTemporaria}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Por segurança, redefina sua senha no primeiro acesso.
          </p>
        </EmailAlert>
      )}

      <p style={{ fontSize: '16px' }}>
        Acesse a plataforma e comece sua jornada de transformação na harmonização facial.
      </p>

      <EmailButton href="https://apptimedom.lovable.app">
        Acessar Plataforma
      </EmailButton>

      <EmailSignature />
    </EmailBody>
  </EmailLayout>
);
