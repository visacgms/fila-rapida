import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logoVisacgms from "@/assets/logo_visacgms_sem_fundo.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-16 h-16 mr-4 flex items-center justify-center">
            <img src={logoVisacgms} alt="Logo VISACGMS" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">VISACGMS</h1>
            <p className="text-lg">Sistema de Gestão de Senhas</p>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Vigilância Sanitária de Campo Grande</h2>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-4">Selecione a Interface</h2>
            <p className="text-muted-foreground">
              Escolha a interface apropriada para seu tipo de uso
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tablet Interface */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-visacgms-blue">
                  Interface Tablet
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl mb-4">📱</div>
                <p className="text-sm text-muted-foreground">
                  Para cidadãos retirarem senhas de atendimento
                </p>
                <Button asChild className="w-full bg-visacgms-blue hover:bg-visacgms-blue/90">
                  <Link to="/tablet">Acessar Tablet</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Panel Interface */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-visacgms-green">
                  Painel de Chamados
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl mb-4">📺</div>
                <p className="text-sm text-muted-foreground">
                  Painel em tempo real para TV/monitor
                </p>
                <Button asChild className="w-full bg-visacgms-green hover:bg-visacgms-green/90">
                  <Link to="/panel">Ver Painel</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Console Interface */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-visacgms-orange">
                  Console do Atendente
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl mb-4">💻</div>
                <p className="text-sm text-muted-foreground">
                  Gerenciamento das chamadas (requer login)
                </p>
                <Button asChild className="w-full bg-visacgms-orange hover:bg-visacgms-orange/90">
                  <Link to="/auth">Fazer Login</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Admin Interface */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-center text-red-600">
                  Painel Administrativo
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="text-6xl mb-4">👤</div>
                <p className="text-sm text-muted-foreground">
                  Gerenciar usuários do sistema (admin apenas)
                </p>
                <Button asChild className="w-full bg-red-600 hover:bg-red-600/90">
                  <Link to="/admin">Painel Admin</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Instruções de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <h4 className="font-semibold mb-2 text-visacgms-blue">Interface Tablet</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Acesso público (sem login)</li>
                    <li>• Retirada de senhas normais</li>
                    <li>• Retirada de senhas prioritárias</li>
                    <li>• Otimizado para tablets</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-visacgms-green">Painel de Chamados</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Acesso público</li>
                    <li>• Atualização em tempo real</li>
                    <li>• Mostra senha atual</li>
                    <li>• Histórico com guichês</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-visacgms-orange">Console do Atendente</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Requer autenticação</li>
                    <li>• Gerencia as chamadas</li>
                    <li>• Controla status das senhas</li>
                    <li>• Seleção de guichê</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-600">Painel Admin</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Apenas administradores</li>
                    <li>• Criar usuários atendentes</li>
                    <li>• Gerenciar permissões</li>
                    <li>• Ativar/desativar contas</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
