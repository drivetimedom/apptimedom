import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OnboardingSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold">Cadastro Enviado! 🎉</h1>

          <p className="text-muted-foreground">
            Recebemos suas informações com sucesso!
          </p>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="font-semibold text-sm">📋 Próximos Passos:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>✅ Cadastro recebido e em análise</li>
              <li>✅ Contrato será gerado em breve</li>
              <li>✅ Você receberá um email com as instruções</li>
              <li>✅ Em caso de dúvidas, entre em contato pelo WhatsApp</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => window.open('https://wa.me/5544998792925', '_blank')}
              className="w-full"
            >
              💬 Falar no WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Voltar ao início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSuccess;
