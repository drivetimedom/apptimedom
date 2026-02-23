import { useEffect } from 'react';
import { useCustomizationSettings } from './useCustomizationSettings';
import { applyCustomization, defaultCustomization, Customization } from '@/lib/customization';

/**
 * Hook that fetches customization from the database and applies it to the DOM.
 * Returns the resolved customization settings (DB > defaults).
 */
export function useApplyCustomization(): Customization {
  const { data } = useCustomizationSettings();
  const customization = data?.settings || defaultCustomization;

  useEffect(() => {
    applyCustomization(customization);
  }, [customization]);

  return customization;
}
