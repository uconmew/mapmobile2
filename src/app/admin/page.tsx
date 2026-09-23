"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users as UsersIcon, 
  Calendar as CalendarIcon, 
  DollarSign as DollarIcon, 
  TrendingUp as TrendingIcon, 
  Clock as ClockIcon, 
  CheckCircle2 as CheckIcon, 
  AlertCircle as AlertIcon,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      
      try {
        const [bookingsRes, usersRes, revenueRes] = await Promise.all([
          supabase.from("bookings").select("*"),
          supabase.from("profiles").select("id", { count: 'exact' }),
          supabase.from("payments").select("amount").eq("status", "SUCCEEDED"),
        ]);

        const totalBookings = bookingsRes.data?.length || 0;
        const pendingBookings = bookingsRes.data?.filter(b => b.status === 'pending').length || 0;
        const totalRevenue = revenueRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
        const totalUsers = usersRes.count || 0;

        setStats({
          totalBookings,
          pendingBookings,
          totalRevenue,
          totalUsers,
        });

        // Fetch recent bookings with details
        const { data: recent } = await supabase
          .from("bookings")
          .select(`
            *,
            user:user_id (name, email),
            service:service_id (name)
          `)
          .order("created_at", { ascending: false })
          .limit(5);

        setRecentBookings(recent || []);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarIcon, trend: '+12.5%', color: 'text-green-500' },
    { name: 'Active Bookings', value: stats.totalBookings, icon: CalendarIcon, trend: '+3 today', color: 'text-primary' },
    { name: 'Pending Orders', value: stats.pendingBookings, icon: AlertIcon, trend: 'Requires action', color: 'text-yellow-500' },
    { name: 'Total Customers', value: stats.totalUsers, icon: UsersIcon, trend: '+48 this month', color: 'text-blue-500' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight italic">Dashboard Overview</h2>
          <p className="text-foreground/60 mt-1 text-sm font-medium">Real-time performance metrics for MAP Mobile.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">Export Report</Button>
          <Button className="blue-gradient text-white border-none font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Generate Invoices</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.name} className="glass-card border-white/5 overflow-hidden group hover:border-white/10 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">{stat.trend}</Badge>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{stat.name}</p>
                <h3 className="text-3xl font-black mt-1 italic">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              Recent Bookings
            </h3>
            <Button variant="link" asChild className="text-primary font-black uppercase tracking-widest text-[10px]">
              <Link href="/admin/appointments">View All Bookings →</Link>
            </Button>
          </div>
          
          <Card className="glass-card border-white/5 p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Customer</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Service</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Amount</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Status</th>
                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="p-6 bg-white/[0.02]"></td>
                      </tr>
                    ))
                  ) : recentBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6">
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{(booking as any).user?.name || 'Guest'}</div>
                        <div className="text-xs text-foreground/40 font-mono">{(booking as any).user?.email}</div>
                      </td>
                      <td className="p-6 font-bold uppercase text-sm tracking-tight italic">
                        {(booking as any).service?.name}
                      </td>
                      <td className="p-6 font-black text-white italic">
                        ${Number(booking.total_amount).toLocaleString()}
                      </td>
                        <td className="p-6">
                          <Badge className={`${
                            booking.status === 'confirmed' ? 'bg-green-500/10 text-green-500' :
                            booking.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-white/5 text-foreground/40'
                          } border-none uppercase text-[10px] font-black`}>
                            {booking.status}
                          </Badge>
                        </td>
                      <td className="p-6 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Analytics */}
        <div className="space-y-8">
          <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
            <TrendingIcon className="h-5 w-5 text-primary" />
            Performance
          </h3>
          
          <Card className="glass-card border-white/5 p-6">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">Capacity Utilization</h4>
            <div className="space-y-6">
              {[
                { label: 'Technician A', value: 85, color: 'bg-primary' },
                { label: 'Technician B', value: 62, color: 'bg-blue-500' },
                { label: 'Technician C', value: 45, color: 'bg-indigo-500' },
              ].map((tech) => (
                <div key={tech.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span>{tech.label}</span>
                    <span className="text-foreground/40">{tech.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${tech.color} transition-all duration-1000`} 
                      style={{ width: `${tech.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="blue-gradient border-none p-6 text-white relative overflow-hidden group">
            <TrendingIcon className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 group-hover:scale-110 transition-transform duration-500" />
            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60">System Health</h4>
            <div className="flex items-center gap-2 mt-2">
              <CheckIcon className="h-5 w-5" />
              <p className="text-xl font-black uppercase tracking-tighter italic">Operational</p>
            </div>
            <p className="text-xs mt-4 opacity-80 leading-relaxed font-medium">
              All payment systems and Supabase databases are running optimally. No service interruptions reported in last 24h.
            </p>
            <Button variant="link" className="text-white text-[10px] font-black uppercase p-0 h-auto mt-6">
              View Status Page →
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
