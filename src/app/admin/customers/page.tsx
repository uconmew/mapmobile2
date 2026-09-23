"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, 
  Shield, 
  User as UserIcon, 
  MoreVertical, 
  Search,
  Filter,
  Check,
  X,
  Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit-logger";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

    async function fetchUsers() {
      setLoading(true);
      try {
        // First fetch users who are NOT staff
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .not("role", "in", '("admin","technician","suspended")')
          .order("created_at", { ascending: false });

        if (usersError) throw usersError;

        // Get last booking for each user
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("user_id, created_at")
          .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;

        // Get last order for each user
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("user_id, created_at")
          .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const now = new Date();
        const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

        const processedUsers = usersData.map(user => {
          const userBookings = bookingsData.filter(b => b.user_id === user.id);
          const userOrders = ordersData.filter(o => o.user_id === user.id);
          
          const lastBookingDate = userBookings.length > 0 ? new Date(userBookings[0].created_at) : null;
          const lastOrderDate = userOrders.length > 0 ? new Date(userOrders[0].created_at) : null;
          
          const lastActivityDate = lastBookingDate && lastOrderDate 
            ? (lastBookingDate > lastOrderDate ? lastBookingDate : lastOrderDate)
            : (lastBookingDate || lastOrderDate);

          // Active if last activity within 365 days OR joined within 365 days
          const isActive = (lastActivityDate && lastActivityDate >= oneYearAgo) || 
                          (new Date(user.created_at) >= oneYearAgo);

          return {
            ...user,
            lastActivityDate,
            isActive
          };
        });

        if (activeTab === "active") {
          setUsers(processedUsers.filter(u => u.isActive));
        } else {
          setUsers(processedUsers.filter(u => !u.isActive));
        }
      } catch (error: any) {
        toast.error("Failed to fetch users: " + error.message);
      } finally {
        setLoading(false);
      }
    }


  const handleUpdateRole = async (user: any, newRole: string) => {
    setUpdatingId(user.id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", user.id);

      if (error) throw error;
      
      await logAudit({
        action: 'UPDATE_ROLE',
        entityType: 'customer',
        entityId: user.id,
        metadata: {
          previous_role: user.role,
          new_role: newRole,
          user_email: user.email,
          map_id: user.map_id
        }
      });

      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
      toast.error("Failed to update role: " + error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl w-fit">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveTab("active")}
              className={cn(
                "font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-lg transition-all",
                activeTab === "active" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-white"
              )}
            >
              Active Customers
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setActiveTab("archived")}
              className={cn(
                "font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-lg transition-all",
                activeTab === "archived" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-foreground/40 hover:text-white"
              )}
            >
              Customer Archives
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
              <Input 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-sm font-bold uppercase tracking-widest h-10"
              />
            </div>
            <Button variant="outline" className="border-white/10 hover:bg-white/5 h-10 font-black uppercase tracking-widest text-[10px]">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">Total</Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Registered</p>
              <h3 className="text-2xl font-black mt-1 italic">{users.length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                <Shield className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">Active</Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Administrators</p>
              <h3 className="text-2xl font-black mt-1 italic">{users.filter(u => u.role === 'admin').length}</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/5 overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <UserIcon className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="border-white/5 bg-white/5 text-[10px] font-black uppercase tracking-widest">Recent</Badge>
            </div>
            <div className="mt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">New This Week</p>
              <h3 className="text-2xl font-black mt-1 italic">0</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-white/5 p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">User</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Role</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Joined</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="p-8 bg-white/[0.01]"></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-foreground/40 font-bold uppercase tracking-widest text-sm">
                    No users found
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:border-primary/20 transition-colors">
                        <UserIcon className="h-5 w-5 text-foreground/40 group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-primary transition-colors">{user.full_name || 'No Name'}</div>
                        <div className="text-xs text-foreground/40 font-mono">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <Badge className={cn(
                      "uppercase text-[10px] font-black border-none",
                      user.role === 'admin' 
                        ? "bg-primary text-white shadow-[0_0_15px_rgba(0,102,255,0.2)]" 
                        : "bg-white/10 text-foreground/60"
                    )}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-6">
                    <div className="text-sm font-bold text-foreground/60 uppercase tracking-tighter italic">
                      {new Date(user.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg" disabled={updatingId === user.id}>
                          {updatingId === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                        </Button>
                      </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0a0a0a] border-white/10 text-white font-bold uppercase tracking-widest text-[10px]">
                          <DropdownMenuItem 
                            className="hover:bg-white/5 focus:bg-white/5 cursor-pointer flex items-center gap-2"
                            onClick={() => handleUpdateRole(user, user.role === 'admin' ? 'customer' : 'admin')}
                          >
                            {user.role === 'admin' ? (
                              <>
                                <X className="h-3 w-3 text-red-500" />
                                Demote to Customer
                              </>
                            ) : (
                              <>
                                <Check className="h-3 w-3 text-green-500" />
                                Promote to Admin
                              </>
                            )}
                          </DropdownMenuItem>

                        <DropdownMenuItem className="hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer text-red-500">
                          Suspend Account
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
