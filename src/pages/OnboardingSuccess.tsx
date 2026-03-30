import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OnboardingSuccess = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-10">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="http://timedom.com.br/wp-content/uploads/2026/03/LOGO_TIME_DOM-Copia.png"
            alt="Time Dom"
            className="h-10 object-contain"
          />
        </div>

        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-gray-900" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            Cadastro Enviado
          </h1>
          <p className="text-sm text-gray-500">
            Recebemos suas informações com sucesso.
          </p>
        </div>

        {/* Next steps */}
        <div className="bg-gray-50 rounded-lg p-6 text-left space-y-3">
          <p className="text-sm font-medium text-gray-900">Próximos Passos</p>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">—</span>
              Cadastro recebido e em análise
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">—</span>
              Contrato será gerado em breve
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">—</span>
              Você receberá um email com as instruções
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">—</span>
              Em caso de dúvidas, entre em contato pelo WhatsApp
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => window.open('https://wa.me/5544998792925', '_blank')}
            className="w-full h-11 bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium"
          >
            Falar no WhatsApp
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingSuccess;
