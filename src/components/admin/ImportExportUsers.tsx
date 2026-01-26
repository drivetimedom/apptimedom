import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  Upload,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { getFromStorage, setToStorage, STORAGE_KEYS, User, Course, generateId } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ImportExportUsersProps {
  users: User[];
  onUsersChange: (users: User[]) => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

const ImportExportUsers: React.FC<ImportExportUsersProps> = ({ users, onUsersChange }) => {
  const { toast } = useToast();
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get course names helper
  const getCourseNames = (courseIds: string[] | undefined): string => {
    if (!courseIds || courseIds.length === 0) return 'Nenhum';
    const courses = getFromStorage<Course[]>(STORAGE_KEYS.COURSES, []);
    const names = courseIds
      .map(id => courses.find(c => c.id === id)?.title)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : 'Nenhum';
  };

  // Generate temporary password
  const generateTempPassword = (): string => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  // Export to CSV
  const exportCSV = () => {
    const students = users.filter(u => u.type !== 'admin');
    
    let csv = '\ufeff'; // BOM for UTF-8
    csv += 'Nome,Email,Tipo,Status,Cursos Liberados,Data Cadastro\n';
    
    students.forEach(student => {
      const courses = getCourseNames(student.unlockedCourses);
      const status = student.active ? 'Ativo' : 'Inativo';
      const type = student.type === 'instructor' ? 'Instrutor' : 'Aluno';
      const date = new Date(student.createdAt).toLocaleDateString('pt-BR');
      
      csv += `"${student.name}","${student.email}","${type}","${status}","${courses}","${date}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `alunos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({ title: 'CSV exportado com sucesso!' });
  };

  // Export to Excel
  const exportExcel = () => {
    const students = users.filter(u => u.type !== 'admin');
    
    const data = students.map(student => ({
      'Nome': student.name,
      'Email': student.email,
      'Tipo': student.type === 'instructor' ? 'Instrutor' : 'Aluno',
      'Status': student.active ? 'Ativo' : 'Inativo',
      'Cursos Liberados': getCourseNames(student.unlockedCourses),
      'Data de Cadastro': new Date(student.createdAt).toLocaleDateString('pt-BR'),
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Adjust column widths
    ws['!cols'] = [
      { wch: 25 }, // Nome
      { wch: 30 }, // Email
      { wch: 12 }, // Tipo
      { wch: 10 }, // Status
      { wch: 40 }, // Cursos
      { wch: 15 }, // Data
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Alunos');
    
    XLSX.writeFile(wb, `alunos-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    toast({ title: 'Excel exportado com sucesso!' });
  };

  // Download CSV template
  const downloadCSVTemplate = () => {
    const csv = '\ufeffNome,Email,Tipo,Status,Cursos\n' +
                'João Silva,joao@email.com,user,ativo,\n' +
                'Maria Santos,maria@email.com,instrutor,ativo,\n';
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'template-importacao-alunos.csv';
    link.click();
    
    toast({ title: 'Template CSV baixado!' });
  };

  // Download Excel template
  const downloadExcelTemplate = () => {
    const data = [
      { 'Nome': 'João Silva', 'Email': 'joao@email.com', 'Tipo': 'user', 'Status': 'ativo', 'Cursos': '' },
      { 'Nome': 'Maria Santos', 'Email': 'maria@email.com', 'Tipo': 'instrutor', 'Status': 'ativo', 'Cursos': '' },
    ];
    
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 30 },
    ];
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    
    XLSX.writeFile(wb, 'template-importacao-alunos.xlsx');
    
    toast({ title: 'Template Excel baixado!' });
  };

  // Handle file upload
  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande. Máximo 5MB', variant: 'destructive' });
      return;
    }
    
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      processCSV(file);
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      processExcel(file);
    } else {
      toast({ title: 'Formato inválido. Use CSV ou Excel', variant: 'destructive' });
    }
  };

  // Process CSV file
  const processCSV = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
      
      const students: Record<string, string>[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle CSV with quotes properly
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (const char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        
        const student: Record<string, string> = {};
        headers.forEach((header, index) => {
          student[header] = values[index]?.replace(/"/g, '') || '';
        });
        
        students.push(student);
      }
      
      importStudents(students);
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  // Process Excel file
  const processExcel = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json<Record<string, string>>(worksheet);
      
      // Normalize keys to lowercase
      const normalizedData = json.map(row => {
        const normalized: Record<string, string> = {};
        Object.keys(row).forEach(key => {
          normalized[key.toLowerCase()] = String(row[key]);
        });
        return normalized;
      });
      
      importStudents(normalizedData);
    };
    
    reader.readAsArrayBuffer(file);
  };

  // Import students
  const importStudents = (students: Record<string, string>[]) => {
    const currentUsers = [...users];
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];
    
    students.forEach((student, index) => {
      try {
        const name = student.nome || student.name || '';
        const email = student.email || '';
        
        // Validate required fields
        if (!name || !email) {
          errors.push(`Linha ${index + 2}: Nome e Email são obrigatórios`);
          skipped++;
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push(`Linha ${index + 2}: Email inválido`);
          skipped++;
          return;
        }
        
        // Check if already exists
        if (currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
          errors.push(`Linha ${index + 2}: Email já cadastrado (${email})`);
          skipped++;
          return;
        }
        
        // Process courses (if provided)
        let unlockedCourses: string[] = [];
        const coursesField = student.cursos || student.courses || '';
        if (coursesField) {
          unlockedCourses = coursesField.split(',').map(id => id.trim()).filter(Boolean);
        }
        
        // Determine type
        const typeField = (student.tipo || student.type || 'user').toLowerCase();
        const type: 'user' | 'instructor' = typeField === 'instrutor' || typeField === 'instructor' ? 'instructor' : 'user';
        
        // Determine status
        const statusField = (student.status || 'ativo').toLowerCase();
        const active = statusField !== 'inativo' && statusField !== 'inactive';
        
        // Create user
        const newUser: User = {
          id: generateId(),
          name,
          email,
          password: generateTempPassword(),
          type,
          avatar: undefined,
          active,
          unlockedCourses,
          createdAt: new Date().toISOString(),
        };
        
        currentUsers.push(newUser);
        imported++;
        
      } catch (error) {
        errors.push(`Linha ${index + 2}: ${(error as Error).message}`);
        skipped++;
      }
    });
    
    // Save to storage
    if (imported > 0) {
      onUsersChange(currentUsers);
      setToStorage(STORAGE_KEYS.USERS, currentUsers);
    }
    
    // Show results
    setImportResult({ imported, skipped, errors });
    setImportModalOpen(false);
    setResultsModalOpen(true);
    
    if (imported > 0) {
      toast({ title: `${imported} aluno(s) importado(s)!` });
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <>
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border-border">
          <DropdownMenuItem onClick={exportCSV} className="cursor-pointer">
            <FileText className="w-4 h-4 mr-2" />
            Exportar CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportExcel} className="cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Button */}
      <Button variant="outline" className="gap-2" onClick={() => setImportModalOpen(true)}>
        <Upload className="w-4 h-4" />
        Importar
      </Button>

      {/* Import Modal */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Importar Alunos</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-muted-foreground text-sm">
              Selecione um arquivo CSV ou Excel com os dados dos alunos.
            </p>
            
            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                isDragOver 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-foreground font-medium">
                Arraste o arquivo aqui ou clique para selecionar
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Formatos aceitos: .csv, .xlsx
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Tamanho máximo: 5MB
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {/* Templates */}
            <div className="border-t border-border pt-4">
              <p className="text-sm font-medium text-foreground mb-3">
                📋 Templates (Formato Correto)
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadCSVTemplate}
                  className="gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Template CSV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadExcelTemplate}
                  className="gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Template Excel
                </Button>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="bg-accent/30 rounded-lg p-4 text-sm">
              <p className="font-medium text-foreground mb-2">Colunas:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• <strong>Obrigatórias:</strong> Nome, Email</li>
                <li>• <strong>Opcionais:</strong> Tipo (user/instrutor), Status (ativo/inativo), Cursos</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Results Modal */}
      <Dialog open={resultsModalOpen} onOpenChange={setResultsModalOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Importação Concluída</DialogTitle>
          </DialogHeader>
          
          {importResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
                <div>
                  <p className="font-medium text-foreground">
                    {importResult.imported} aluno(s) importado(s) com sucesso
                  </p>
                </div>
              </div>
              
              {importResult.skipped > 0 && (
                <div className="flex items-center gap-3 p-4 bg-warning/10 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-warning" />
                  <div>
                    <p className="font-medium text-foreground">
                      {importResult.skipped} linha(s) ignorada(s)
                    </p>
                  </div>
                </div>
              )}
              
              {importResult.errors.length > 0 && (
                <div className="bg-destructive/10 rounded-lg p-4">
                  <p className="font-medium text-destructive mb-2">Erros encontrados:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li className="text-destructive">
                        ...e mais {importResult.errors.length - 10} erro(s)
                      </li>
                    )}
                  </ul>
                </div>
              )}
              
              <Button 
                onClick={() => setResultsModalOpen(false)} 
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportExportUsers;
