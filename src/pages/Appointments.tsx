import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Scissors,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { api } from "@/lib/api";
import { Appointment, Client, Professional, Service } from "@/types";
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function Appointments() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  // Form state
  const [newApp, setNewApp] = React.useState({
    clientId: "",
    professionalId: "",
    serviceId: "",
    time: ""
  });

  const fetchData = async () => {
    try {
      const [a, c, p, s] = await Promise.all([
        api.getAppointments(),
        api.getClients(),
        api.getProfessionals(),
        api.getServices()
      ]);
      setAppointments(a);
      setClients(c);
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

  const handleCreate = async () => {
    if (!newApp.clientId || !newApp.professionalId || !newApp.serviceId || !newApp.time) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      setLoading(true);
      await api.createAppointment({
        ...newApp,
        clientId: parseInt(newApp.clientId),
        professionalId: parseInt(newApp.professionalId),
        serviceId: parseInt(newApp.serviceId),
        date: format(selectedDate, "yyyy-MM-dd")
      });
      toast.success("Agendamento realizado com sucesso!");
      setIsDialogOpen(false);
      setShowConfirm(false);
      setNewApp({ clientId: "", professionalId: "", serviceId: "", time: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const [showConfirm, setShowConfirm] = React.useState(false);

  const handlePreSave = () => {
    if (!newApp.clientId || !newApp.professionalId || !newApp.serviceId || !newApp.time) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }
    setShowConfirm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteAppointment(id);
      toast.success("Agendamento cancelado.");
      fetchData();
    } catch (error) {
      toast.error("Erro ao cancelar agendamento.");
    }
  };

  const filteredAppointments = appointments.filter(app => 
    app.date === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Agenda</h1>
          <p className="text-muted-foreground">Gerencie os horários e atendimentos do salão.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif text-primary">Novo Agendamento</DialogTitle>
              <p className="text-muted-foreground text-sm">
                Preencha os dados para reservar um horário em {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}.
              </p>
            </DialogHeader>
            <AnimatePresence mode="wait">
              {!showConfirm ? (
                <motion.div 
                  key="form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid gap-4 py-4"
                >
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <Select value={newApp.clientId} onValueChange={(v) => setNewApp({ ...newApp, clientId: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione a cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map(c => (
                          <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Profissional</Label>
                    <Select value={newApp.professionalId} onValueChange={(v) => setNewApp({ ...newApp, professionalId: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map(p => (
                          <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Serviço</Label>
                    <Select value={newApp.serviceId} onValueChange={(v) => setNewApp({ ...newApp, serviceId: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map(s => (
                          <SelectItem key={s.id} value={s.id.toString()}>{s.name} ({s.duration} min)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Horário</Label>
                    <Select value={newApp.time} onValueChange={(v) => setNewApp({ ...newApp, time: v })}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecione o horário" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="py-6 space-y-4"
                >
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                    <p className="text-sm"><strong>Cliente:</strong> {clients.find(c => c.id.toString() === newApp.clientId)?.name}</p>
                    <p className="text-sm"><strong>Profissional:</strong> {professionals.find(p => p.id.toString() === newApp.professionalId)?.name}</p>
                    <p className="text-sm"><strong>Serviço:</strong> {services.find(s => s.id.toString() === newApp.serviceId)?.name}</p>
                    <p className="text-sm"><strong>Data:</strong> {format(selectedDate, "dd/MM/yyyy")}</p>
                    <p className="text-sm"><strong>Horário:</strong> {newApp.time}</p>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">Deseja confirmar este agendamento?</p>
                </motion.div>
              )}
            </AnimatePresence>
            <DialogFooter>
              {!showConfirm ? (
                <>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                  <Button onClick={handlePreSave} className="rounded-xl bg-gradient-to-r from-primary to-secondary">Continuar</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowConfirm(false)} className="rounded-xl" disabled={loading}>Voltar</Button>
                  <Button onClick={handleCreate} className="rounded-xl bg-gradient-to-r from-primary to-secondary" disabled={loading}>
                    {loading ? "Confirmando..." : "Confirmar Agendamento"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Column */}
        <Card className="lg:col-span-3 border-none shadow-sm rounded-2xl p-4 h-fit">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            className="rounded-xl border-none"
            classNames={{
              day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
              day_today: "bg-accent text-primary font-bold",
            }}
          />
          <div className="mt-6 p-4 bg-accent/30 rounded-xl">
            <h4 className="font-semibold text-primary flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              Resumo do Dia
            </h4>
            <p className="text-sm text-muted-foreground">
              {filteredAppointments.length} agendamentos marcados para esta data.
            </p>
          </div>
        </Card>

        {/* Grid Column */}
        <Card className="lg:col-span-9 border-none shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-border sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-max">
              {/* Grid Header: Professionals */}
              <div className="flex border-b border-border bg-accent/5 sticky top-0 z-10">
                <div className="w-[100px] flex-shrink-0 p-4 border-r border-border font-bold text-muted-foreground text-center bg-accent/5">Hora</div>
                {professionals.map(p => (
                  <div key={p.id} className="w-[200px] flex-shrink-0 p-4 border-r border-border font-bold text-primary text-center flex flex-col items-center gap-2 bg-accent/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {p.name.charAt(0)}
                    </div>
                    <span className="truncate w-full">{p.name}</span>
                  </div>
                ))}
              </div>

              {/* Grid Body: Time Slots */}
              <div className="divide-y divide-border">
                {TIME_SLOTS.map((time) => (
                  <div key={time} className="flex min-h-[100px]">
                    <div className="w-[100px] flex-shrink-0 flex items-center justify-center border-r border-border bg-accent/5 font-medium text-muted-foreground">
                      {time}
                    </div>
                    {professionals.map(p => {
                      const app = filteredAppointments.find(a => a.time === time && a.professionalId === p.id);
                      return (
                        <div key={`${time}-${p.id}`} className="w-[200px] flex-shrink-0 border-r border-border p-2 relative group hover:bg-primary/5 transition-colors">
                          {app ? (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="h-full w-full bg-white border border-primary/20 rounded-xl p-3 shadow-sm flex flex-col justify-between group-hover:shadow-md transition-shadow relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                              <div className="pl-2">
                                <p className="font-bold text-sm text-foreground truncate">{app.clientName}</p>
                                <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-1">
                                  <Scissors className="w-3 h-3" /> {app.serviceName}
                                </p>
                              </div>
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                  onClick={() => handleDelete(app.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </motion.div>
                          ) : (
                            <Button 
                              variant="ghost" 
                              className="w-full h-full justify-center items-center text-muted-foreground/20 hover:text-primary hover:bg-primary/10 border-2 border-dashed border-transparent hover:border-primary/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              onClick={() => {
                                setNewApp({ ...newApp, time, professionalId: p.id.toString() });
                                setIsDialogOpen(true);
                              }}
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
