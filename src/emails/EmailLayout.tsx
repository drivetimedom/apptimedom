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
}> = ({ title }) => (
  <div style={{
    background: '#000000',
    padding: '30px',
    textAlign: 'center' as const,
  }}>
    <img
      src="http://timedom.com.br/wp-content/uploads/2026/02/LOGO_TIME_DOM.png"
      alt="TIME DOM"
      style={{
        maxWidth: '180px',
        height: 'auto',
        display: 'block',
        margin: '0 auto 15px auto',
      }}
    />
    <h1 style={{
      color: 'white',
      margin: 0,
      fontSize: '24px',
      fontWeight: '600',
    }}>
      {title}
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
}> = ({ href, children }) => (
  <div style={{ textAlign: 'center' as const, margin: '30px 0' }}>
    <a
      href={href}
      style={{
        background: '#000000',
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
    warning: { bg: '#F9FAFB', border: '#10B981', text: '#1f2937' },
    danger: { bg: '#fef2f2', border: '#fecaca', text: '#991b1b' },
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534' },
    info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af' },
  };
  const c = colors[variant];
  return (
    <div style={{
      backgroundColor: c.bg,
      border: `1px solid ${c.border}`,
      borderLeft: `4px solid ${c.border}`,
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
    <strong>#timeDom</strong>
  </p>
);
