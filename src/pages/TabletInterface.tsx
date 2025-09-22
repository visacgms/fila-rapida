import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logoVisacgms from "@/assets/logo_visacgms_sem_fundo.png";

const TabletInterface = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePassword = async (type: 'normal' | 'priority') => {
    setIsLoading(type);
    try {
      const table = type === 'normal' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { data, error } = await supabase
        .from(table)
        .insert({ senha: '' }) // Let trigger handle the password generation
        .select()
        .single();

      if (error) throw error;

      setCurrentPassword(data.senha);
      
      toast({
        title: "Senha gerada com sucesso!",
        description: `Sua senha é ${data.senha}`,
      });

      // Clear password display after 10 seconds
      setTimeout(() => setCurrentPassword(null), 10000);
      
    } catch (error) {
      console.error('Error generating password:', error);
      toast({
        title: "Erro ao gerar senha",
        description: "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-20 h-20 mr-4 flex items-center justify-center">
            <img src={logoVisacgms} alt="Logo VISACGMS" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">VISACGMS</h1>
            <p className="text-lg">Vigilância Sanitária de Campo Grande</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Atendimento para Abertura de Processos</h2>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        {!currentPassword ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Atendimento Normal</h3>
                <Button
                  size="lg"
                  className="w-full h-32 text-2xl font-bold bg-visacgms-blue hover:bg-visacgms-blue/90"
                  onClick={() => generatePassword('normal')}
                  disabled={isLoading === 'normal'}
                >
                  {isLoading === 'normal' ? 'Gerando...' : 'Retirar Senha Normal'}
                </Button>
                <p className="text-muted-foreground mt-4">
                  Para atendimentos convencionais
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-6 text-foreground">Atendimento Prioritário</h3>
                <Button
                  size="lg"
                  className="w-full h-32 text-2xl font-bold bg-visacgms-orange hover:bg-visacgms-orange/90"
                  onClick={() => generatePassword('priority')}
                  disabled={isLoading === 'priority'}
                >
                  {isLoading === 'priority' ? 'Gerando...' : 'Retirar Senha Prioritária'}
                </Button>
                <p className="text-muted-foreground mt-4">
                  Para idosos, gestantes, pessoas com deficiência
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="w-full max-w-2xl">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-8 text-foreground">Sua senha é:</h3>
              <div className="text-8xl font-bold text-primary mb-8">
                {currentPassword}
              </div>
              <div className="space-y-4">
                <p className="text-2xl text-foreground">Aguarde ser chamado</p>
                <p className="text-lg text-muted-foreground">
                  Acompanhe o painel de chamados
                </p>
              </div>
              <Button
                className="mt-8 text-lg px-8 py-4"
                onClick={() => setCurrentPassword(null)}
              >
                Nova Senha
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TabletInterface;