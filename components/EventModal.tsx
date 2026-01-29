"use client";

import { useState, useEffect } from "react";
import { X, Plus, Check, Trash2 } from "lucide-react";
import type { CalendarEvent } from "./CalendarSection";
import {
  loadTasksForEvent,
  saveTask,
  toggleTask,
  deleteTask,
} from "@/lib/store";
import type { Task } from "@/lib/db";

interface EventModalProps {
  event: CalendarEvent;
  onClose: () => void;
  onSave: (ev: {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    subject?: string;
    location?: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function EventModal({ event, onClose, onSave, onDelete }: EventModalProps) {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(formatDateTime(event.start));
  const [end, setEnd] = useState(formatDateTime(event.end));
  const [subject, setSubject] = useState(event.resource?.subject ?? "");
  const [location, setLocation] = useState(event.resource?.location ?? "");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const eventId = event.id || (event.resource?.id as string);

  useEffect(() => {
    if (!eventId) return;
    loadTasksForEvent(eventId).then(setTasks);
  }, [eventId]);

  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  const handleSave = async () => {
    setSaving(true);
    try {
      const [sDate, sTime] = start.split("T");
      const [eDate, eTime] = end.split("T");
      await onSave({
        id: event.id || undefined,
        title,
        start: parseDateTime(sDate, sTime),
        end: parseDateTime(eDate, eTime),
        subject: subject || undefined,
        location: location || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !eventId) return;
    const t = await saveTask({
      eventId,
      title: newTaskTitle.trim(),
      order: tasks.length,
    });
    setTasks((prev) => [...prev, t]);
    setNewTaskTitle("");
  };

  const toggle = async (id: string) => {
    await toggleTask(id);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const removeTask = async (id: string) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100">
            {event.id ? "Редактировать занятие" : "Новое занятие"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="Занятие"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Начало
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Конец
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Дисциплина
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="Например: Анатомия"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Место
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100"
              placeholder="Аудитория"
            />
          </div>

          {eventId && (
            <>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Задания
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {done} / {total} · {progress}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mb-3">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Добавить задание"
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-slate-100 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTask}
                    className="rounded-lg border border-primary-500 bg-primary-500 px-3 py-2 text-white hover:bg-primary-600 transition shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <ul className="mt-2 space-y-1">
                  {tasks.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggle(t.id)}
                        className="shrink-0 text-slate-500 hover:text-emerald-500"
                      >
                        {t.completed ? (
                          <Check className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <span className="block h-5 w-5 rounded border-2 border-slate-400" />
                        )}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          t.completed
                            ? "text-slate-400 dark:text-slate-500 line-through"
                            : "text-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {t.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTask(t.id)}
                        className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-2 justify-end border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
          {onDelete && event.id && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Удалить
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition disabled:opacity-50"
          >
            {saving ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [y, mo, day] = dateStr.split("-").map(Number);
  const [h, min] = (timeStr || "00:00").split(":").map(Number);
  return new Date(y, mo - 1, day, h, min, 0, 0);
}
