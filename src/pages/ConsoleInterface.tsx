import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { PasswordChangeDialog } from "@/components/PasswordChangeDialog";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import type { User, Session } from '@supabase/supabase-js';
import logoVisacgms from "@/assets/logo_visacgms_sem_fundo.png";

interface PasswordData {
  id: number;
  senha: string;
  datahoriochamada: string | null;
  atendente: string | null;
  status: string;
  local: string | null;
  datahorastatus: string | null;
  tipo: string;
  guiche: string | null;
}

interface Profile {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  role: 'admin' | 'atendente';
  ativo: boolean;
  senha_temporaria: boolean;
}

const ConsoleInterface = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [currentPassword, setCurrentPassword] = useState<PasswordData | null>(null);
  const [queueStats, setQueueStats] = useState({ normal: 0, priority: 0 });
  const [recentCalls, setRecentCalls] = useState<PasswordData[]>([]);
  const [manualPassword, setManualPassword] = useState("");
  const [location, setLocation] = useState("Guichê 1");
  const [isLoading, setIsLoading] = useState(true);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate('/auth');
        } else {
          fetchUserProfile(session.user.id);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
      } else {
        fetchUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      setUserProfile(profile as Profile);
      
      if (profile?.role === 'admin') {
        navigate('/admin');
        return;
      }

      if (!profile?.ativo) {
        toast({
          title: "Conta desativada",
          description: "Sua conta foi desativada. Contate o administrador.",
          variant: "destructive"
        });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }

      // Check if password needs to be changed
      if (profile?.senha_temporaria) {
        setShowPasswordChange(true);
        return;
      }

      fetchConsoleData();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
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

  const fetchConsoleData = async () => {
    if (!userProfile) return;
    
    try {
      // Get current password being handled by this attendant
      const { data: currentData } = await supabase
        .from('v_senhas')
        .select('*')
        .eq('status', 'chamando')
        .eq('atendente', userProfile.nome_completo)
        .maybeSingle();

      // Get queue statistics
      const { data: normalQueue } = await supabase
        .from('senhas_normal')
        .select('id')
        .eq('status', 'aguardando');

      const { data: priorityQueue } = await supabase
        .from('senhas_prioritario')
        .select('id')
        .eq('status', 'aguardando');

      // Get recent calls
      const { data: recentData } = await supabase
        .from('v_senhas')
        .select('*')
        .not('datahoriochamada', 'is', null)
        .order('datahoriochamada', { ascending: false })
        .limit(5);

      setCurrentPassword(currentData || null);
      setQueueStats({
        normal: normalQueue?.length || 0,
        priority: priorityQueue?.length || 0
      });
      setRecentCalls(recentData || []);
    } catch (error) {
      console.error('Error fetching console data:', error);
    }
  };

  const callNext = async (type: 'normal' | 'priority') => {
    if (!userProfile || !session) return;
    
    try {
      const table = type === 'normal' ? 'senhas_normal' : 'senhas_prioritario';
      
      // Get next password in queue
      const { data: nextPassword } = await supabase
        .from(table)
        .select('*')
        .eq('status', 'aguardando')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!nextPassword) {
        toast({
          title: "Fila vazia",
          description: `Não há senhas ${type === 'normal' ? 'normais' : 'prioritárias'} aguardando`,
          variant: "destructive"
        });
        return;
      }

      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      // Update password status
      const { error } = await supabase
        .from(table)
        .update({
          status: 'chamando',
          datahoriochamada: new Date().toISOString(),
          atendente: userProfile.nome_completo,
          local: location,
          guiche: location,
          datahorastatus: new Date().toISOString()
        })
        .eq('id', nextPassword.id);

      if (error) throw error;

      toast({
        title: "Senha chamada",
        description: `Chamando senha ${nextPassword.senha}`,
      });

      fetchConsoleData();
    } catch (error) {
      console.error('Error calling next password:', error);
      toast({
        title: "Erro ao chamar senha",
        description: "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const repeatCall = async () => {
    if (!currentPassword || !session) {
      toast({
        title: "Nenhuma senha ativa",
        description: "Não há senha para repetir chamada",
        variant: "destructive"
      });
      return;
    }

    try {
      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const table = currentPassword.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { error } = await supabase
        .from(table)
        .update({
          datahoriochamada: new Date().toISOString(),
        })
        .eq('id', currentPassword.id);

      if (error) throw error;

      toast({
        title: "Chamada repetida",
        description: `Repetindo chamada da senha ${currentPassword.senha}`,
      });

      fetchConsoleData();
    } catch (error) {
      console.error('Error repeating call:', error);
      toast({
        title: "Erro ao repetir chamada",
        variant: "destructive"
      });
    }
  };

  const markAbsent = async () => {
    if (!currentPassword || !session) return;

    try {
      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const table = currentPassword.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { error } = await supabase
        .from(table)
        .update({
          status: 'ausente',
          datahorastatus: new Date().toISOString()
        })
        .eq('id', currentPassword.id);

      if (error) throw error;

      toast({
        title: "Senha marcada como ausente",
        description: `Senha ${currentPassword.senha} marcada como ausente`,
      });

      setCurrentPassword(null);
      fetchConsoleData();
    } catch (error) {
      console.error('Error marking absent:', error);
      toast({
        title: "Erro ao marcar ausente",
        variant: "destructive"
      });
    }
  };

  const finishService = async () => {
    if (!currentPassword || !session) return;

    try {
      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const table = currentPassword.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { error } = await supabase
        .from(table)
        .update({
          status: 'atendida',
          datahorastatus: new Date().toISOString()
        })
        .eq('id', currentPassword.id);

      if (error) throw error;

      toast({
        title: "Atendimento finalizado",
        description: `Senha ${currentPassword.senha} atendida com sucesso`,
      });

      setCurrentPassword(null);
      fetchConsoleData();
    } catch (error) {
      console.error('Error finishing service:', error);
      toast({
        title: "Erro ao finalizar atendimento",
        variant: "destructive"
      });
    }
  };

  const transferQueue = async (targetType: 'normal' | 'priority') => {
    if (!currentPassword) return;

    try {
      const sourceTable = currentPassword.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      const targetTable = targetType === 'normal' ? 'senhas_normal' : 'senhas_prioritario';

      // Mark current as transferred
      await supabase
        .from(sourceTable)
        .update({
          status: 'transferida',
          datahorastatus: new Date().toISOString()
        })
        .eq('id', currentPassword.id);

      // Create new password in target queue
      await supabase
        .from(targetTable)
        .insert({ senha: '' }); // Let trigger handle the password generation

      toast({
        title: "Senha transferida",
        description: `Senha transferida para fila ${targetType === 'normal' ? 'normal' : 'prioritária'}`,
      });

      setCurrentPassword(null);
      fetchConsoleData();
    } catch (error) {
      console.error('Error transferring queue:', error);
      toast({
        title: "Erro ao transferir senha",
        variant: "destructive"
      });
    }
  };

  const callManual = async () => {
    if (!manualPassword || !userProfile || !session) return;

    try {
      // Ensure we have a valid session before updating
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente",
          variant: "destructive"
        });
        navigate('/auth');
        return;
      }

      const isNormal = manualPassword.startsWith('N-');
      const table = isNormal ? 'senhas_normal' : 'senhas_prioritario';

      // Find the password
      const { data: password } = await supabase
        .from(table)
        .select('*')
        .eq('senha', manualPassword)
        .in('status', ['aguardando', 'ausente'])
        .single();

      if (!password) {
        toast({
          title: "Senha não encontrada",
          description: "Senha não existe ou já foi atendida",
          variant: "destructive"
        });
        return;
      }

      // Update password status
      const { error } = await supabase
        .from(table)
        .update({
          status: 'chamando',
          datahoriochamada: new Date().toISOString(),
          atendente: userProfile.nome_completo,
          local: location,
          guiche: location,
          datahorastatus: new Date().toISOString()
        })
        .eq('id', password.id);

      if (error) throw error;

      toast({
        title: "Senha chamada manualmente",
        description: `Chamando senha ${manualPassword}`,
      });

      setManualPassword("");
      fetchConsoleData();
    } catch (error) {
      console.error('Error calling manual password:', error);
      toast({
        title: "Erro ao chamar senha",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) {
        console.error('Logout error:', error);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate('/auth');
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    // Refresh profile to get updated senha_temporaria status
    if (user) {
      fetchUserProfile(user.id);
    }
  };

  const repeatCallFromHistory = async (passwordData: PasswordData) => {
    if (!session) {
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      const table = passwordData.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { error } = await supabase
        .from(table)
        .update({
          datahoriochamada: new Date().toISOString(),
        })
        .eq('id', passwordData.id);

      if (error) throw error;

      toast({
        title: "Chamada repetida",
        description: `Repetindo chamada da senha ${passwordData.senha}`,
      });

      fetchConsoleData();
    } catch (error) {
      console.error('Error repeating call from history:', error);
      toast({
        title: "Erro ao repetir chamada",
        variant: "destructive"
      });
    }
  };

  const finishServiceFromHistory = async (passwordData: PasswordData) => {
    if (!session) {
      toast({
        title: "Sessão expirada",
        description: "Faça login novamente",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      const table = passwordData.tipo === 'N' ? 'senhas_normal' : 'senhas_prioritario';
      
      const { error } = await supabase
        .from(table)
        .update({
          status: 'atendida',
          datahorastatus: new Date().toISOString()
        })
        .eq('id', passwordData.id);

      if (error) throw error;

      toast({
        title: "Atendimento finalizado",
        description: `Senha ${passwordData.senha} atendida com sucesso`,
      });

      fetchConsoleData();
    } catch (error) {
      console.error('Error finishing service from history:', error);
      toast({
        title: "Erro ao finalizar atendimento",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (userProfile) {
      fetchConsoleData();

      let timeoutId: NodeJS.Timeout;
      
      // Set up real-time subscription with debouncing
      const channel = supabase
        .channel('console-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'senhas_normal'
          },
          () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fetchConsoleData(), 100);
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
            timeoutId = setTimeout(() => fetchConsoleData(), 100);
          }
        )
        .subscribe();

      return () => {
        clearTimeout(timeoutId);
        supabase.removeChannel(channel);
      };
    }
  }, [userProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Erro ao carregar perfil do usuário</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-16 h-16 mr-4 flex items-center justify-center">
              <img src={logoVisacgms} alt="Logo VISACGMS" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">VISACGMS</h1>
              <p className="text-lg">Console do Atendente – Abertura de Processos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{userProfile.nome_completo}</p>
              <Badge variant="secondary">Atendente</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Settings */}
      <div className="p-4 bg-muted border-b">
        <div className="flex gap-4 items-center justify-center">
          <div>
            <Label htmlFor="location">Guichê</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Guichê 1">Guichê 1</SelectItem>
                <SelectItem value="Guichê 2">Guichê 2</SelectItem>
                <SelectItem value="Guichê 3">Guichê 3</SelectItem>
                <SelectItem value="Guichê 4">Guichê 4</SelectItem>
                <SelectItem value="Guichê 5">Guichê 5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Controls */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Controles de Chamada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full h-16 text-lg bg-visacgms-blue hover:bg-visacgms-blue/90"
                onClick={() => callNext('normal')}
              >
                Chamar Próximo – Normal
              </Button>
              <Button
                className="w-full h-16 text-lg bg-visacgms-orange hover:bg-visacgms-orange/90"
                onClick={() => callNext('priority')}
              >
                Chamar Próximo – Prioritário
              </Button>
              <Button
                className="w-full h-12"
                variant="outline"
                onClick={repeatCall}
                disabled={!currentPassword}
              >
                Repetir Chamada
              </Button>
              <Button
                className="w-full h-12"
                variant="destructive"
                onClick={markAbsent}
                disabled={!currentPassword}
              >
                Marcar Ausente
              </Button>
              <Button
                className="w-full h-12 bg-visacgms-green hover:bg-visacgms-green/90"
                onClick={finishService}
                disabled={!currentPassword}
              >
                Finalizar Atendimento
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Especiais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Transferir Fila</Label>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => transferQueue('normal')}
                    disabled={!currentPassword}
                  >
                    Para Normal
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => transferQueue('priority')}
                    disabled={!currentPassword}
                  >
                    Para Prioritário
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="manual">Chamada Manual</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="manual"
                    placeholder="Ex: N-0001"
                    value={manualPassword}
                    onChange={(e) => setManualPassword(e.target.value)}
                  />
                  <Button onClick={callManual}>Chamar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Information */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Senha Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPassword ? (
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {currentPassword.senha}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Horário:</strong> {formatDateTime(currentPassword.datahoriochamada)}
                    </div>
                    <div>
                      <strong>Atendente:</strong> {currentPassword.atendente}
                    </div>
                    <div>
                      <strong>Status:</strong>{" "}
                      <Badge variant={currentPassword.status === 'chamando' ? 'default' : 'secondary'}>
                        {currentPassword.status}
                      </Badge>
                    </div>
                    <div>
                      <strong>Guichê:</strong> {currentPassword.guiche || currentPassword.local}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhuma senha em atendimento
                </div>
              )}
            </CardContent>
          </Card>

          {/* Queue Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Fila Normal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-visacgms-blue">
                  {queueStats.normal}
                </div>
                <p className="text-center">aguardando</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Fila Prioritária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-center text-visacgms-orange">
                  {queueStats.priority}
                </div>
                <p className="text-center">aguardando</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Calls */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Chamadas</CardTitle>
            </CardHeader>
            <CardContent>
              {recentCalls.length > 0 ? (
                <div className="space-y-2">
                  {recentCalls.map((call, index) => (
                    <div
                      key={`${call.id}-${call.senha}-${index}`}
                      className="flex justify-between items-center p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-bold">{call.senha}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(call.datahoriochamada)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{call.status}</Badge>
                        {call.status === 'chamando' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => repeatCallFromHistory(call)}
                            className="h-8 w-8 p-0"
                            title="Repetir chamada"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {call.status === 'chamando' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => finishServiceFromHistory(call)}
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Finalizar atendimento"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Nenhuma chamada realizada ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <PasswordChangeDialog
        isOpen={showPasswordChange}
        onClose={() => {}}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
};

export default ConsoleInterface;