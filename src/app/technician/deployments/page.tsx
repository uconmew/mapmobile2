"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Lock, 
  User, 
  Clock, 
  MapPin, 
  Car, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Volume2, 
  VolumeX,
  Bell,
  ChevronRight,
  LogOut,
  Smartphone,
  Info,
  Banknote,
  Wrench,
  Activity,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  booking_date: string;
  scheduled_time: string;
  customer_legal_name: string;
  customer_preferred_name: string;
  tech_contact_phone: string;
  service: { name: string };
  vehicle: { make: string; model: string; year: number; type: string };
  address: { street: string; city: string; state: string };
  assigned_tech_id: string | null;
}

export default function DeploymentsHub() {
  const router = useRouter();
  
  // Auth State
  const [techSession, setTechSession] = useState<{ mapId: string; id: string; name: string; expiresAt: number } | null>(null);
  const [mapIdInput, setMapIdInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  
  // Data State
  const [availableDeployments, setAvailableDeployments] = useState<Booking[]>([]);
  const [myDeployments, setMyDeployments] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // UI State
  const [isMuted, setIsMuted] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [shouldAlert, setShouldAlert] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check LocalStorage
      const saved = localStorage.getItem("tech_deployment_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() < parsed.expiresAt) {
          setTechSession(parsed);
          setLoading(false);
          return;
        } else {
          localStorage.removeItem("tech_deployment_session");
        }
      }

      // 2. Check Admin Session Bypass
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name, map_id")
          .eq("id", session.user.id)
          .single();
        
        if (profile?.role === "admin") {
          const adminSession = {
            mapId: profile.map_id || "ADMIN",
            id: session.user.id,
            name: profile.full_name || "Administrator",
            expiresAt: Date.now() + 10 * 60 * 60 * 1000 // 10 hours
          };
          setTechSession(adminSession);
          localStorage.setItem("tech_deployment_session", JSON.stringify(adminSession));
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Fetch Logic
  const fetchDeployments = async () => {
    if (!techSession) return;
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          service:service_id(name),
          vehicle:vehicle_id(make, model, year, type),
          address:address_id(street, city, state)
        `)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const available = data.filter(b => !b.assigned_tech_id);
      const assigned = data.filter(b => b.assigned_tech_id === techSession.id);

      setAvailableDeployments(available);
      setMyDeployments(assigned);
      setLastChecked(new Date());

      // Sound logic
      if (available.length > 0 && !isMuted) {
        setShouldAlert(true);
      } else {
        setShouldAlert(false);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  // Polling
  useEffect(() => {
    if (techSession) {
      fetchDeployments();
      const interval = setInterval(fetchDeployments, 30000);
      return () => clearInterval(interval);
    }
  }, [techSession, isMuted]);

  // Audio Control
  useEffect(() => {
    if (shouldAlert && !isMuted) {
      if (audioRef.current) {
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [shouldAlert, isMuted]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, map_id, access_code")
        .eq("map_id", mapIdInput)
        .eq("access_code", codeInput)
        .single();

      if (error || !data || (data.role !== 'admin' && data.role !== 'technician')) {
        toast.error("Invalid credentials or unauthorized");
        return;
      }

      const sessionData = {
        mapId: data.map_id!,
        id: data.id,
        name: data.full_name || "Technician",
        expiresAt: Date.now() + 10 * 60 * 60 * 1000
      };

      setTechSession(sessionData);
      localStorage.setItem("tech_deployment_session", JSON.stringify(sessionData));
      toast.success(`Session established: ${sessionData.name}`);
    } catch (err) {
      toast.error("Authentication failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("tech_deployment_session");
    setTechSession(null);
    setShouldAlert(false);
  };

  const acceptJob = async (bookingId: string) => {
    if (!techSession) return;
    try {
      const res = await fetch("/api/admin/staff/accept-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          techId: techSession.id,
          mapId: techSession.mapId,
          techName: techSession.name
        }),
      });

      if (!res.ok) throw new Error("Failed to accept job");
      
      toast.success("Job assigned to you");
      fetchDeployments();
    } catch (err) {
      toast.error("Could not assign job");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!techSession) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 rounded-[2.5rem] border border-white/10 bg-black/40 backdrop-blur-xl w-full max-w-md space-y-8 shadow-2xl"
        >
          <div className="text-center space-y-3">
            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-inner">
              <Smartphone className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Deployments <span className="text-primary">Hub</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/40">Authorized Technician Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">MAP ID</Label>
              <div className="relative group">
                <Input 
                  value={mapIdInput}
                  onChange={(e) => setMapIdInput(e.target.value.toUpperCase())}
                  placeholder="MAPXXXXX"
                  className="h-14 bg-white/5 border-white/10 rounded-xl px-12 font-bold focus:border-primary/50 text-white"
                  required
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Access Code</Label>
              <div className="relative group">
                <Input 
                  type="password"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="••••"
                  className="h-14 bg-white/5 border-white/10 rounded-xl px-12 text-center text-2xl tracking-[1em] font-black focus:border-primary/50 text-white"
                  required
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={verifying}
              className="w-full h-16 blue-gradient text-white border-none rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 group overflow-hidden"
            >
              {verifying ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authenticate Hub Session"}
            </Button>
          </form>

          <p className="text-[9px] text-center text-foreground/30 font-bold uppercase tracking-widest leading-relaxed">
            Session persistence: 10 Hours. MAP ID and Access Code required for deployment authorization.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      <audio ref={audioRef} src="/sounds/alert.mp3" />
      
      {/* Standalone Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
              <Bell className={`h-5 w-5 text-primary ${shouldAlert ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter">Deployments</h1>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">
                  Live Feed • Refresh in 30s
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-xl border border-white/5 ${isMuted ? 'text-red-400 bg-red-400/10' : 'text-primary bg-primary/10'}`}
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">{techSession.name}</span>
              <span className="text-[8px] font-black uppercase tracking-widest text-foreground/40">{techSession.mapId}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-10 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Exit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
        {/* Alerts Section */}
        {availableDeployments.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-red-500 animate-pulse" />
                <h2 className="text-lg font-black uppercase italic tracking-widest text-red-500">
                  Active Deployments <span className="bg-red-500/10 px-2 py-0.5 rounded ml-2">{availableDeployments.length}</span>
                </h2>
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">
                Last Sync: {lastChecked.toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {availableDeployments.map((b) => (
                  <motion.div
                    key={b.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card rounded-3xl border border-red-500/20 bg-red-500/5 p-6 space-y-6 shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-2">
                       <div className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-widest">Unassigned</div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          <User className="h-6 w-6 text-foreground/60" />
                        </div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase leading-none">{b.customer_legal_name}</h3>
                          <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter mt-1 italic">Prefer: {b.customer_preferred_name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Vehicle</p>
                          <p className="text-[10px] font-bold uppercase truncate">{b.vehicle.year} {b.vehicle.make}</p>
                          <p className="text-[9px] text-foreground/40 font-bold truncate">{b.vehicle.model}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[8px] font-black uppercase tracking-widest text-primary mb-1">Window</p>
                          <p className="text-[10px] font-bold uppercase truncate">{new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-[9px] text-primary font-black uppercase truncate">{b.scheduled_time}</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                         <div className="flex items-center gap-2">
                            <Wrench className="h-3 w-3 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{b.service.name}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-foreground/40" />
                            <span className="text-[10px] font-bold text-foreground/60">{b.address.city}, {b.address.state}</span>
                         </div>
                      </div>

                      {b.payment_status === 'unpaid' && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 animate-pulse">
                          <Banknote className="h-4 w-4 text-amber-500" />
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-500">Collect Payment Before Starting Install</p>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => acceptJob(b.id)}
                      className="w-full h-14 blue-gradient text-white border-none rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                    >
                      Accept Job
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* My Assignments */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-black uppercase italic tracking-widest">My Active Deployments</h2>
          </div>

          {myDeployments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myDeployments.map((b) => (
                <div
                  key={b.id}
                  className="glass-card rounded-3xl border border-white/10 bg-white/5 p-6 space-y-6 opacity-80"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                       </div>
                       <div>
                          <p className="text-xs font-black uppercase italic">{b.customer_legal_name}</p>
                          <p className="text-[8px] font-black uppercase tracking-widest text-primary">Assigned to You</p>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-foreground/40 uppercase">Arrival Window</span>
                       <span className="text-primary uppercase font-black italic">{b.scheduled_time}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-bold">
                       <span className="text-foreground/40 uppercase">Address</span>
                       <span className="truncate max-w-[150px]">{b.address.street}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => router.push(`/technician?id=${b.id.slice(0, 8).toUpperCase()}`)}
                    className="w-full h-12 border-white/10 hover:bg-white/10 rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Launch Field Ops
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-20 text-center">
               <Info className="h-8 w-8 text-foreground/10 mx-auto mb-4" />
               <p className="text-xs font-black uppercase tracking-[0.3em] text-foreground/20">No active assignments</p>
            </div>
          )}
        </section>
      </main>

      {/* Footer System Info */}
      <footer className="max-w-7xl mx-auto p-8 border-t border-white/5">
         <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[0.5em] text-foreground/20">
            <span>MAP Mobile Co • Deployment Notification Hub v2.1</span>
            <div className="flex gap-4">
               <span>System Secure</span>
               <span>{new Date().getFullYear()} ©</span>
            </div>
         </div>
      </footer>
    </div>
  );
}
