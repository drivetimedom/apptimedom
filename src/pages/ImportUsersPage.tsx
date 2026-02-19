import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Papa from 'papaparse';
import { Loader2, Upload, AlertCircle, CheckCircle, Download, ArrowLeft } from 'lucide-react';

const MAX_IMPORT = 50;

interface ImportRow {
  nome: string;
  email: string;
  senha_temporaria?: string;
  cursos?: string;
  acesso_total?: string;
  status?: 'valid' | 'warning' | 'error';
  message?: string;
}

const ImportUsersPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sendEmails, setSendEmails] = useState(true);
  const [autoPassword, setAutoPassword] = useState(true);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Acesso não autorizado</p>
      </div>
    );
  }

  const generatePassword = () => 'hof' + Math.random().toString(36).slice(2, 8);

  const downloadTemplate = () => {
    const template = `nome,email,senha_temporaria,cursos,acesso_total
João Silva,joao@exemplo.com,senha123,,nao
Maria Santos,maria@exemplo.com,,,sim
Pedro Costa,pedro@exemplo.com,pedro456,curso-id-aqui,nao`;

    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-importacao-alunos.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const validateRow = async (row: ImportRow, existingEmails: string[]): Promise<ImportRow> => {
    const validated = { ...row };

    if (!row.nome || !row.email) {
      validated.status = 'error';
      validated.message = 'Nome e email são obrigatórios';
      return validated;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email.trim())) {
      validated.status = 'error';
      validated.message = 'Email inválido';
      return validated;
    }

    if (existingEmails.includes(row.email.trim().toLowerCase())) {
      validated.status = 'warning';
      validated.message = 'Email já existe no sistema';
      return validated;
    }

    if (!row.senha_temporaria && autoPassword) {
      validated.senha_temporaria = generatePassword();
    }

    validated.status = 'valid';
    validated.message = validated.senha_temporaria ? `Senha: ${validated.senha_temporaria}` : undefined;
    return validated;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as ImportRow[];

        if (rows.length > MAX_IMPORT) {
          toast({
            title: `Limite excedido!`,
            description: `Máximo de ${MAX_IMPORT} alunos por importação. Seu arquivo tem ${rows.length}.`,
            variant: 'destructive',
          });
          setFile(null);
          return;
        }

        // Get existing emails for duplicate check
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email');
        const existingEmails = (profiles || []).map(p => (p.email || '').toLowerCase());

        const validated = await Promise.all(
          rows.map((row) => validateRow(row, existingEmails))
        );

        setPreview(validated);
      },
      error: (error) => {
        toast({ title: 'Erro ao ler CSV', description: error.message, variant: 'destructive' });
      },
    });
  };

  const handleImport = async () => {
    setIsProcessing(true);
    const validRows = preview.filter(r => r.status === 'valid');
    let successCount = 0;
    const errors: string[] = [];

    for (const row of validRows) {
      try {
        const senha = row.senha_temporaria || generatePassword();

        // Create user via edge function (uses service role)
        const { data, error } = await supabase.functions.invoke('create-admin-user', {
          body: {
            email: row.email.trim(),
            password: senha,
            name: row.nome.trim(),
            role: 'user',
          },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        const userId = data?.userId;

        // Unlock courses if specified
        if (userId) {
          if (row.acesso_total?.toLowerCase() === 'sim') {
            const { data: allCourses } = await supabase
              .from('courses')
              .select('id');
            
            if (allCourses && allCourses.length > 0) {
              await supabase
                .from('profiles')
                .update({ unlocked_courses: allCourses.map(c => c.id) })
                .eq('user_id', userId);
            }
          } else if (row.cursos) {
            const courseIds = row.cursos.split(',').map(id => id.trim()).filter(Boolean);
            if (courseIds.length > 0) {
              await supabase
                .from('profiles')
                .update({ unlocked_courses: courseIds })
                .eq('user_id', userId);
            }
          }

          // Send welcome email
          if (sendEmails) {
            try {
              await supabase.functions.invoke('email-boas-vindas', {
                body: { email: row.email.trim(), nome: row.nome.trim(), senhaTemporaria: senha },
              });
            } catch (e) {
              console.warn('Email failed for:', row.email, e);
            }
          }
        }

        successCount++;
      } catch (error: any) {
        console.error('Import error:', row.email, error);
        errors.push(`${row.email}: ${error.message || 'Erro desconhecido'}`);
      }
    }

    setIsProcessing(false);
    setImportResult({ success: successCount, errors });

    if (successCount > 0) {
      toast({ title: `✅ ${successCount} aluno(s) importado(s) com sucesso!` });
    }
    if (errors.length > 0) {
      toast({ title: `${errors.length} falha(s) na importação`, variant: 'destructive' });
    }
  };

  const validCount = preview.filter(r => r.status === 'valid').length;
  const warningCount = preview.filter(r => r.status === 'warning').length;
  const errorCount = preview.filter(r => r.status === 'error').length;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">📥 Importar Alunos em Massa</h1>
            <p className="text-sm text-muted-foreground">Máximo: {MAX_IMPORT} alunos por importação</p>
          </div>
        </div>

        {/* Import Result */}
        {importResult && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-3">
            <h3 className="font-semibold text-foreground">Resultado da Importação</h3>
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              <p className="text-foreground font-medium">{importResult.success} aluno(s) importado(s)</p>
            </div>
            {importResult.errors.length > 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg space-y-2">
                <p className="font-medium text-destructive">{importResult.errors.length} erro(s):</p>
                <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <Button onClick={() => navigate('/admin')} className="w-full">
              Voltar ao Painel Admin
            </Button>
          </div>
        )}

        {/* Upload Area */}
        {!importResult && (
          <>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-card rounded-xl border-2 border-dashed border-border hover:border-muted-foreground cursor-pointer p-10 text-center transition-colors"
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium">Selecione um arquivo CSV</p>
              <p className="text-sm text-muted-foreground mt-1">ou arraste aqui (máx. {MAX_IMPORT} alunos)</p>
              {file && (
                <p className="text-sm text-primary mt-3">📄 {file.name}</p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Download Template */}
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" />
              Baixar Template CSV
            </Button>

            {/* Preview */}
            {preview.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h3 className="font-semibold text-foreground">
                  📋 Preview ({preview.length <= 10 ? 'todos' : 'primeiros 10'} registros)
                </h3>

                <div className="space-y-2">
                  {preview.slice(0, 10).map((row, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-accent/30">
                      {row.status === 'valid' && <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />}
                      {row.status === 'warning' && <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />}
                      {row.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{row.nome} - {row.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.acesso_total?.toLowerCase() === 'sim'
                            ? '🔓 Acesso Total'
                            : row.cursos
                            ? `📚 Cursos: ${row.cursos.split(',').length}`
                            : '📚 Sem cursos'}
                          {' | '}
                          🔑 Senha: {row.senha_temporaria || 'auto-gerada'}
                        </p>
                        {row.message && (
                          <p className="text-xs text-muted-foreground mt-1">ℹ️ {row.message}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {preview.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ... e mais {preview.length - 10} registros
                    </p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-muted-foreground">Total: {preview.length}/{MAX_IMPORT}</span>
                  <span className="text-success">✅ Válidos: {validCount}</span>
                  {warningCount > 0 && <span className="text-warning">⚠️ Avisos: {warningCount}</span>}
                  {errorCount > 0 && <span className="text-destructive">❌ Erros: {errorCount}</span>}
                </div>

                {/* Options */}
                <div className="space-y-3 border-t border-border pt-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmails}
                      onChange={(e) => setSendEmails(e.target.checked)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Enviar email de boas-vindas</p>
                      <p className="text-xs text-muted-foreground">Cada aluno receberá um email com suas credenciais</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPassword}
                      onChange={(e) => setAutoPassword(e.target.checked)}
                      className="w-4 h-4 mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">Gerar senha automaticamente</p>
                      <p className="text-xs text-muted-foreground">Cria senha quando não informada no CSV</p>
                    </div>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => { setFile(null); setPreview([]); }}
                    disabled={isProcessing}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={isProcessing || validCount === 0}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importando {validCount} alunos...
                      </>
                    ) : (
                      `Importar ${validCount} ${validCount === 1 ? 'Aluno' : 'Alunos'}`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Help */}
            {!file && (
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-medium text-foreground mb-3">📖 Como usar:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Baixe o template CSV acima</li>
                  <li>Preencha com os dados dos alunos (máx. {MAX_IMPORT})</li>
                  <li>Faça upload do arquivo preenchido</li>
                  <li>Revise o preview e clique em "Importar"</li>
                </ol>
                <div className="mt-4 p-3 bg-accent/30 rounded-lg text-sm">
                  <p className="font-medium text-foreground mb-1">Colunas do CSV:</p>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• <strong>Obrigatórias:</strong> nome, email</li>
                    <li>• <strong>Opcionais:</strong> senha_temporaria, cursos (IDs separados por vírgula), acesso_total (sim/nao)</li>
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImportUsersPage;
