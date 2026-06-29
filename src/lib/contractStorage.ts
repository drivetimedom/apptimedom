import { supabase } from "@/integrations/supabase/client";

const BUCKET = "generated-contracts";

/**
 * Accepts either a stored path (e.g. "contrato_xxx.docx") OR a legacy public URL
 * pointing to the generated-contracts bucket, and returns the storage path.
 */
export function extractContractPath(value: string): string {
  const marker = `/${BUCKET}/`;
  const idx = value.indexOf(marker);
  if (idx >= 0) return value.substring(idx + marker.length).split("?")[0];
  return value;
}

/**
 * Opens the contract via a short-lived signed URL (bucket is private).
 */
export async function openContract(value: string): Promise<void> {
  const path = extractContractPath(value);
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 10); // 10 minutes
  if (error || !data?.signedUrl) {
    throw error ?? new Error("Não foi possível gerar o link do contrato");
  }
  window.open(data.signedUrl, "_blank");
}
