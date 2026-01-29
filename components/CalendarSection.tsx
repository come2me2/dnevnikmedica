"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { ru } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { loadEvents, saveEvent, deleteEvent } from "@/lib/store";
import type { CalendarEvent as DBEvent } from "@/lib/db";
import { EventModal } from "./EventModal";
import { UploadSchedule } from "./UploadSchedule";

const locales = { ru };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: DBEvent;
}

function toBigCal(ev: DBEvent): CalendarEvent {
  return {
    id: ev.id,
    title: ev.title,
    start: new Date(ev.start),
    end: new Date(ev.end),
    resource: ev,
  };
}

export function CalendarSection() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>("week");
  const [date, setDate] = useState(new Date());
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  const fetchEvents = useCallback(async () => {
    const list = await loadEvents();
    setEvents(list.map(toBigCal));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectEvent = (ev: CalendarEvent) => {
    setSelected(ev);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const newEv: CalendarEvent = {
      id: "",
      title: "Новое занятие",
      start,
      end,
    };
    setSelected(newEv);
  };

  const handleCloseModal = () => {
    setSelected(null);
  };

  const handleSave = async (ev: {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    subject?: string;
    location?: string;
  }) => {
    const saved = await saveEvent({
      id: ev.id || undefined,
      title: ev.title,
      start: ev.start,
      end: ev.end,
      subject: ev.subject,
      location: ev.location,
      taskIds: selected?.resource?.taskIds ?? [],
    });
    await fetchEvents();
    setSelected({ ...toBigCal(saved), resource: saved });
  };

  const handleDelete = async (id: string) => {
    await deleteEvent(id);
    await fetchEvents();
    setSelected(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Расписание занятий
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="rounded-lg border border-primary-500 bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 transition"
          >
            Загрузить PDF
          </button>
        </div>
      </div>

      {showUpload && (
        <UploadSchedule
          onClose={() => setShowUpload(false)}
          onSaved={async () => {
            await fetchEvents();
            setShowUpload(false);
          }}
        />
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-sm min-h-[500px]">
        <BigCalendar
          localizer={localizer}
          events={events}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          messages={{
            next: "Вперёд",
            previous: "Назад",
            today: "Сегодня",
            month: "Месяц",
            week: "Неделя",
            day: "День",
            agenda: "Повестка",
            date: "Дата",
            time: "Время",
            event: "Занятие",
            noEventsInRange: "В этом диапазоне нет занятий.",
          }}
        />
      </div>

      {selected && (
        <EventModal
          event={selected}
          onClose={handleCloseModal}
          onSave={handleSave}
          onDelete={selected.id ? () => handleDelete(selected.id) : undefined}
        />
      )}
    </div>
  );
}
