"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { extractTextFromPDF, parseScheduleText } from "@/lib/pdf-parse";
import { saveEvent, saveSchedulePdf } from "@/lib/store";
import { genId } from "@/lib/db";

interface UploadScheduleProps {
  onClose: () => void;
  onSaved: () => void;
}

export function UploadSchedule({ onClose, onSaved }: UploadScheduleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<{ title: string; start: Date; end: Date }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
    setError(null);
    setParsed([]);
  };

  const parseAndPreview = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const text = await extractTextFromPDF(file);
      const events = parseScheduleText(text);
      setParsed(events);
      if (events.length === 0) {
        setError(
          "Не удалось извлечь расписание из PDF. Добавьте занятия вручную в календаре или сохраните PDF для справки."
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ошибка чтения PDF. Попробуйте другой файл."
      );
      setParsed([]);
    } finally {
      setLoading(false);
    }
  };

  const saveAll = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = reject;
      });
      const data = (reader.result as string).split(",")[1];
      if (data) await saveSchedulePdf(file.name, data);

      for (const ev of parsed) {
        await saveEvent({
          id: genId(),
          title: ev.title,
          start: ev.start,
          end: ev.end,
          subject: ev.title,
          taskIds: [],
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  const savePdfOnly = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      await new Promise<void>((resolve, reject) => {
        reader.onload = () => resolve();
        reader.onerror = reject;
      });
      const data = (reader.result as string).split(",")[1];
      if (data) await saveSchedulePdf(file.name, data);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">
          Загрузить расписание из PDF
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        Загрузите PDF с расписанием. Мы попытаемся извлечь занятия (день, время, название).
        Если автоматический разбор не сработает, сохраните PDF для справки и добавьте занятия вручную в календаре.
      </p>

      <div className="flex flex-wrap gap-2 items-center mb-4">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
        >
          <Upload className="h-4 w-4" />
          Выбрать PDF
        </button>
        {file && (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <FileText className="h-4 w-4" />
            {file.name}
          </span>
        )}
        {file && (
          <button
            type="button"
            onClick={parseAndPreview}
            disabled={loading}
            className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? "Обработка…" : "Разобрать"}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          {error}
        </div>
      )}

      {parsed.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Найдено занятий: {parsed.length}
          </p>
          <ul className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 divide-y divide-slate-200 dark:divide-slate-700">
            {parsed.slice(0, 20).map((ev, i) => (
              <li key={i} className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
                {ev.title} — {ev.start.toLocaleString("ru")} – {ev.end.toLocaleTimeString("ru", { hour: "2-digit", minute: "2-digit" })}
              </li>
            ))}
            {parsed.length > 20 && (
              <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                … и ещё {parsed.length - 20}
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {file && (
          <button
            type="button"
            onClick={savePdfOnly}
            disabled={loading}
            className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
          >
            Только сохранить PDF
          </button>
        )}
        {parsed.length > 0 && (
          <button
            type="button"
            onClick={saveAll}
            disabled={loading}
            className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition disabled:opacity-50"
          >
            {loading ? "Сохранение…" : "Сохранить PDF и занятия"}
          </button>
        )}
      </div>
    </div>
  );
}
