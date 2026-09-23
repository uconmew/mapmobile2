"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Bell, 
  Clock, 
  MapPin, 
  Car, 
  CheckCircle2, 
  User, 
  Speaker,
  AlertCircle,
  Loader2,
  RefreshCcw,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [newOrder, setNewOrder] = useState<any>(null);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);

  const fetchOrders = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    try {
      // Run cleanup of expired bookings
      await supabase.rpc('run_cleanup');

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          user:user_id (full_name, email),
          service:service_id (name),
          vehicle:vehicle_id (make, model, year),
          address:address_id (street, city, state)
        `)
          .eq('status', 'confirmed')
          .order("created_at", { ascending: false });

      if (error) throw error;

      // Check for new orders to trigger pop-up
      if (!isInitial && data && data.length > orders.length) {
        const latestOrder = data[0];
        const isAlreadyKnown = orders.find(o => o.id === latestOrder.id);
        if (!isAlreadyKnown) {
          setNewOrder(latestOrder);
          setIsNewOrderDialogOpen(true);
          // Play sound
            const audio = new Audio('/sounds/alert.mp3');
          audio.play().catch(e => console.log("Audio play failed", e));
          toast.success("New Installation Order Received!");
        }
      }

      setOrders(data || []);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast.error("Failed to refresh orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(30);
    }
  }, [orders]);

  useEffect(() => {
    fetchOrders(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchOrders();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchOrders]);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight italic flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Live Installation Orders
          </h1>
          <p className="text-foreground/60 text-sm mt-1">Real-time monitoring for mobile installation deployments.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/10">
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none">Next Refresh</p>
            <p className="text-xl font-black text-primary italic leading-none mt-1">{countdown}s</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => fetchOrders()}
            disabled={refreshing}
            className="h-10 w-10 hover:bg-white/10"
          >
            <RefreshCcw className={`h-5 w-5 ${refreshing ? "animate-spin text-primary" : "text-foreground/40"}`} />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-xs">Syncing with field units...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="glass-card border-white/5 overflow-hidden group hover:border-primary/20 transition-all duration-500 hover:translate-y-[-4px]">
              <CardContent className="p-0">
                <div className="p-5 border-b border-white/5 bg-white/[0.02] flex justify-between items-start">
                  <div>
                    <Badge className="bg-green-500/10 text-green-500 border-none uppercase text-[8px] font-black px-2 mb-2">
                      Confirmed
                    </Badge>
                    <h3 className="font-black italic text-lg leading-tight uppercase">{order.service?.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none">Fee</p>
                    <p className="text-xl font-black text-white italic mt-1">${Number(order.total_amount).toLocaleString()}</p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Client</p>
                      <p className="font-bold text-sm">{order.user?.full_name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Deployment Zone</p>
                      <p className="font-bold text-sm leading-snug">{order.address?.street}<br/>{order.address?.city}, {order.address?.state}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-primary mt-1" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Window</p>
                      <p className="font-bold text-sm">
                        {new Date(order.booking_date).toLocaleDateString()} @ {order.scheduled_time}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pt-4 border-t border-white/5">
                    <Car className="h-4 w-4 text-foreground/40 mt-1" />
                    <p className="text-xs font-medium text-foreground/60">
                      {order.vehicle?.year} {order.vehicle?.make} {order.vehicle?.model}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white/[0.01] flex gap-2">
                  <Button asChild variant="ghost" className="w-full h-10 border border-white/5 hover:bg-white/5 font-bold uppercase tracking-widest text-[9px]">
                    <a href={`/admin/appointments?id=${order.id}`}>
                      View Details
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 glass-card rounded-3xl border-dashed border-white/10">
          <Speaker className="h-16 w-16 text-foreground/10 mb-6 animate-pulse" />
          <h3 className="text-2xl font-black italic uppercase tracking-tight text-foreground/40">Awaiting New Orders</h3>
          <p className="text-foreground/30 text-sm mt-2">No active installation orders currently in queue.</p>
        </div>
      )}

      {/* New Order Pop-up Dialog */}
      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="glass-card border-primary/30 bg-black/95 text-white sm:max-w-lg shadow-2xl shadow-primary/20 p-0 overflow-hidden">
          <div className="bg-primary/10 p-8 flex items-center justify-center border-b border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
            <Bell className="h-16 w-16 text-primary relative z-10 animate-bounce" />
          </div>
          <div className="p-8">
            <DialogHeader>
              <div className="flex justify-between items-center mb-2">
                <Badge className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">New Deployment</Badge>
                <span className="text-xs font-black italic text-foreground/40 uppercase tracking-tighter">MAP Mobile Co. Terminal</span>
              </div>
              <DialogTitle className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-6">
                Installation Order Received
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 block mb-1">Service Required</label>
                  <p className="text-xl font-black italic uppercase text-primary leading-tight">{newOrder?.service?.name}</p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40 block mb-1">Total Value</label>
                  <p className="text-3xl font-black italic text-white">${Number(newOrder?.total_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="glass-card p-6 border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none mb-1">Client</p>
                    <p className="font-bold text-lg leading-none">{newOrder?.user?.full_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 leading-none mb-1">Deployment Location</p>
                    <p className="font-bold text-lg leading-none">{newOrder?.address?.street}, {newOrder?.address?.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="p-8 bg-white/[0.02] border-t border-white/5">
            <Button 
              onClick={() => setIsNewOrderDialogOpen(false)} 
              className="w-full blue-gradient text-white border-none h-14 text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20"
            >
              Acknowledge & Sync
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
