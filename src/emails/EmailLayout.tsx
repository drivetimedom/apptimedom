import React from 'react';

interface EmailLayoutProps {
  previewText?: string;
  children: React.ReactNode;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ previewText, children }) => (
  <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: '#f4f4f5', padding: '40px 20px' }}>
    {previewText && (
      <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>{previewText}</div>
    )}
    <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
      {children}
    </div>
    <p style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginTop: '24px' }}>
      © {new Date().getFullYear()} HOF Circle. Todos os direitos reservados.
    </p>
  </div>
);

interface EmailHeaderProps {
  title: string;
  emoji?: string;
  gradient?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({
  title,
  emoji = '✨',
  gradient = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
}) => (
  <div style={{ background: gradient, padding: '32px 24px', textAlign: 'center' }}>
    <div style={{ fontSize: '40px', marginBottom: '12px' }}>{emoji}</div>
    <h1 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700, margin: 0 }}>{title}</h1>
  </div>
);

interface EmailBodyProps {
  children: React.ReactNode;
}

export const EmailBody: React.FC<EmailBodyProps> = ({ children }) => (
  <div style={{ padding: '32px 24px', color: '#374151', lineHeight: 1.6 }}>
    {children}
  </div>
);

interface EmailButtonProps {
  href: string;
  gradient?: string;
  children: React.ReactNode;
}

export const EmailButton: React.FC<EmailButtonProps> = ({
  href,
  gradient = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  children,
}) => (
  <div style={{ textAlign: 'center', margin: '28px 0' }}>
    <a
      href={href}
      style={{
        display: 'inline-block',
        background: gradient,
        color: '#ffffff',
        padding: '14px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '16px',
      }}
    >
      {children}
    </a>
  </div>
);

interface EmailAlertProps {
  variant?: 'info' | 'warning' | 'success';
  children: React.ReactNode;
}

const alertColors: Record<string, { bg: string; border: string }> = {
  info: { bg: '#eff6ff', border: '#3b82f6' },
  warning: { bg: '#fffbeb', border: '#f59e0b' },
  success: { bg: '#f0fdf4', border: '#10b981' },
};

export const EmailAlert: React.FC<EmailAlertProps> = ({ variant = 'info', children }) => {
  const colors = alertColors[variant] || alertColors.info;
  return (
    <div style={{ backgroundColor: colors.bg, borderLeft: `4px solid ${colors.border}`, padding: '16px', borderRadius: '6px', margin: '20px 0' }}>
      {children}
    </div>
  );
};

export const EmailSignature: React.FC = () => (
  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
      Com carinho,<br />
      <strong>Equipe HOF Circle</strong>
    </p>
  </div>
);
