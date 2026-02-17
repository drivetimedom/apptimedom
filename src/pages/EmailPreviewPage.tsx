import React, { useState } from 'react';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { PasswordResetEmail } from '@/emails/PasswordResetEmail';
import { EmailVerificationEmail } from '@/emails/EmailVerificationEmail';
import { CourseNotificationEmail } from '@/emails/CourseNotificationEmail';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Monitor, Smartphone } from 'lucide-react';

const EmailPreviewPage: React.FC = () => {
  const [width, setWidth] = useState<'desktop' | 'mobile'>('desktop');
  const frameWidth = width === 'mobile' ? '375px' : '700px';

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">📧 Email Templates Preview</h1>
            <p className="text-muted-foreground mt-1">Visualize os templates de email antes de enviar</p>
          </div>
          <div className="flex gap-2">
            <Button variant={width === 'desktop' ? 'default' : 'outline'} size="sm" onClick={() => setWidth('desktop')}>
              <Monitor className="h-4 w-4 mr-1" /> Desktop
            </Button>
            <Button variant={width === 'mobile' ? 'default' : 'outline'} size="sm" onClick={() => setWidth('mobile')}>
              <Smartphone className="h-4 w-4 mr-1" /> Mobile
            </Button>
          </div>
        </div>

        <Tabs defaultValue="welcome">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="welcome">Boas-vindas</TabsTrigger>
            <TabsTrigger value="welcome-pwd">Boas-vindas + Senha</TabsTrigger>
            <TabsTrigger value="reset">Redefinir Senha</TabsTrigger>
            <TabsTrigger value="verify">Verificação</TabsTrigger>
            <TabsTrigger value="course">Curso</TabsTrigger>
          </TabsList>

          <TabsContent value="welcome">
            <Card>
              <CardHeader><CardTitle>Email de Boas-vindas (sem senha)</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                  <WelcomeEmail nome="João Silva" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="welcome-pwd">
            <Card>
              <CardHeader><CardTitle>Email de Boas-vindas (com senha temporária)</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                  <WelcomeEmail nome="João Silva" senhaTemporaria="Abc@12345" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reset">
            <Card>
              <CardHeader><CardTitle>Email de Redefinição de Senha</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                  <PasswordResetEmail nome="Maria Santos" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verify">
            <Card>
              <CardHeader><CardTitle>Email de Verificação</CardTitle></CardHeader>
              <CardContent className="flex justify-center">
                <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                  <EmailVerificationEmail nome="Carlos Oliveira" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="course">
            <Card>
              <CardHeader><CardTitle>Notificações de Curso</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-6 flex flex-col items-center">
                  <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                    <CourseNotificationEmail nome="Ana Costa" courseName="Harmonização Facial Avançada" courseDescription="Aprenda técnicas avançadas de harmonização." action="unlocked" />
                  </div>
                  <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                    <CourseNotificationEmail nome="Ana Costa" courseName="Harmonização Facial Avançada" action="new_lesson" />
                  </div>
                  <div style={{ width: frameWidth, transition: 'width 0.3s' }} className="border rounded-lg overflow-hidden">
                    <CourseNotificationEmail nome="Ana Costa" courseName="Harmonização Facial Avançada" action="completed" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EmailPreviewPage;
