import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { 
  Scissors, 
  User, 
  Calendar as CalendarIcon, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Phone
} from "lucide-react";
import { api } from "@/lib/api";
import { Professional, Service, Appointment } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", 
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function PublicBooking() {
  const [step, setStep] = React.useState(1);
  const [services, setServices] = React.useState<Service[]>([]);
  const [professionals, setProfessionals] = React.useState<Professional[]>([]);
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  
  const [selection, setSelection] = React.useState({
    serviceId: "",
    professionalId: "",
    date: new Date(),
    time: "",
    name: "",
    phone: ""
  });

  const [loading, setLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [s, p, a] = await Promise.all([
          api.getServices(),
          api.getProfessionals(),
          api.getAppointments()
        ]);
        setServices(s);
        setProfessionals(p);
        setAppointments(a);
      } catch (error) {
        console.error(error);
      }
    };
    fetchInitial();
  }, []);

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!selection.name || !selection.phone) {
      toast.error("Por favor, informe seu nome e telefone.");
      return;
    }

    setLoading(true);
    try {
      await api.publicBooking({
        clientName: selection.name,
        clientPhone: selection.phone,
        professionalId: parseInt(selection.professionalId),
        serviceId: parseInt(selection.serviceId),
        date: format(selection.date, "yyyy-MM-dd"),
        time: selection.time
      });
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimes = () => {
    const dateStr = format(selection.date, "yyyy-MM-dd");
    const takenTimes = appointments
      .filter(a => a.date === dateStr && a.professionalId === parseInt(selection.professionalId))
      .map(a => a.time);
    
    return TIME_SLOTS.filter(t => !takenTimes.includes(t));
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">Agendamento Confirmado!</h1>
          <p className="text-muted-foreground">
            Tudo certo, <strong>{selection.name}</strong>! Seu horário foi reservado com sucesso. 
            Esperamos por você no Sereia Hair.
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border text-left space-y-2">
            <p className="text-sm"><strong>Serviço:</strong> {services.find(s => s.id === parseInt(selection.serviceId))?.name}</p>
            <p className="text-sm"><strong>Profissional:</strong> {professionals.find(p => p.id === parseInt(selection.professionalId))?.name}</p>
            <p className="text-sm"><strong>Data:</strong> {format(selection.date, "dd/MM/yyyy")}</p>
            <p className="text-sm"><strong>Horário:</strong> {selection.time}</p>
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl"
            onClick={() => window.location.reload()}
          >
            Fazer outro agendamento
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff5f7] via-[#f3e8ff] to-[#fff5f7] p-4 md:p-8 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl shadow-primary/20 mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <Scissors className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-serif font-bold text-primary mb-3 tracking-tight">Sereia Hair</h1>
            <p className="text-lg text-muted-foreground font-medium italic">Agendamento inteligente para beleza e cuidado</p>
          </motion.div>
        </div>

        <Card className="border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <div className="h-2.5 bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-x" />
          
          <div className="p-8 md:p-12">
            {/* Progress Bar */}
            <div className="flex justify-between mb-16 relative px-4">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-accent/50 -translate-y-1/2 z-0 rounded-full" />
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 font-bold text-lg",
                    step >= i ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" : "bg-white text-muted-foreground border-2 border-accent"
                  )}
                >
                  {i}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-foreground">O que vamos fazer hoje?</h2>
                    <p className="text-muted-foreground">Selecione o serviço desejado</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setSelection({ ...selection, serviceId: s.id.toString() });
                          handleNext();
                        }}
                        className={cn(
                          "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md",
                          selection.serviceId === s.id.toString() 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                            : "border-accent hover:border-primary/20 bg-white"
                        )}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-bold text-lg">{s.name}</p>
                            <p className="text-sm text-muted-foreground">{s.duration} min</p>
                          </div>
                          <div className="text-primary font-bold">R$ {s.price.toFixed(2)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Com quem você prefere?</h2>
                    <p className="text-muted-foreground">Selecione uma de nossas profissionais</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {professionals.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelection({ ...selection, professionalId: p.id.toString() });
                          handleNext();
                        }}
                        className={cn(
                          "p-6 rounded-2xl border-2 text-left transition-all hover:shadow-md flex items-center gap-4",
                          selection.professionalId === p.id.toString() 
                            ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                            : "border-accent hover:border-primary/20 bg-white"
                        )}
                      >
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-lg">{p.name}</p>
                          <p className="text-sm text-muted-foreground">Especialista</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button variant="ghost" onClick={handleBack} className="rounded-xl">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Quando?</h2>
                    <p className="text-muted-foreground">Escolha a data e o horário</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-accent/10 p-4 rounded-2xl">
                      <Calendar
                        mode="single"
                        selected={selection.date}
                        onSelect={(date) => date && setSelection({ ...selection, date })}
                        locale={ptBR}
                        className="rounded-xl border-none"
                        classNames={{
                          day_selected: "bg-primary text-white hover:bg-primary hover:text-white focus:bg-primary focus:text-white",
                          day_today: "bg-accent text-primary font-bold",
                        }}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-lg font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" /> Horários Disponíveis
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {getAvailableTimes().map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelection({ ...selection, time: t })}
                            className={cn(
                              "p-3 rounded-xl border text-sm font-medium transition-all",
                              selection.time === t 
                                ? "bg-primary text-white border-primary shadow-md" 
                                : "bg-white border-accent hover:border-primary/30"
                            )}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                      {getAvailableTimes().length === 0 && (
                        <p className="text-sm text-destructive bg-destructive/5 p-4 rounded-xl">
                          Infelizmente não há horários disponíveis para esta data. Por favor, escolha outro dia.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={handleBack} className="rounded-xl">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button 
                      onClick={handleNext} 
                      disabled={!selection.time}
                      className="rounded-xl bg-gradient-to-r from-primary to-secondary"
                    >
                      Continuar <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-serif font-bold text-foreground">Quase lá!</h2>
                    <p className="text-muted-foreground">Confirme seus dados para finalizar</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Seu Nome</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="name" 
                            placeholder="Como podemos te chamar?" 
                            className="pl-10 h-12 rounded-xl"
                            value={selection.name}
                            onChange={(e) => setSelection({ ...selection, name: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Seu WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                          <Input 
                            id="phone" 
                            placeholder="(00) 00000-0000" 
                            className="pl-10 h-12 rounded-xl"
                            value={selection.phone}
                            onChange={(e) => setSelection({ ...selection, phone: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                      <h3 className="font-bold text-primary flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" /> Resumo do Agendamento
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Serviço:</span>
                          <span className="font-bold">{services.find(s => s.id === parseInt(selection.serviceId))?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Profissional:</span>
                          <span className="font-bold">{professionals.find(p => p.id === parseInt(selection.professionalId))?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Data:</span>
                          <span className="font-bold">{format(selection.date, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Horário:</span>
                          <span className="font-bold">{selection.time}</span>
                        </div>
                        <div className="pt-3 border-t border-primary/10 flex justify-between text-lg">
                          <span className="font-serif italic">Total:</span>
                          <span className="font-bold text-primary">R$ {services.find(s => s.id === parseInt(selection.serviceId))?.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-6">
                    <Button variant="ghost" onClick={handleBack} className="rounded-xl">
                      <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="rounded-xl bg-gradient-to-r from-primary to-secondary h-12 px-8 text-lg shadow-xl shadow-primary/20"
                    >
                      {loading ? "Confirmando..." : "Finalizar Agendamento"}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>
    </div>
  );
}
