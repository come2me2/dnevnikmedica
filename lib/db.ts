import { openDB, DBSchema, IDBPDatabase } from "idb";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  subject?: string;
  location?: string;
  taskIds: string[];
}

export interface Task {
  id: string;
  eventId: string;
  title: string;
  completed: boolean;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
}

export interface CheatSheet {
  id: string;
  subjectId: string;
  name: string;
  type: "text" | "pdf" | "image";
  data: string; // base64 or plain text
  mimeType?: string;
  createdAt: number;
}

export interface SchedulePDF {
  id: string;
  name: string;
  data: string; // base64
  uploadedAt: number;
}

interface DnevnikDB extends DBSchema {
  events: { key: string; value: CalendarEvent };
  tasks: { key: string; value: Task };
  subjects: { key: string; value: Subject };
  cheatsheets: { key: string; value: CheatSheet };
  schedulePdfs: { key: string; value: SchedulePDF };
}

const DB_NAME = "dnevnikmedika-db";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<DnevnikDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<DnevnikDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("events")) {
          db.createObjectStore("events", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("tasks")) {
          db.createObjectStore("tasks", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("subjects")) {
          db.createObjectStore("subjects", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("cheatsheets")) {
          db.createObjectStore("cheatsheets", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("schedulePdfs")) {
          db.createObjectStore("schedulePdfs", { keyPath: "id" });
        }
      },
    });
  }
  return dbPromise;
}

export function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
