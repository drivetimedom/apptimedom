import React from 'react';
import { EmailLayout, EmailHeader, EmailBody, EmailButton, EmailAlert, EmailSignature } from './EmailLayout';

interface PasswordResetEmailProps {
  nome: string;
  novaSenha?: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({
  nome,
  novaSenha,
}) => (
  <EmailLayout previewText={`🔐 Sua senha foi redefinida, ${nome}`}>
    <EmailHeader
      title="Senha Redefinida"
      emoji="🔐"
      gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
    />
    <EmailBody>
      <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
      <p style={{ fontSize: '16px' }}>
        Sua senha foi redefinida com sucesso pelo administrador.
      </p>

      {novaSenha && (
        <EmailAlert variant="warning">
          <p style={{ margin: 0, fontWeight: 'bold' }}>🔑 Nova senha temporária: {novaSenha}</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
            Por segurança, redefina sua senha no primeiro acesso.
          </p>
        </EmailAlert>
      )}

      <EmailButton
        href="https://apptimedom.lovable.app"
        gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
      >
        Acessar Plataforma
      </EmailButton>

      <EmailSignature />
    </EmailBody>
  </EmailLayout>
);
