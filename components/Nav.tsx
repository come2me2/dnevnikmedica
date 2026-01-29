"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, BookOpen, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "Главная", icon: LayoutDashboard },
  { href: "/calendar", label: "Расписание", icon: Calendar },
  { href: "/cheatsheets", label: "Шпаргалки", icon: BookOpen },
];

export function Nav() {
  const path = usePathname();

  return (
    <nav className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-6 h-14">
          <Link
            href="/"
            className="text-lg font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition"
          >
            Дневник медика
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const isActive = path === href || (href !== "/" && path.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
