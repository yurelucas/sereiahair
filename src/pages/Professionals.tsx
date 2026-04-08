import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Search, 
  User, 
  Users,
  Trash2, 
  Edit2, 
  Scissors,
  MoreVertical
} from "lucide-react";
import { api } from "@/lib/api";
import { Professional, Service } from "@/types";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "motion/react";

export default function Professionals() {
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    photo: "",
    services: [] as number[]
  });

  const fetchData = async () => {
    try {
      const [p, s] = await Promise.all([api.getProfessionals(), api.getServices()]);
      setProfessionals(p);
      setServices(s);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("O nome é obrigatório.");
      return;
    }

    try {
      if (editingId) {
        await api.updateProfessional(editingId, formData);
        toast.success("Profissional atualizado!");
      } else {
        await api.createProfessional(formData);
        toast.success("Profissional cadastrado!");
      }
      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error("Erro ao salvar profissional.");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteProfessional(id);
      toast.success("Profissional removido.");
      fetchData();
    } catch (error) {
      toast.error("Erro ao remover profissional.");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", photo: "", services: [] });
    setEditingId(null);
  };

  const openEdit = (p: Professional) => {
    setFormData({ name: p.name, photo: p.photo || "", services: p.services });
    setEditingId(p.id);
    setIsDialogOpen(true);
  };

  const toggleService = (id: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(id) 
        ? prev.services.filter(sId => sId !== id)
        : [...prev.services, id]
    }));
  };

  const filteredProfessionals = professionals.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profissionais</h1>
          <p className="text-muted-foreground">Gerencie sua equipe de especialistas.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Novo Profissional
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-primary">
                {editingId ? "Editar Profissional" : "Novo Profissional"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="rounded-xl"
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Serviços Prestados</Label>
                <div className="grid grid-cols-2 gap-3 p-4 bg-accent/30 rounded-xl max-h-48 overflow-y-auto">
                  {services.map(s => (
                    <div key={s.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`s-${s.id}`} 
                        checked={formData.services.includes(s.id)}
                        onCheckedChange={() => toggleService(s.id)}
                      />
                      <label htmlFor={`s-${s.id}`} className="text-sm font-medium leading-none cursor-pointer">
                        {s.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
              <Button onClick={handleSave} className="rounded-xl bg-gradient-to-r from-primary to-secondary">Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Buscar profissional..." 
          className="pl-10 rounded-xl bg-white border-none shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-all group rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <Avatar className="w-16 h-16 rounded-2xl shadow-inner border-2 border-primary/10">
                    <AvatarImage src={p.photo} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                      {p.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(p)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Especialista</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {p.services.map(sId => {
                      const service = services.find(s => s.id === sId);
                      return service ? (
                        <span key={sId} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-accent text-primary">
                          {service.name}
                        </span>
                      ) : null;
                    })}
                    {p.services.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">Nenhum serviço vinculado</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredProfessionals.length === 0 && !loading && (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-primary/40" />
          </div>
          <h3 className="text-xl font-semibold">Nenhum profissional encontrado</h3>
          <p className="text-muted-foreground mt-1">Tente ajustar sua busca ou cadastre um novo profissional.</p>
        </div>
      )}
    </div>
  );
}
