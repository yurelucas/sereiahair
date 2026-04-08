import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarCheck, 
  Users, 
  Clock, 
  TrendingUp,
  ChevronRight,
  Plus
} from "lucide-react";
import { api } from "@/lib/api";
import { Stats, Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "motion/react";

export default function Dashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [recentAppointments, setRecentAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, a] = await Promise.all([api.getStats(), api.getAppointments()]);
        setStats(s);
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        setRecentAppointments(a.filter(app => app.date === today).slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Carregando...</div>;

  const statCards = [
    { 
      title: "Agendamentos Hoje", 
      value: stats?.appointmentsToday || 0, 
      icon: CalendarCheck, 
      color: "bg-primary/10 text-primary",
      description: "Total para o dia atual"
    },
    { 
      title: "Profissionais", 
      value: stats?.totalProfessionals || 0, 
      icon: Users, 
      color: "bg-secondary/10 text-secondary",
      description: "Equipe cadastrada"
    },
    { 
      title: "Próximas Reservas", 
      value: stats?.upcomingBookings || 0, 
      icon: Clock, 
      color: "bg-primary/10 text-primary",
      description: "Agendamentos futuros"
    },
    { 
      title: "Taxa de Ocupação", 
      value: "85%", 
      icon: TrendingUp, 
      color: "bg-secondary/10 text-secondary",
      description: "Média da semana"
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Olá, Administradora!</h1>
          <p className="text-muted-foreground">Veja o que está acontecendo no Sereia Hair hoje.</p>
        </div>
        <Button asChild className="rounded-xl shadow-lg shadow-primary/20">
          <Link to="/agenda">
            <Plus className="w-4 h-4 mr-2" />
            Novo Agendamento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold">{stat.value}</h3>
                  <p className="font-medium text-sm text-foreground/80">{stat.title}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-sm rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">Agendamentos de Hoje</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/agenda" className="text-primary">
                Ver todos <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAppointments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarCheck className="w-8 h-8 text-primary/40" />
                </div>
                <p className="text-muted-foreground">Nenhum agendamento para hoje.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAppointments.map((app) => (
                  <div key={app.id} className="flex items-center gap-4 p-4 rounded-xl bg-accent/30 hover:bg-accent/50 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-bold text-primary shadow-sm">
                      {app.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{app.clientName}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {app.serviceName} • {app.professionalName}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        Confirmado
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm rounded-2xl bg-gradient-to-br from-primary to-secondary text-white">
          <CardHeader>
            <CardTitle className="text-xl">Dica do Dia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/90 leading-relaxed">
              "A beleza começa no momento em que você decide ser você mesma."
            </p>
            <div className="pt-4 border-t border-white/20">
              <p className="text-sm font-medium">Lembrete:</p>
              <p className="text-xs text-white/70 mt-1">
                Não esqueça de confirmar os agendamentos de amanhã via WhatsApp!
              </p>
            </div>
            <Button variant="secondary" className="w-full rounded-xl bg-white text-primary hover:bg-white/90">
              Enviar Lembretes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
