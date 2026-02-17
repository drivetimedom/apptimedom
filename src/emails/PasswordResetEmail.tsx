import React from 'react';
import { EmailLayout, EmailHeader, EmailBody, EmailButton, EmailAlert, EmailSignature } from './EmailLayout';

interface PasswordResetEmailProps {
  nome: string;
}

export const PasswordResetEmail: React.FC<PasswordResetEmailProps> = ({ nome }) => (
  <EmailLayout previewText={`Sua senha foi redefinida, ${nome}`}>
    <EmailHeader title="Redefinição de Senha" />
    <EmailBody>
      <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
      <p style={{ fontSize: '16px' }}>
        Sua senha no <strong>HOF Circle</strong> foi redefinida por um administrador.
      </p>
      <EmailAlert variant="danger">
        <p style={{ margin: 0 }}>
          <strong>⚠️ Ação necessária:</strong> Entre em contato com o administrador para obter sua nova senha temporária.
        </p>
      </EmailAlert>
      <p style={{ fontSize: '16px' }}>
        Após fazer login com a nova senha, recomendamos que você a altere imediatamente para uma senha de sua preferência.
      </p>
      <EmailButton href="https://apptimedom.lovable.app/login">
        Acessar Plataforma
      </EmailButton>
      <p style={{ fontSize: '14px', color: '#6b7280', borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: 0 }}>
        Se você não solicitou esta redefinição, entre em contato conosco imediatamente.<br />
        <strong>Equipe HOF Circle</strong>
      </p>
    </EmailBody>
  </EmailLayout>
);
