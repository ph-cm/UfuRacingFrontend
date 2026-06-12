"use client";

import { useEffect, useMemo, useState } from "react";

type Meeting = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time?: string;
  location?: string;
};

type BirthdayMember = {
  name: string;
  date: string; // YYYY-MM-DD (year is ignored — only month+day matter)
};

const LS_MEETINGS = "@ufuracing-admin-meetings";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function loadMeetings(): Meeting[] {
  try {
    const raw = localStorage.getItem(LS_MEETINGS);
    return raw ? (JSON.parse(raw) as Meeting[]) : [];
  } catch {
    return [];
  }
}

function saveMeetings(items: Meeting[]) {
  localStorage.setItem(LS_MEETINGS, JSON.stringify(items));
}

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AdminCalendar({
  birthdays = [],
}: {
  birthdays?: BirthdayMember[];
}) {
  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => toISODate(today));

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [form, setForm] = useState({ title: "", time: "", location: "" });

  useEffect(() => {
    setMeetings(loadMeetings());
  }, []);

  const monthLabel = cursor.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  const daysInMonth = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const last = new Date(y, m + 1, 0).getDate();
    return Array.from({ length: last }, (_, i) => i + 1);
  }, [cursor]);

  // First weekday of the month (0=Sun)
  const firstWeekday = useMemo(() => {
    return new Date(cursor.getFullYear(), cursor.getMonth(), 1).getDay();
  }, [cursor]);

  const selectedMeetings = useMemo(
    () =>
      meetings
        .filter((x) => x.date === selectedDate)
        .sort((a, b) => (a.time ?? "").localeCompare(b.time ?? "")),
    [meetings, selectedDate]
  );

  // Birthday helpers — compare only month+day (year-agnostic)
  const birthdaysOnDay = (cursorMonth: number, day: number): BirthdayMember[] => {
    return birthdays.filter((b) => {
      const parts = b.date.split("-");
      return (
        parseInt(parts[1] ?? "0", 10) === cursorMonth &&
        parseInt(parts[2] ?? "0", 10) === day
      );
    });
  };

  const selectedBirthdays = useMemo(() => {
    const parts = selectedDate.split("-");
    const m = parseInt(parts[1] ?? "0", 10);
    const d = parseInt(parts[2] ?? "0", 10);
    return birthdays.filter((b) => {
      const bp = b.date.split("-");
      return parseInt(bp[1] ?? "0", 10) === m && parseInt(bp[2] ?? "0", 10) === d;
    });
  }, [selectedDate, birthdays]);

  const addMeeting = () => {
    if (!form.title.trim()) return alert("Digite um título para a reunião.");
    const item: Meeting = {
      id: uid(),
      date: selectedDate,
      title: form.title.trim(),
      time: form.time.trim() || undefined,
      location: form.location.trim() || undefined,
    };
    const next = [item, ...meetings];
    setMeetings(next);
    saveMeetings(next);
    setForm({ title: "", time: "", location: "" });
  };

  const removeMeeting = (id: string) => {
    const next = meetings.filter((m) => m.id !== id);
    setMeetings(next);
    saveMeetings(next);
  };

  const hasMeeting = (day: number) => {
    const iso = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(day)}`;
    return meetings.some((m) => m.date === iso);
  };

  const pickDay = (day: number) => {
    const iso = `${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}-${pad2(day)}`;
    setSelectedDate(iso);
  };

  const goPrev = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const goNext = () => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const cursorMonth = cursor.getMonth() + 1;

  return (
    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div>
          <p className="font-black text-racing-blue uppercase text-[10px] tracking-[0.2em]">
            Calendário
          </p>
          <p className="text-[11px] font-bold text-gray-500 mt-0.5 capitalize">{monthLabel}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={goPrev}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-black text-sm"
            type="button"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 transition font-black text-sm"
            type="button"
          >
            ›
          </button>
        </div>
      </div>

      {/* LEGEND */}
      {birthdays.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-racing-blue inline-block" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Reunião</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-racing-gold inline-block" />
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Aniversário</span>
          </div>
        </div>
      )}

      {/* WEEKDAY HEADERS */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
          <span key={i} className="text-[9px] text-gray-300 font-bold text-center py-1">
            {d}
          </span>
        ))}
      </div>

      {/* DAY GRID */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Empty cells before first day */}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {daysInMonth.map((day) => {
          const iso = `${cursor.getFullYear()}-${pad2(cursorMonth)}-${pad2(day)}`;
          const isSelected = iso === selectedDate;
          const isToday = iso === toISODate(today);
          const meetingDot = hasMeeting(day);
          const bdays = birthdaysOnDay(cursorMonth, day);
          const hasBday = bdays.length > 0;

          return (
            <button
              key={day}
              onClick={() => pickDay(day)}
              type="button"
              title={hasBday ? `🎂 ${bdays.map((b) => b.name).join(", ")}` : undefined}
              className={[
                "relative text-[10px] py-2 rounded-xl text-center font-bold transition-all leading-none",
                isSelected
                  ? hasBday
                    ? "bg-racing-gold text-racing-blue shadow-lg"
                    : "bg-racing-red text-white shadow-lg shadow-racing-red/30"
                  : hasBday
                  ? "bg-racing-gold/15 text-racing-blue hover:bg-racing-gold/30"
                  : "text-gray-600 hover:bg-gray-50",
                isToday && !isSelected ? "ring-2 ring-racing-red/30" : "",
              ].join(" ")}
            >
              {day}
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                {meetingDot && (
                  <span className="w-1 h-1 rounded-full bg-racing-blue block" />
                )}
                {hasBday && (
                  <span className="w-1 h-1 rounded-full bg-racing-gold block" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* SELECTED DAY INFO */}
      <div className="mb-4 pb-4 border-b border-gray-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">
          Dia selecionado
        </p>
        <p className="font-black text-racing-blue text-sm">{formatBR(selectedDate)}</p>

        {/* Birthday members on this day */}
        {selectedBirthdays.length > 0 && (
          <div className="mt-2 space-y-1">
            {selectedBirthdays.map((b) => (
              <div
                key={b.name}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-racing-gold/10 rounded-xl border border-racing-gold/20"
              >
                <span className="text-xs">🎂</span>
                <span className="text-[10px] font-black text-racing-blue uppercase tracking-wide">
                  {b.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD MEETING */}
      <div className="space-y-2 mb-3">
        <input
          className="w-full p-2.5 bg-gray-50 rounded-xl outline-none text-xs"
          placeholder="Título da reunião"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="w-full p-2.5 bg-gray-50 rounded-xl outline-none text-xs"
            placeholder="Hora (19:00)"
            value={form.time}
            onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
          />
          <input
            className="w-full p-2.5 bg-gray-50 rounded-xl outline-none text-xs"
            placeholder="Local"
            value={form.location}
            onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
          />
        </div>
        <button
          onClick={addMeeting}
          className="w-full bg-racing-blue text-white py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-racing-red transition"
          type="button"
        >
          Adicionar reunião
        </button>
      </div>

      {/* MEETING LIST */}
      <div className="space-y-2">
        {selectedMeetings.length === 0 ? (
          <p className="text-[11px] text-gray-300 font-bold">Sem reuniões nesse dia.</p>
        ) : (
          selectedMeetings.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-gray-50 rounded-xl border-l-4 border-racing-red flex justify-between gap-2"
            >
              <div className="min-w-0">
                <p className="text-[10px] font-black text-racing-blue uppercase tracking-wider truncate">
                  {m.title}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">
                  {m.time ? `${m.time} · ` : ""}
                  {m.location ?? "—"}
                </p>
              </div>
              <button
                onClick={() => removeMeeting(m.id)}
                className="shrink-0 w-6 h-6 rounded-lg bg-white border border-gray-100 text-gray-400 hover:bg-racing-red hover:text-white flex items-center justify-center text-xs font-black transition"
                type="button"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
