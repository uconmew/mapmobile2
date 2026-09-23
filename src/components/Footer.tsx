import Link from "next/link";
import { Radio, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-card py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-2xl font-black tracking-tighter uppercase">
              <Radio className="h-8 w-8 text-primary" />
              <span>MAP<span className="text-primary">MOBILE</span></span>
            </Link>
            <p className="mt-4 max-w-xs text-foreground/60 leading-relaxed">
              Mobile Audio Professionals. We bring premium car audio, security, and electronics installations directly to your doorstep. MECP Certified.
            </p>
              <div className="mt-6 flex gap-4">
                <Link href="https://instagram.com" target="_blank" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="https://facebook.com" target="_blank" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" target="_blank" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-foreground/60 hover:bg-primary hover:text-white transition-all">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Installations</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/installations" className="text-foreground/60 hover:text-primary transition-colors">Audio Systems</Link></li>
              <li><Link href="/installations" className="text-foreground/60 hover:text-primary transition-colors">Head Units</Link></li>
              <li><Link href="/installations" className="text-foreground/60 hover:text-primary transition-colors">Car Security</Link></li>
              <li><Link href="/installations" className="text-foreground/60 hover:text-primary transition-colors">Remote Starts</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-primary">Contact</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center gap-3 text-foreground/60">
                <Phone className="h-4 w-4 text-primary" />
                <span>(555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/60">
                <Mail className="h-4 w-4 text-primary" />
                <span>install@mapmobile.com</span>
              </li>
              <li className="flex items-center gap-3 text-foreground/60">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Mobile Service Area</span>
              </li>
            </ul>
          </div>
        </div>
          <div className="mt-16 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/40">
            <p>&copy; {new Date().getFullYear()} MAP Mobile. Professional Mobile Installation.</p>
            <div className="flex gap-6">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/refund-policy" className="hover:text-foreground transition-colors">Refund Policy</Link>
            </div>
          </div>
      </div>
    </footer>
  );
}
