import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

const OnboardingSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold">Cadastro Enviado! 🎉</h1>
          <p className="text-muted-foreground">
            Seus dados foram recebidos com sucesso. Nossa equipe entrará em contato em breve
            para os próximos passos da sua jornada no TIME DOM.
          </p>
          <p className="text-sm text-muted-foreground">
            Você pode fechar esta página.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingSuccess;
