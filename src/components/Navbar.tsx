"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Radio, Menu, X, User, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CartDrawer } from "./CartDrawer";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getInitialSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, full_name, role")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, full_name, role")
          .eq("id", session.user.id)
          .single();
        setUser({ ...session.user, profile });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Installations", href: "/installations" },
    { name: "Products", href: "/products" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

    if (user?.profile?.role === "admin" || user?.profile?.role === "technician") {
      navLinks.push({ name: "Tech Portal", href: "/technician" });
    }

    if (user?.profile?.role === "admin") {
      navLinks.push({ name: "Admin", href: "/admin" });
    }


  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tighter uppercase">
              <Radio className="h-6 w-6 text-primary" />
              <span>MAP<span className="text-primary">MOBILE</span></span>
            </Link>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-bold uppercase tracking-widest transition-colors hover:text-primary ${
                    pathname === link.href ? "text-primary" : "text-foreground/70"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

<div className="flex items-center gap-2 md:gap-4">
                <ThemeToggle />
                <CartDrawer />
                  <div className="hidden md:flex items-center gap-4">
                    {!loading && (
                      user ? (
                        <Button asChild variant="ghost" className="rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 h-10 px-4 gap-3 group">
                          <Link href="/dashboard" title="Go to Dashboard">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-lg blue-gradient text-[10px] font-black uppercase italic text-white shadow-lg shadow-primary/20 transition-transform group-hover:scale-110">
                                {user.profile?.first_name?.[0] || user.profile?.full_name?.[0] || user.email?.[0] || <User className="h-4 w-4" />}
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/70 group-hover:text-primary transition-colors">
                                {user.profile?.first_name || user.profile?.full_name || 'My Account'}
                              </span>
                            </div>
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild variant="ghost" size="sm" className="font-bold">
                          <Link href="/login">Login</Link>
                        </Button>
                      )
                    )}
                    <Button asChild size="sm" className="blue-gradient text-white border-none font-bold px-6">
                      <Link href="/book">Book Now</Link>
                    </Button>
                  </div>


            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-b border-white/10 bg-background px-2 pb-3 pt-2 sm:px-3"
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block rounded-md px-3 py-2 text-base font-bold uppercase tracking-widest text-foreground/70 hover:bg-white/5 hover:text-primary"
            >
              {link.name}
            </Link>
          ))}
                <div className="mt-4 flex flex-col gap-2 px-3">
                  {!loading && (
                    user ? (
                      <Button asChild variant="outline" className="w-full font-bold gap-2">
                        <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 text-primary" />
                          {user.profile?.first_name || user.profile?.full_name || 'My Account'}
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild variant="outline" className="w-full font-bold">
                        <Link href="/login" onClick={() => setIsOpen(false)}>Login</Link>
                      </Button>
                    )
                  )}
                  <Button asChild className="w-full blue-gradient text-white border-none font-bold">
                    <Link href="/book" onClick={() => setIsOpen(false)}>Book Now</Link>
                  </Button>
                </div>

        </motion.div>
      )}
    </nav>
  );
}
