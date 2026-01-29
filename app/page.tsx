"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, BookOpen, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { loadEvents, loadTasks } from "@/lib/store";

export default function HomePage() {
  const [totalTasks, setTotalTasks] = useState(0);
  const [doneTasks, setDoneTasks] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [events, tasks] = await Promise.all([loadEvents(), loadTasks()]);
      setEventsCount(events.length);
      setTotalTasks(tasks.length);
      setDoneTasks(tasks.filter((t) => t.completed).length);
    })();
  }, []);

  const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Добро пожаловать в Дневник медика
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Расписание, задания и шпаргалки для учёбы в медицинском университете.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/calendar"
          className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition"
        >
          <div className="rounded-lg bg-primary-100 dark:bg-primary-900/40 p-3">
            <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Расписание</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {eventsCount} занятий
            </p>
          </div>
        </Link>

        <Link
          href="/cheatsheets"
          className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md transition"
        >
          <div className="rounded-lg bg-amber-100 dark:bg-amber-900/40 p-3">
            <BookOpen className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100">Шпаргалки</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              По предметам
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900/40 p-3">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Прогресс по заданиям</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">
                {progress}%
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {doneTasks} из {totalTasks} выполнено
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Выполненные задания
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Отмечайте задания галочкой в разделе{" "}
          <Link href="/calendar" className="text-primary-600 dark:text-primary-400 hover:underline">
            Расписание
          </Link>
          , кликая по заданию в карточке мероприятия. Прогресс отображается выше.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Circle className="h-5 w-5 text-primary-500" />
          С чего начать
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>• Загрузите PDF с расписанием на странице <strong>Расписание</strong>.</li>
          <li>• Добавляйте задания к занятиям и отмечайте выполнение галочкой.</li>
          <li>• Создайте предметы и загружайте шпаргалки (текст, PDF, фото) в разделе <strong>Шпаргалки</strong>.</li>
        </ul>
      </div>
    </div>
  );
}
