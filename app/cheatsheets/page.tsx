"use client";

import { useEffect, useState, useCallback } from "react";
import {
  loadSubjects,
  loadCheatSheets,
  saveSubject,
  saveCheatSheet,
  deleteSubject,
  deleteCheatSheet,
} from "@/lib/store";
import type { Subject, CheatSheet } from "@/lib/db";
import Image from "next/image";
import { Plus, Trash2, FileText, Image as ImageIcon, Type, X } from "lucide-react";
import { genId } from "@/lib/db";

export default function CheatSheetsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sheets, setSheets] = useState<CheatSheet[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [viewing, setViewing] = useState<CheatSheet | null>(null);

  const fetchSubjects = async () => {
    const list = await loadSubjects();
    setSubjects(list);
  };

  const fetchSheets = useCallback(async () => {
    if (!selectedSubjectId) {
      setSheets([]);
      return;
    }
    const list = await loadCheatSheets(selectedSubjectId);
    setSheets(list);
  }, [selectedSubjectId]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchSheets();
  }, [fetchSheets]);

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    const sub = await saveSubject({ name: newSubjectName.trim() });
    setNewSubjectName("");
    setShowAddSubject(false);
    await fetchSubjects();
    setSelectedSubjectId(sub.id);
  };

  const addSheet = async (
    name: string,
    type: CheatSheet["type"],
    data: string,
    mimeType?: string
  ) => {
    if (!selectedSubjectId || !name.trim()) return;
    await saveCheatSheet({
      subjectId: selectedSubjectId,
      name: name.trim(),
      type,
      data,
      mimeType,
    });
    setShowAddSheet(false);
    await fetchSheets();
  };

  const removeSubject = async (id: string) => {
    if (!confirm("Удалить предмет и все его шпаргалки?")) return;
    await deleteSubject(id);
    if (selectedSubjectId === id) setSelectedSubjectId(null);
    await fetchSubjects();
    await fetchSheets();
  };

  const removeSheet = async (id: string) => {
    await deleteCheatSheet(id);
    if (viewing?.id === id) setViewing(null);
    await fetchSheets();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Шпаргалки
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Предметы
            </span>
            <button
              type="button"
              onClick={() => setShowAddSubject(true)}
              className="rounded-lg p-1.5 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {showAddSubject && (
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubject()}
                placeholder="Новый предмет"
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addSubject}
                className="rounded-lg bg-primary-500 px-3 py-2 text-white text-sm hover:bg-primary-600"
              >
                OK
              </button>
            </div>
          )}
          <ul className="space-y-1">
            {subjects.map((s) => (
              <li key={s.id} className="flex items-center gap-2 group">
                <button
                  type="button"
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`flex-1 text-left rounded-lg px-3 py-2 text-sm font-medium transition ${
                    selectedSubjectId === s.id
                      ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {s.name}
                </button>
                <button
                  type="button"
                  onClick={() => removeSubject(s.id)}
                  className="opacity-0 group-hover:opacity-100 rounded p-1 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm min-h-[300px]">
          {!selectedSubjectId ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-12">
              Выберите предмет слева или добавьте новый.
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-slate-800 dark:text-slate-100">
                  {subjects.find((s) => s.id === selectedSubjectId)?.name}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddSheet(true)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary-500 bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 transition"
                >
                  <Plus className="h-4 w-4" />
                  Добавить шпаргалку
                </button>
              </div>

              {showAddSheet && (
                <AddSheetForm
                  onAdd={addSheet}
                  onCancel={() => setShowAddSheet(false)}
                />
              )}

              <ul className="space-y-2">
                {sheets.map((sh) => (
                  <li
                    key={sh.id}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 group"
                  >
                    {sh.type === "text" && <Type className="h-5 w-5 text-slate-500 shrink-0" />}
                    {sh.type === "pdf" && <FileText className="h-5 w-5 text-red-500 shrink-0" />}
                    {sh.type === "image" && <ImageIcon className="h-5 w-5 text-emerald-500 shrink-0" />}
                    <button
                      type="button"
                      onClick={() => setViewing(sh)}
                      className="flex-1 text-left text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {sh.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSheet(sh.id)}
                      className="rounded p-1 text-slate-400 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
              {sheets.length === 0 && !showAddSheet && (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8 text-sm">
                  Нет шпаргалок. Добавьте первую.
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {viewing && (
        <SheetViewer sheet={viewing} onClose={() => setViewing(null)} />
      )}
    </div>
  );
}

function AddSheetForm({
  onAdd,
  onCancel,
}: {
  onAdd: (name: string, type: CheatSheet["type"], data: string, mimeType?: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"text" | "file">("text");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFile(f || null);
  };

  const submit = async () => {
    if (!name.trim()) return;
    if (mode === "text") {
      await onAdd(name.trim(), "text", text);
      return;
    }
    if (!file) return;
    const b64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.indexOf(",") >= 0 ? result.split(",")[1]! : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const mime = file.type;
    const type: CheatSheet["type"] =
      mime === "application/pdf"
        ? "pdf"
        : mime.startsWith("image/")
          ? "image"
          : "text";
    await onAdd(name.trim(), type, b64, mime);
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            mode === "text"
              ? "bg-primary-500 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
          }`}
        >
          Текст
        </button>
        <button
          type="button"
          onClick={() => setMode("file")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            mode === "file"
              ? "bg-primary-500 text-white"
              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
          }`}
        >
          Файл (PDF, картинка)
        </button>
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название шпаргалки"
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm mb-3"
      />
      {mode === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Текст шпаргалки…"
          rows={4}
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm mb-3 resize-y"
        />
      )}
      {mode === "file" && (
        <input
          type="file"
          accept=".pdf,application/pdf,image/*"
          onChange={handleFile}
          className="block w-full text-sm text-slate-600 dark:text-slate-400 mb-3 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-primary-700 dark:file:bg-primary-900/40 dark:file:text-primary-300"
        />
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={() => submit()}
          disabled={!name.trim() || (mode === "text" ? false : !file)}
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
        >
          Добавить
        </button>
      </div>
    </div>
  );
}

function SheetViewer({ sheet, onClose }: { sheet: CheatSheet; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (sheet.type === "text") {
      setDataUrl(null);
      return;
    }
    const mime = sheet.mimeType || (sheet.type === "pdf" ? "application/pdf" : "image/png");
    setDataUrl(`data:${mime};base64,${sheet.data}`);
  }, [sheet]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-4 py-3 shrink-0">
          <h2 className="font-semibold text-slate-800 dark:text-slate-100 truncate">
            {sheet.name}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {sheet.type === "text" && (
            <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 dark:text-slate-300">
              {sheet.data}
            </pre>
          )}
          {sheet.type === "pdf" && dataUrl && (
            <iframe
              src={dataUrl}
              title={sheet.name}
              className="w-full h-[70vh] rounded-lg border border-slate-200 dark:border-slate-700"
            />
          )}
          {sheet.type === "image" && dataUrl && (
            <Image
              src={dataUrl}
              alt={sheet.name}
              width={1200}
              height={900}
              className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700"
              unoptimized
            />
          )}
        </div>
      </div>
    </div>
  );
}
