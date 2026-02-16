import React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

const emailStyles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    lineHeight: '1.6',
    color: '#333',
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9fafb',
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  },
  footer: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb',
  },
};

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children, previewText }) => (
  <div style={emailStyles.body}>
    {previewText && (
      <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
        {previewText}
      </div>
    )}
    <div style={emailStyles.container}>
      {children}
    </div>
    <p style={emailStyles.footer}>
      Este é um email automático, não responda a esta mensagem.<br />
      © {new Date().getFullYear()} Time Dom. Todos os direitos reservados.
    </p>
  </div>
);

export const EmailHeader: React.FC<{
  title: string;
  emoji?: string;
  gradient?: string;
}> = ({ title, emoji = '🎉', gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }) => (
  <div style={{
    background: gradient,
    padding: '30px',
    textAlign: 'center',
  }}>
    <h1 style={{ color: 'white', margin: 0, fontSize: '28px' }}>
      {emoji} {title}
    </h1>
  </div>
);

export const EmailBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '30px' }}>
    {children}
  </div>
);

export const EmailButton: React.FC<{
  href: string;
  children: React.ReactNode;
  gradient?: string;
}> = ({ href, children, gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }) => (
  <div style={{ textAlign: 'center', margin: '30px 0' }}>
    <a
      href={href}
      style={{
        background: gradient,
        color: 'white',
        padding: '14px 32px',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '16px',
        display: 'inline-block',
      }}
    >
      {children}
    </a>
  </div>
);

export const EmailAlert: React.FC<{
  children: React.ReactNode;
  variant?: 'warning' | 'danger' | 'success' | 'info';
}> = ({ children, variant = 'warning' }) => {
  const colors = {
    warning: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  };
  const c = colors[variant];
  return (
    <div style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      padding: '16px',
      margin: '20px 0',
      color: c.text,
    }}>
      {children}
    </div>
  );
};

export const EmailSignature: React.FC = () => (
  <p style={{
    fontSize: '14px',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '20px',
    marginBottom: 0,
  }}>
    Qualquer dúvida, estamos à disposição!<br />
    <strong>Equipe HOF Circle</strong>
  </p>
);
