import React from 'react';
import { EmailLayout, EmailHeader, EmailBody, EmailButton, EmailAlert, EmailSignature } from './EmailLayout';

interface EmailVerificationEmailProps {
  nome: string;
  verificationLink?: string;
}

export const EmailVerificationEmail: React.FC<EmailVerificationEmailProps> = ({
  nome,
  verificationLink = 'https://apptimedom.lovable.app/verify',
}) => (
  <EmailLayout previewText={`Verifique seu email, ${nome}`}>
    <EmailHeader title="Verifique seu Email" />
    <EmailBody>
      <h2 style={{ color: '#1f2937', marginTop: 0 }}>Olá {nome}!</h2>
      <p style={{ fontSize: '16px' }}>
        Para concluir seu cadastro no <strong>HOF Circle</strong>, confirme seu endereço de email clicando no botão abaixo.
      </p>
      <EmailButton href={verificationLink}>
        Verificar Email
      </EmailButton>
      <EmailAlert variant="info">
        <p style={{ margin: 0 }}>
          <strong>ℹ️ Importante:</strong> Este link expira em 24 horas. Se não funcionar, copie e cole a URL abaixo no seu navegador.
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '12px', wordBreak: 'break-all' as const }}>
          {verificationLink}
        </p>
      </EmailAlert>
      <EmailSignature />
    </EmailBody>
  </EmailLayout>
);
