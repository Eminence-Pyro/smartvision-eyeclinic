"use client";
import PortalFooter from "@/components/ui/PortalFooter";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UserPlus, Activity, CreditCard, Stethoscope,
  Camera, Scissors, Pill, Users, BarChart2, LogOut,
  Menu, X, Bell, Settings, ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";
import Logo from "@/components/ui/Logo";

const ALL_NAV = [
  { href:"/staff/dashboard",       label:"Dashboard",  icon:BarChart2,   roles:["admin","doctor","front_desk","va_room","accounts","scan_room","theatre","pharmacy"] },
  { href:"/staff/front-desk",      label:"Front Desk", icon:UserPlus,    roles:["admin","front_desk"] },
  { href:"/staff/va-room",         label:"VA Room",    icon:Activity,    roles:["admin","va_room"]    },
  { href:"/staff/accounts",        label:"Accounts",   icon:CreditCard,  roles:["admin","accounts"]   },
  { href:"/staff/doctor",          label:"Doctor",     icon:Stethoscope, roles:["admin","doctor"]     },
  { href:"/staff/scan-room",       label:"Scan Room",  icon:Camera,      roles:["admin","scan_room"]  },
  { href:"/staff/theatre",         label:"Theatre",    icon:Scissors,    roles:["admin","theatre"]    },
  { href:"/staff/pharmacy",        label:"Pharmacy",   icon:Pill,        roles:["admin","pharmacy"]   },
  { href:"/staff/admin",           label:"Staff Admin",icon:Users,       roles:["admin"]              },
  { href:"/staff/admin/analytics", label:"Analytics",  icon:BarChart2,   roles:["admin"]              },
  { href:"/staff/settings",        label:"Settings",   icon:Settings,    roles:["admin","doctor","front_desk","va_room","accounts","scan_room","theatre","pharmacy"] },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname           = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = (session?.user as { role?: string })?.role || "";
  const name = session?.user?.name || "Staff";
  const nav  = ALL_NAV.filter(n => n.roles.includes(role));

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ── */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 flex flex-col transition-transform duration-300",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo + close */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-800 flex-shrink-0">
          <Logo size={32} textColor="white" />
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden text-gray-500 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {nav.map(item => {
            const Icon   = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
                  active
                    ? "brand-gradient text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}>
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight className="h-3 w-3 opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* User + sign out */}
        <div className="border-t border-gray-800 p-4 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(name)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{name}</p>
              <p className="text-gray-500 text-xs capitalize">{role.replace(/_/g," ")}</p>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/staff/login" })}
            className="flex items-center gap-2 text-gray-500 hover:text-red-400 text-xs transition-colors w-full px-1">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <button className="relative text-gray-500 hover:text-brand transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <span className="text-sm text-gray-500 hidden sm:block">
              {new Date().toLocaleDateString("en-NG", { weekday:"short", day:"numeric", month:"short" })}
            </span>
            <Link href="/staff/settings"
              className="w-8 h-8 brand-gradient rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-80 transition-opacity"
              title="Account Settings">
              {getInitials(name)}
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

        <PortalFooter />
      </div>
    </div>
  );
}
