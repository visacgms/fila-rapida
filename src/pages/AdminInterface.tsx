import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  user_id: string;
  nome_completo: string;
  email: string;
  role: 'admin' | 'atendente';
  ativo: boolean;
  senha_temporaria: boolean;
  created_at: string;
}

const AdminInterface = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form states for creating new user
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<'admin' | 'atendente'>('atendente');
  const [isCreating, setIsCreating] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState<'admin' | 'atendente'>('atendente');
  const [isUpdating, setIsUpdating] = useState(false);

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
      
      if (profile?.role !== 'admin') {
        toast({
          title: "Acesso negado",
          description: "Apenas administradores podem acessar esta página",
          variant: "destructive"
        });
        navigate('/console');
        return;
      }

      fetchAllProfiles();
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllProfiles = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setProfiles((profiles || []) as Profile[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const createUser = async () => {
    if (!newUserEmail || !newUserPassword || !newUserName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      // Call the edge function to create user
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: newUserEmail,
          password: newUserPassword,
          nome_completo: newUserName,
          role: newUserRole
        }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Usuário criado com sucesso!",
        description: `${newUserName} foi adicionado como ${newUserRole}`,
      });

      // Reset form
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole('atendente');
      setIsCreateDialogOpen(false);
      
      // Refresh profiles list
      fetchAllProfiles();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Erro ao criar usuário",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ativo: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Status alterado",
        description: `Usuário ${!currentStatus ? 'ativado' : 'desativado'} com sucesso`,
      });

      fetchAllProfiles();
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (profile: Profile) => {
    setEditingProfile(profile);
    setEditUserName(profile.nome_completo);
    setEditUserRole(profile.role);
    setIsEditDialogOpen(true);
  };

  const updateUser = async () => {
    if (!editingProfile || !editUserName) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome_completo: editUserName,
          role: editUserRole
        })
        .eq('user_id', editingProfile.user_id);

      if (error) throw error;

      toast({
        title: "Usuário atualizado com sucesso!",
        description: `${editUserName} foi atualizado`,
      });

      setIsEditDialogOpen(false);
      setEditingProfile(null);
      fetchAllProfiles();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetPassword = async (userId: string, userName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: { user_id: userId }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Senha resetada com sucesso!",
        description: `A senha de ${userName} foi redefinida para "Sesau123"`,
      });

      fetchAllProfiles();
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erro ao resetar senha",
        description: error.message || "Tente novamente",
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg mb-4">Acesso negado</p>
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
            <div className="w-16 h-16 bg-primary-foreground rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-primary">V</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">VISACGMS</h1>
              <p className="text-lg">Painel Administrativo</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">{userProfile.nome_completo}</p>
              <Badge variant="secondary">Administrador</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>Criar Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="Senha temporária"
                    minLength={6}
                  />
                </div>
                <div>
                  <Label htmlFor="role">Função</Label>
                  <Select value={newUserRole} onValueChange={(value: 'admin' | 'atendente') => setNewUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={createUser} 
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Nome Completo</Label>
                  <Input
                    id="edit-name"
                    value={editUserName}
                    onChange={(e) => setEditUserName(e.target.value)}
                    placeholder="Nome completo do usuário"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-role">Função</Label>
                  <Select value={editUserRole} onValueChange={(value: 'admin' | 'atendente') => setEditUserRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="atendente">Atendente</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={updateUser} 
                  className="w-full"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Atualizando..." : "Atualizar Usuário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">{profile.nome_completo}</TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>
                      <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                        {profile.role === 'admin' ? 'Administrador' : 'Atendente'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.ativo ? 'default' : 'destructive'}>
                        {profile.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(profile)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => resetPassword(profile.user_id, profile.nome_completo)}
                        >
                          Resetar Senha
                        </Button>
                        <Button
                          size="sm"
                          variant={profile.ativo ? 'destructive' : 'default'}
                          onClick={() => toggleUserStatus(profile.user_id, profile.ativo)}
                        >
                          {profile.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminInterface;