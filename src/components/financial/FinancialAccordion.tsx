import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface FinancialAccordionProps {
  icon: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  value: string;
}

const FinancialAccordion: React.FC<FinancialAccordionProps> = ({
  icon,
  title,
  children,
  value,
}) => {
  return (
    <AccordionItem value={value} className="border-[#404040] bg-[#2d2d2d] rounded-lg overflow-hidden">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-[#3a3a3a] transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <span className="font-semibold text-white">{title}</span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="space-y-4">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FinancialAccordion;
