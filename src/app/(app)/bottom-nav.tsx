"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, Play, BarChart3, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/home", label: "Home", icon: Dumbbell },
  { href: "/workout", label: "Workout", icon: Play },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/program", label: "Program", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background-secondary/95 backdrop-blur supports-[backdrop-filter]:bg-background-secondary/80">
      <div className="flex items-center justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive
                  ? "text-accent"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
