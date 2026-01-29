"use client";

import {
  getDB,
  genId,
  type CalendarEvent,
  type Task,
  type Subject,
  type CheatSheet,
  type SchedulePDF,
} from "./db";

export async function loadEvents(): Promise<CalendarEvent[]> {
  const db = await getDB();
  return db.getAll("events");
}

export async function saveEvent(ev: Omit<CalendarEvent, "taskIds"> & { taskIds?: string[] }): Promise<CalendarEvent> {
  const db = await getDB();
  const event: CalendarEvent = {
    ...ev,
    id: ev.id || genId(),
    taskIds: ev.taskIds ?? [],
  };
  await db.put("events", event);
  return event;
}

export async function deleteEvent(id: string): Promise<void> {
  const db = await getDB();
  const tasks = await loadTasks();
  for (const t of tasks) if (t.eventId === id) await db.delete("tasks", t.id);
  await db.delete("events", id);
}

export async function loadTasks(): Promise<Task[]> {
  const db = await getDB();
  return db.getAll("tasks");
}

export async function loadTasksForEvent(eventId: string): Promise<Task[]> {
  const all = await loadTasks();
  return all.filter((t) => t.eventId === eventId).sort((a, b) => a.order - b.order);
}

export async function saveTask(t: Partial<Task> & { eventId: string; title: string }): Promise<Task> {
  const db = await getDB();
  const tasks = await loadTasksForEvent(t.eventId);
  const task: Task = {
    id: t.id || genId(),
    eventId: t.eventId,
    title: t.title,
    completed: t.completed ?? false,
    order: t.order ?? tasks.length,
  };
  await db.put("tasks", task);
  return task;
}

export async function toggleTask(id: string): Promise<void> {
  const db = await getDB();
  const t = await db.get("tasks", id);
  if (t) {
    t.completed = !t.completed;
    await db.put("tasks", t);
  }
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("tasks", id);
}

export async function loadSubjects(): Promise<Subject[]> {
  const db = await getDB();
  return db.getAll("subjects");
}

export async function saveSubject(s: Partial<Subject> & { name: string }): Promise<Subject> {
  const db = await getDB();
  const sub: Subject = { id: s.id || genId(), name: s.name };
  await db.put("subjects", sub);
  return sub;
}

export async function deleteSubject(id: string): Promise<void> {
  const db = await getDB();
  const sheets = await db.getAll("cheatsheets");
  for (const sh of sheets) if (sh.subjectId === id) await db.delete("cheatsheets", sh.id);
  await db.delete("subjects", id);
}

export async function loadCheatSheets(subjectId?: string): Promise<CheatSheet[]> {
  const db = await getDB();
  const all = await db.getAll("cheatsheets");
  return subjectId ? all.filter((c) => c.subjectId === subjectId) : all;
}

export async function saveCheatSheet(
  c: Partial<CheatSheet> & { subjectId: string; name: string; type: CheatSheet["type"]; data: string }
): Promise<CheatSheet> {
  const db = await getDB();
  const sheet: CheatSheet = {
    id: c.id || genId(),
    subjectId: c.subjectId,
    name: c.name,
    type: c.type,
    data: c.data,
    mimeType: c.mimeType,
    createdAt: c.createdAt ?? Date.now(),
  };
  await db.put("cheatsheets", sheet);
  return sheet;
}

export async function deleteCheatSheet(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("cheatsheets", id);
}

export async function loadSchedulePdfs(): Promise<SchedulePDF[]> {
  const db = await getDB();
  return db.getAll("schedulePdfs");
}

export async function saveSchedulePdf(name: string, data: string): Promise<SchedulePDF> {
  const db = await getDB();
  const rec: SchedulePDF = { id: genId(), name, data, uploadedAt: Date.now() };
  await db.put("schedulePdfs", rec);
  return rec;
}

export async function deleteSchedulePdf(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("schedulePdfs", id);
}
