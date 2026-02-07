import { supabase } from '@/integrations/supabase/client';

interface EmailResult {
  success: boolean;
  error?: string;
}

export async function enviarEmailBoasVindas(
  email: string, 
  nome: string, 
  senhaTemporaria?: string
): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('email-boas-vindas', {
      body: { email, nome, senhaTemporaria }
    });

    if (error) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao enviar email:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}

export async function enviarEmailRedefinicaoSenha(
  email: string, 
  nome: string
): Promise<EmailResult> {
  try {
    const { data, error } = await supabase.functions.invoke('email-redefinir-senha', {
      body: { email, nome }
    });

    if (error) {
      console.error('Erro ao enviar email de redefinição:', error);
      return { success: false, error: error.message };
    }

    if (data?.error) {
      return { success: false, error: data.error };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro ao enviar email:', err);
    return { success: false, error: err.message || 'Erro desconhecido' };
  }
}
