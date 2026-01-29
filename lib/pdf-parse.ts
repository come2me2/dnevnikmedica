"use client";

import * as pdfjsLib from "pdfjs-dist";

// PDF.js worker — use legacy build for browser
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export interface ParsedEvent {
  title: string;
  start: Date;
  end: Date;
  subject?: string;
}

const DAY_ABBREV: Record<string, number> = {
  пн: 1,
  вт: 2,
  ср: 3,
  чт: 4,
  пт: 5,
  сб: 6,
  вс: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

const TIME_RE = /(\d{1,2})\s*[:.]\s*(\d{2})\s*[-–—]\s*(\d{1,2})\s*[:.]\s*(\d{2})/i;
const DATE_RE = /(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?/;

function parseTimePair(s: string): { h: number; m: number } | null {
  const m = s.match(/(\d{1,2})\s*[:.]\s*(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

function parseTimeRange(s: string): { start: { h: number; m: number }; end: { h: number; m: number } } | null {
  const m = s.match(TIME_RE);
  if (!m) return null;
  const start = { h: parseInt(m[1], 10), m: parseInt(m[2], 10) };
  const end = { h: parseInt(m[3], 10), m: parseInt(m[4], 10) };
  if (start.h > 23 || start.m > 59 || end.h > 23 || end.m > 59) return null;
  return { start, end };
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const chunks: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((it) => ("str" in it ? it.str || "" : ""))
      .join(" ");
    chunks.push(text);
  }
  return chunks.join("\n");
}

/**
 * Эвристический парсинг расписания из текста PDF.
 * Ищем паттерны: день недели, время "ЧЧ:ММ–ЧЧ:ММ", название занятия.
 */
export function parseScheduleText(text: string, baseDate?: Date): ParsedEvent[] {
  const events: ParsedEvent[] = [];
  const base = baseDate ? new Date(baseDate) : new Date();
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    let dayOffset = 0;
    for (const [abbrev, d] of Object.entries(DAY_ABBREV)) {
      if (lower.includes(abbrev)) {
        const today = base.getDay();
        dayOffset = (d + 7 - today) % 7;
        if (dayOffset === 0 && d !== today) dayOffset = 7;
        break;
      }
    }

    const range = parseTimeRange(line);
    if (!range) continue;

    let title = line
      .replace(TIME_RE, "")
      .replace(/^\s*(пн|вт|ср|чт|пт|сб|вс|mon|tue|wed|thu|fri|sat|sun)[.\s]*/gi, "")
      .trim();
    if (!title) {
      if (i + 1 < lines.length && !parseTimeRange(lines[i + 1]) && !DATE_RE.test(lines[i + 1])) {
        title = lines[i + 1].trim();
      } else {
        title = "Занятие";
      }
    }

    const start = new Date(base);
    start.setDate(start.getDate() + dayOffset);
    start.setHours(range.start.h, range.start.m, 0, 0);

    const end = new Date(base);
    end.setDate(end.getDate() + dayOffset);
    end.setHours(range.end.h, range.end.m, 0, 0);

    events.push({ title, start, end, subject: title });
  }

  return events;
}
