import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface InputMoedaProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  tooltip?: string;
  readOnly?: boolean;
  isTotal?: boolean;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  className?: string;
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatPercent = (value: number): string => {
  return `${value.toFixed(1).replace('.', ',')}%`;
};

const InputMoeda: React.FC<InputMoedaProps> = ({
  label,
  value,
  onChange,
  tooltip,
  readOnly = false,
  isTotal = false,
  prefix = 'R$',
  suffix,
  min = 0,
  max,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseNumber = (str: string): number => {
    // Remove tudo exceto números, vírgula e ponto
    const cleaned = str.replace(/[^\d,.-]/g, '');
    // Converte formato brasileiro para número
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    return parseFloat(normalized) || 0;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    let num = parseNumber(displayValue);
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    onChange(num);
    setDisplayValue(formatNumber(num));
  }, [displayValue, onChange, min, max]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    // Seleciona todo o texto ao focar
    if (displayValue) {
      setDisplayValue(value.toString().replace('.', ','));
    }
  }, [value, displayValue]);

  const baseStyles = readOnly
    ? 'bg-[#2d2d2d] text-white cursor-not-allowed'
    : isTotal
    ? 'bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b] font-bold'
    : 'bg-[#3b82f6]/10 border-[#3b82f6] text-white focus:ring-2 focus:ring-[#3b82f6]/50';

  const showEditIcon = !readOnly && !isTotal;

  // Ensure the value never renders underneath suffix/edit icon
  const rightPaddingClass = (() => {
    if (suffix && showEditIcon) return 'pr-16';
    if (suffix) return 'pr-12';
    if (showEditIcon) return 'pr-10';
    return 'pr-3';
  })();

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-[#a0a0a0]">{label}</label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 text-[#a0a0a0] cursor-help hover:text-white transition-colors" />
            </TooltipTrigger>
            <TooltipContent className="bg-[#2d2d2d] border-[#404040] text-white max-w-xs">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-sm">
            {prefix}
          </span>
        )}
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          readOnly={readOnly}
          className={`
            w-full h-10 rounded-lg border px-3 text-right
            ${prefix ? 'pl-10' : 'pl-3'}
            ${rightPaddingClass}
            ${baseStyles}
            border-[#404040] outline-none transition-all
          `}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] text-sm">
            {suffix}
          </span>
        )}
        {showEditIcon && (
          <Pencil
            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-[#3b82f6] ${suffix ? 'right-10' : 'right-3'}`}
          />
        )}
      </div>
    </div>
  );
};

export default InputMoeda;
