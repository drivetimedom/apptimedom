import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { useSwipeFileCategories, useSwipeFileTypes } from '@/hooks/useSwipeFile';

const ImportProcessesPage = () => {
  const [text, setText] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const { data: categories = [] } = useSwipeFileCategories();
  const { data: types = [] } = useSwipeFileTypes();

  // Find the "Processo" type as default
  const defaultTypeId = useMemo(() => {
    const processo = types.find(t => t.name === 'Processo');
    return processo?.id || '';
  }, [types]);

  const typeId = selectedTypeId || defaultTypeId;

  const processes = useMemo(() =>
    text.split('\n').map(line => line.trim()).filter(line => line.length > 0),
    [text]
  );

  const selectedCategoryName = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId)?.name || 'Nenhuma';
  }, [categories, selectedCategoryId]);

  const handleImport = async () => {
    if (processes.length === 0) {
      toast.error('Cole pelo menos um título de processo!');
      return;
    }

    setIsProcessing(true);

    let successCount = 0;
    let errorCount = 0;

    for (const title of processes) {
      try {
        const { error } = await supabase
          .from('swipe_file_materials')
          .insert({
            title,
            description: '',
            category_id: selectedCategoryId || null,
            type_id: typeId || null,
            tags: [],
            content: '',
            links: [],
            pdfs: [],
          });

        if (error) throw error;
        successCount++;
      } catch (error: any) {
        console.error('Erro ao importar:', title, error);
        errorCount++;
      }
    }

    setIsProcessing(false);

    if (successCount > 0) {
      toast.success(`✅ ${successCount} processo${successCount !== 1 ? 's' : ''} importado${successCount !== 1 ? 's' : ''} com sucesso!`);
    }

    if (errorCount > 0) {
      toast.error(`❌ ${errorCount} processo${errorCount !== 1 ? 's' : ''} falharam`);
    }

    if (successCount > 0) {
      setTimeout(() => navigate('/swipe-file'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/swipe-file')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              📥 Importar Processos em Massa
            </h1>
            <p className="text-muted-foreground">
              Cole a lista de títulos (um por linha) para criar vários processos de uma vez
            </p>
          </div>

          {/* Textarea */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Lista de Títulos</label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"PROCESSO 1\nPROCESSO 2\nPROCESSO 3\n..."}
              className="min-h-[300px] font-mono text-sm"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Um título por linha • {processes.length} processo{processes.length !== 1 ? 's' : ''} detectado{processes.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Categoria Padrão</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar categoria..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Você pode editar a categoria de cada processo depois
            </p>
          </div>

          {/* Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tipo Padrão</label>
            <Select value={typeId} onValueChange={setSelectedTypeId} disabled={isProcessing}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {types.map(type => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview */}
          {processes.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">
                📋 Preview ({processes.length} processo{processes.length !== 1 ? 's' : ''})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {processes.slice(0, 10).map((title, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm p-2 rounded hover:bg-accent/50">
                    <span className="text-muted-foreground font-mono text-xs mt-0.5">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1">{title}</span>
                    <span className="text-xs text-muted-foreground bg-accent px-2 py-0.5 rounded">
                      {selectedCategoryName}
                    </span>
                  </div>
                ))}
                {processes.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2 border-t">
                    ... e mais {processes.length - 10} processo{processes.length - 10 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/swipe-file')}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={isProcessing || processes.length === 0}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar {processes.length} Processo{processes.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Help */}
          <div className="bg-muted/50 rounded-lg p-6 mt-8">
            <h3 className="font-semibold mb-3">💡 Como usar:</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Cole a lista de títulos (um por linha) no campo acima</li>
              <li>2. Escolha a categoria e tipo padrão</li>
              <li>3. Revise o preview dos processos</li>
              <li>4. Clique em "Importar"</li>
              <li>5. Edite cada processo individualmente depois</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportProcessesPage;
