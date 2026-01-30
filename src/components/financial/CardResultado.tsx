import React from 'react';
import { formatCurrency } from './InputMoeda';
import { Check, X, AlertTriangle } from 'lucide-react';

type CardVariant = 'default' | 'total' | 'success' | 'danger' | 'warning';

interface CardResultadoProps {
  title: string;
  value: number | string;
  subtitle?: string;
  variant?: CardVariant;
  icon?: React.ReactNode;
  isCurrency?: boolean;
  isPercent?: boolean;
  className?: string;
}

const CardResultado: React.FC<CardResultadoProps> = ({
  title,
  value,
  subtitle,
  variant = 'default',
  icon,
  isCurrency = true,
  isPercent = false,
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'total':
        return 'bg-[#f59e0b]/10 border-[#f59e0b]';
      case 'success':
        return 'bg-[#10b981]/10 border-[#10b981]';
      case 'danger':
        return 'bg-[#ef4444]/10 border-[#ef4444]';
      case 'warning':
        return 'bg-[#f59e0b]/10 border-[#f59e0b]';
      default:
        return 'bg-[#2d2d2d] border-[#404040]';
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'total':
        return 'text-[#f59e0b]';
      case 'success':
        return 'text-[#10b981]';
      case 'danger':
        return 'text-[#ef4444]';
      case 'warning':
        return 'text-[#f59e0b]';
      default:
        return 'text-white';
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case 'success':
        return <Check className="w-5 h-5 text-[#10b981]" />;
      case 'danger':
        return <X className="w-5 h-5 text-[#ef4444]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />;
      default:
        return null;
    }
  };

  const formatValue = () => {
    if (typeof value === 'string') return value;
    if (isPercent) return `${value.toFixed(1).replace('.', ',')}%`;
    if (isCurrency) return formatCurrency(value);
    return value.toString();
  };

  return (
    <div
      className={`
        rounded-lg border p-4 transition-all
        ${getVariantStyles()}
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-[#a0a0a0] mb-1">{title}</p>
          <p className={`text-2xl font-bold ${getValueColor()}`}>
            {formatValue()}
          </p>
          {subtitle && (
            <p className="text-xs text-[#a0a0a0] mt-1">{subtitle}</p>
          )}
        </div>
        {getIcon() && (
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardResultado;
