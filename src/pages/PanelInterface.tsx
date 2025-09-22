import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import logoVisacgms from "@/assets/logo_visacgms_sem_fundo.png";

interface PasswordData {
  id: number;
  senha: string;
  datahoriochamada: string | null;
  status: string;
  tipo: string;
  atendente: string | null;
  guiche: string | null;
}

const PanelInterface = () => {
  const [currentCall, setCurrentCall] = useState<PasswordData | null>(null);
  const [recentCalls, setRecentCalls] = useState<PasswordData[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playCallSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Campo_Grande'
    });
  };

  const fetchPanelData = async () => {
    try {
      // Get current call (status = 'chamando')
      const { data: currentData } = await supabase
        .from('v_senhas')
        .select('*')
        .eq('status', 'chamando')
        .order('datahoriochamada', { ascending: false })
        .limit(1);

      // Get recent calls (last 4 with datahoriochamada)
      const { data: recentData } = await supabase
        .from('v_senhas')
        .select('*')
        .not('datahoriochamada', 'is', null)
        .neq('status', 'chamando')
        .order('datahoriochamada', { ascending: false })
        .limit(4);

      const newCurrentCall = currentData?.[0] || null;
      
      // Play sound if there's a new call
      if (newCurrentCall && (!currentCall || currentCall.id !== newCurrentCall.id)) {
        playCallSound();
      }
      
      setCurrentCall(newCurrentCall);
      setRecentCalls(recentData || []);
    } catch (error) {
      console.error('Error fetching panel data:', error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchPanelData();

    let timeoutId: NodeJS.Timeout;
    
    // Set up real-time subscription with debouncing
    const channel = supabase
      .channel('panel-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'senhas_normal'
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fetchPanelData(), 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'senhas_prioritario'
        },
        () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => fetchPanelData(), 100);
        }
      )
      .subscribe();

    // Reduced backup interval to 60 seconds since real-time should be working
    const interval = setInterval(fetchPanelData, 60000);

    return () => {
      clearTimeout(timeoutId);
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [currentCall?.id]);

  return (
    <div className="min-h-screen bg-background">
      {/* Audio element for call sound */}
      <audio
        ref={audioRef}
        preload="auto"
        src="/som_de_chamada_de_senha.mp3"
      />

      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          <div className="w-24 h-24 mr-6 flex items-center justify-center">
            <img src={logoVisacgms} alt="Logo VISACGMS" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">VISACGMS</h1>
            <p className="text-xl">Vigilância Sanitária de Campo Grande</p>
          </div>
        </div>
        <h2 className="text-2xl font-semibold">Painel de Chamados</h2>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {/* Current Call */}
        <div className="mb-8">
          {currentCall ? (
            <Card className="bg-primary text-primary-foreground border-primary">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl text-center">Chamando Senha</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-9xl font-bold mb-4 animate-pulse">
                  {currentCall.senha}
                </div>
                <div className="text-2xl mb-2">
                  Chamada: {formatDateTime(currentCall.datahoriochamada)}
                </div>
                {currentCall.guiche && (
                  <div className="text-xl">
                    <strong>Guichê: {currentCall.guiche}</strong>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-muted">
              <CardContent className="text-center py-16">
                <div className="text-4xl font-bold text-muted-foreground">
                  Aguardando próxima chamada...
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Calls History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Histórico de Chamadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4 font-bold text-lg bg-muted p-4 rounded">
              <div>Senha</div>
              <div>Horário da Chamada</div>
              <div>Guichê</div>
            </div>
            {recentCalls.length > 0 ? (
              <div className="space-y-3">
                {recentCalls.map((call, index) => (
                  <div
                    key={`${call.id}-${call.senha}-${index}`}
                    className="grid grid-cols-3 gap-4 p-4 border rounded text-lg"
                  >
                    <div className="font-bold text-xl">
                      {call.senha}
                    </div>
                    <div className="text-muted-foreground">
                      {formatDateTime(call.datahoriochamada)}
                    </div>
                    <div className="font-semibold">
                      {call.guiche || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8 text-xl">
                Nenhuma chamada realizada ainda
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PanelInterface;