"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, X, Check, ChevronLeft, ChevronRight, Flag, Cake } from "lucide-react";
import { useMemberAuth } from "@/context/MemberAuthContext";
import { useProject } from "@/context/ProjectContext";

// ── Types ─────────────────────────────────────────────────────────────────────

type Priority = "high" | "medium" | "low";

type Task = {
  id: string;
  title: string;
  done: boolean;
  priority: Priority;
  dueDate?: string;
  createdAt: string;
};

type CalEvent = {
  id: string;
  date: string;
  title: string;
  type: "task" | "birthday";
};

// ── Design tokens ─────────────────────────────────────────────────────────────

const PRIORITY: Record<Priority, { label: string; accent: string; text: string }> = {
  high:   { label: "Alta",  accent: "border-l-crimson",  text: "text-crimson" },
  medium: { label: "Média", accent: "border-l-gold",     text: "text-gold" },
  low:    { label: "Baixa", accent: "border-l-navy/15",  text: "text-navy/30" },
};

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const WEEK_DAYS = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function calCells(year: number, month: number): (number | null)[] {
  const firstDow = new Date(year, month, 1).getDay();
  const days     = new Date(year, month + 1, 0).getDate();
  const pad      = (firstDow + 6) % 7; // Mon = 0
  return [
    ...Array<null>(pad).fill(null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
}

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

const todayIso = isoDate(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate(),
);

function fmtShort(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short",
  });
}

// ── Shared primitives ─────────────────────────────────────────────────────────

function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white">
      <div className="w-4 h-px bg-crimson shrink-0" />
      <span className="text-[10px] font-black uppercase tracking-[0.22em] text-navy/50 flex-1">
        {children}
      </span>
    </div>
  );
}

const inputCls =
  "w-full bg-mist border border-gray-100 text-navy text-xs px-3 py-2 focus:outline-none focus:border-navy/25 transition-colors placeholder:text-navy/25";

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PainelPage() {
  const { member } = useMemberAuth();
  const { members, news }  = useProject();

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const storageKey = `@ufuracing-tasks-${member?.id ?? 0}`;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "medium" as Priority, dueDate: "" });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTasks(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  function persist(next: Task[]) {
    setTasks(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  }

  function addTask() {
    if (!form.title.trim()) return;
    persist([
      {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        done: false,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ]);
    setForm({ title: "", priority: "medium", dueDate: "" });
    setShowForm(false);
  }

  function toggle(id: string) {
    persist(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function remove(id: string) {
    persist(tasks.filter((t) => t.id !== id));
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  const pending = tasks
    .filter((t) => !t.done)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  const done = tasks.filter((t) => t.done);
  const overdueTasks = pending.filter((t) => t.dueDate && t.dueDate < todayIso);

  // ── Calendar ──────────────────────────────────────────────────────────────
  const now  = new Date();
  const [calY, setCalY] = useState(now.getFullYear());
  const [calM, setCalM] = useState(now.getMonth());
  const [selDay, setSelDay] = useState(now.getDate());

  const cells = calCells(calY, calM);

  const eventsMap = useMemo(() => {
    const map: Record<string, CalEvent[]> = {};
    function push(key: string, ev: CalEvent) { (map[key] ??= []).push(ev); }

    tasks.filter((t) => t.dueDate && !t.done).forEach((t) =>
      push(t.dueDate!, { id: t.id, date: t.dueDate!, title: t.title, type: "task" })
    );
    members.forEach((m) => {
      if (!m.birthDate) return;
      const p = m.birthDate.slice(0, 10).split("-");
      if (p.length < 3) return;
      const bm = Number(p[1]) - 1, bd = Number(p[2]);
      if (bm !== calM) return;
      const key = isoDate(calY, calM, bd);
      push(key, { id: `bday-${m.id}`, date: key, title: m.name, type: "birthday" });
    });
    return map;
  }, [tasks, members, calY, calM]);

  const selKey    = isoDate(calY, calM, selDay);
  const selEvents = eventsMap[selKey] ?? [];

  function prevMonth() {
    if (calM === 0) { setCalY((y) => y - 1); setCalM(11); }
    else setCalM((m) => m - 1);
  }
  function nextMonth() {
    if (calM === 11) { setCalY((y) => y + 1); setCalM(0); }
    else setCalM((m) => m + 1);
  }

  // ── Upcoming birthdays ─────────────────────────────────────────────────────
  const upcomingBdays = useMemo(() => {
    const todayDay = now.getDate(), todayMon = now.getMonth();
    return members
      .filter((m) => {
        if (!m.birthDate) return false;
        const p = m.birthDate.slice(0, 10).split("-");
        return (
          p.length >= 3 &&
          Number(p[1]) - 1 === todayMon &&
          Number(p[2]) >= todayDay
        );
      })
      .sort((a, b) => Number(a.birthDate!.slice(8, 10)) - Number(b.birthDate!.slice(8, 10)))
      .slice(0, 4);
  }, [members]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="shrink-0 bg-white border-b border-gray-100 px-6 py-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-crimson mb-1">
            Área do Membro
          </p>
          <h1 className="text-lg font-black italic text-navy uppercase leading-none">Painel</h1>
        </div>
        <p className="text-[10px] font-bold text-navy/25 uppercase tracking-widest hidden sm:block">
          {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
        </p>
      </div>

      {/* ── 3-column layout ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto md:overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

          {/* ══ COL 1 · TASKS ══════════════════════════════════════════════ */}
          <div className="flex flex-col min-h-96 md:min-h-0 md:overflow-hidden bg-mist">

            <ColLabel>
              Tarefas
              {pending.length > 0 && (
                <span className="ml-auto text-[9px] font-black bg-crimson text-white px-1.5 py-0.5 min-w-5 text-center">
                  {pending.length}
                </span>
              )}
              <button
                onClick={() => setShowForm((v) => !v)}
                className="ml-2 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.12em] text-crimson hover:text-red-700 transition-colors shrink-0"
              >
                <Plus size={10} strokeWidth={2.5} />
                Nova
              </button>
            </ColLabel>

            {/* Add form */}
            {showForm && (
              <div className="shrink-0 bg-white border-b border-gray-100 px-4 py-3 flex flex-col gap-2">
                <input
                  autoFocus
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="Título da tarefa..."
                  className={inputCls}
                />
                <div className="flex gap-2">
                  <select
                    value={form.priority}
                    onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
                    className={`flex-1 ${inputCls}`}
                  >
                    <option value="high">Alta prioridade</option>
                    <option value="medium">Média prioridade</option>
                    <option value="low">Baixa prioridade</option>
                  </select>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                    className={`flex-1 ${inputCls}`}
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => { setShowForm(false); setForm({ title: "", priority: "medium", dueDate: "" }); }}
                    className="flex-1 py-2 border border-gray-200 text-[10px] font-bold uppercase tracking-widest text-navy/40 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addTask}
                    disabled={!form.title.trim()}
                    className="flex-1 py-2 bg-crimson text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-700 disabled:opacity-40 transition-colors"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            )}

            {/* Task list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5">
              {tasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-8 h-8 border border-navy/10 flex items-center justify-center mb-4">
                    <Check size={14} className="text-navy/15" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-black italic text-navy/25">Nenhuma tarefa</p>
                  <p className="text-[10px] text-navy/20 mt-1">Clique em Nova para começar</p>
                </div>
              )}

              {/* Pending */}
              {pending.map((t) => {
                const cfg = PRIORITY[t.priority];
                const overdue = t.dueDate && t.dueDate < todayIso;
                return (
                  <div
                    key={t.id}
                    className={`group flex items-start gap-3 bg-white border border-l-2 border-gray-100 ${cfg.accent} px-3 py-3 transition-colors hover:border-gray-200`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggle(t.id)}
                      className="shrink-0 w-4 h-4 border-2 border-navy/20 mt-0.5 hover:border-navy/50 transition-colors flex items-center justify-center"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-navy leading-snug">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${cfg.text}`}>
                          {cfg.label}
                        </span>
                        {t.dueDate && (
                          <>
                            <span className="text-navy/15 text-[9px]">·</span>
                            <span className={`text-[9px] font-bold ${overdue ? "text-crimson" : "text-navy/25"}`}>
                              {overdue && "Atrasada · "}{fmtShort(t.dueDate)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => remove(t.id)}
                      className="shrink-0 text-navy/15 hover:text-crimson transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}

              {/* Done separator */}
              {done.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-3 mb-1">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-navy/20">
                      Concluídas · {done.length}
                    </span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                  {done.map((t) => (
                    <div
                      key={t.id}
                      className="group flex items-center gap-3 border border-gray-100 bg-white px-3 py-2.5"
                    >
                      <button
                        onClick={() => toggle(t.id)}
                        className="shrink-0 w-4 h-4 bg-navy/8 border-2 border-navy/20 flex items-center justify-center"
                      >
                        <Check size={9} className="text-navy/40" strokeWidth={2.5} />
                      </button>
                      <p className="flex-1 text-xs text-navy/25 line-through leading-snug">{t.title}</p>
                      <button
                        onClick={() => remove(t.id)}
                        className="shrink-0 text-navy/15 hover:text-crimson opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* ══ COL 2 · CALENDAR ═══════════════════════════════════════════ */}
          <div className="flex flex-col min-h-96 md:min-h-0 md:overflow-hidden bg-white">

            <ColLabel>Calendário</ColLabel>

            <div className="flex-1 overflow-y-auto px-5 py-5">

              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={prevMonth}
                  className="w-7 h-7 border border-gray-100 flex items-center justify-center text-navy/30 hover:text-navy hover:border-gray-200 transition-colors"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-navy">
                  {MONTHS[calM]} {calY}
                </span>
                <button
                  onClick={nextMonth}
                  className="w-7 h-7 border border-gray-100 flex items-center justify-center text-navy/30 hover:text-navy hover:border-gray-200 transition-colors"
                >
                  <ChevronRight size={13} />
                </button>
              </div>

              {/* Week headers */}
              <div className="grid grid-cols-7 mb-0.5">
                {WEEK_DAYS.map((d) => (
                  <div key={d} className="text-center text-[9px] font-black uppercase tracking-widest text-navy/20 py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-px">
                {cells.map((day, i) => {
                  if (!day) return <div key={`pad-${i}`} />;
                  const key      = isoDate(calY, calM, day);
                  const isToday  = key === todayIso;
                  const isSel    = selDay === day;
                  const hasTask  = eventsMap[key]?.some((e) => e.type === "task");
                  const hasBday  = eventsMap[key]?.some((e) => e.type === "birthday");

                  return (
                    <button
                      key={day}
                      onClick={() => setSelDay(day)}
                      className={`flex flex-col items-center justify-center py-1.5 text-[11px] font-bold transition-all ${
                        isSel
                          ? "bg-navy text-white"
                          : isToday
                          ? "text-crimson font-black border-b-2 border-crimson"
                          : "text-navy/50 hover:bg-mist"
                      }`}
                    >
                      {day}
                      {(hasTask || hasBday) && (
                        <div className="flex gap-0.5 mt-0.5">
                          {hasTask && (
                            <span className={`w-1 h-1 ${isSel ? "bg-white/50" : "bg-crimson"}`} />
                          )}
                          {hasBday && (
                            <span className={`w-1 h-1 ${isSel ? "bg-white/50" : "bg-gold"}`} />
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected day events */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-4 h-px bg-crimson" />
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/35">
                    {String(selDay).padStart(2, "0")} · {MONTHS[calM]}
                  </p>
                </div>

                {selEvents.length === 0 ? (
                  <p className="text-[10px] text-navy/20 italic pl-7">Sem eventos</p>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {selEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`flex items-center gap-3 px-3 py-2 border-l-2 ${
                          ev.type === "birthday"
                            ? "border-l-gold bg-mist"
                            : "border-l-crimson bg-mist"
                        }`}
                      >
                        {ev.type === "birthday"
                          ? <Cake size={11} className="text-gold shrink-0" strokeWidth={2} />
                          : <Flag size={11} className="text-crimson shrink-0" strokeWidth={2} />
                        }
                        <span className="text-[10px] font-bold text-navy truncate">{ev.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ══ COL 3 · UPDATES ════════════════════════════════════════════ */}
          <div className="flex flex-col min-h-96 md:min-h-0 md:overflow-hidden bg-mist">

            <ColLabel>Atualizações</ColLabel>

            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">

              {/* Overdue alert */}
              {overdueTasks.length > 0 && (
                <div className="flex items-start gap-3 bg-white border border-l-2 border-gray-100 border-l-crimson px-3 py-3">
                  <Flag size={14} className="text-crimson shrink-0 mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-[10px] font-black text-crimson uppercase tracking-wide leading-tight">
                      {overdueTasks.length} {overdueTasks.length === 1 ? "tarefa atrasada" : "tarefas atrasadas"}
                    </p>
                    <p className="text-[9px] text-navy/35 mt-0.5 leading-snug">
                      {overdueTasks.map((t) => t.title).join(" · ")}
                    </p>
                  </div>
                </div>
              )}

              {/* Upcoming birthdays */}
              {upcomingBdays.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-4 h-px bg-gold" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/30">
                      Aniversários este mês
                    </span>
                  </div>
                  {upcomingBdays.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 bg-white border border-l-2 border-gray-100 border-l-gold px-3 py-3"
                    >
                      <Cake size={14} className="text-gold shrink-0" strokeWidth={1.75} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-navy uppercase leading-tight truncate">
                          {m.name}
                        </p>
                        <p className="text-[9px] text-navy/35 mt-0.5">
                          {fmtShort(m.birthDate!)}
                        </p>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* News */}
              {news.length > 0 && (
                <>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="w-4 h-px bg-crimson" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-navy/30">
                      Notícias
                    </span>
                  </div>
                  {news.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      className="bg-white border border-gray-100 px-3 py-3 hover:border-gray-200 transition-colors"
                    >
                      <p className="text-[10px] font-black text-navy leading-snug">{n.title}</p>
                      {n.summary && (
                        <p className="text-[9px] text-navy/35 mt-1 line-clamp-2 leading-relaxed">
                          {n.summary}
                        </p>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Empty state */}
              {upcomingBdays.length === 0 && news.length === 0 && overdueTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-8 h-8 border border-navy/10 flex items-center justify-center mb-4">
                    <div className="w-2 h-2 bg-navy/10" />
                  </div>
                  <p className="text-xs font-black italic text-navy/25">Tudo em dia</p>
                  <p className="text-[10px] text-navy/20 mt-1">Nenhuma atualização pendente</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
