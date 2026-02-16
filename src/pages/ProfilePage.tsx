import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, TrendingUp, Award, Activity } from 'lucide-react';
import PersonalDataTab from '@/components/profile/PersonalDataTab';
import ProgressTab from '@/components/profile/ProgressTab';
import CertificatesTab from '@/components/profile/CertificatesTab';
import ActivityTab from '@/components/profile/ActivityTab';

const ProfilePage: React.FC = () => {
  return (
    <div className="container py-6 max-w-4xl animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">Gerencie suas informações, acompanhe seu progresso e certificados</p>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="w-full grid grid-cols-4 bg-muted/50 mb-6">
          <TabsTrigger value="dados" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Dados Pessoais</span>
            <span className="sm:hidden">Dados</span>
          </TabsTrigger>
          <TabsTrigger value="progresso" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Meu Progresso</span>
            <span className="sm:hidden">Progresso</span>
          </TabsTrigger>
          <TabsTrigger value="certificados" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Certificados</span>
            <span className="sm:hidden">Certif.</span>
          </TabsTrigger>
          <TabsTrigger value="atividades" className="flex items-center gap-1.5 text-xs sm:text-sm">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Atividades</span>
            <span className="sm:hidden">Ativid.</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dados"><PersonalDataTab /></TabsContent>
        <TabsContent value="progresso"><ProgressTab /></TabsContent>
        <TabsContent value="certificados"><CertificatesTab /></TabsContent>
        <TabsContent value="atividades"><ActivityTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
