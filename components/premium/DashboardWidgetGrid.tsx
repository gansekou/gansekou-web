"use client";

import { GripVertical, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type DashboardWidget = {
  id: string;
  title: string;
  eyebrow: string;
  children: React.ReactNode;
};

export function DashboardWidgetGrid({
  widgets,
  storageKey,
  labels,
}: {
  widgets: DashboardWidget[];
  storageKey: string;
  labels: {
    collapse: string;
    expand: string;
    reorder: string;
  };
}) {
  const fallbackOrder = useMemo(() => widgets.map((widget) => widget.id), [widgets]);
  const [order, setOrder] = useState<string[]>(() => readWidgetOrder(storageKey, fallbackOrder));
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [dragged, setDragged] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(`${storageKey}:order`, JSON.stringify(order));
  }, [order, storageKey]);

  const widgetMap = new Map(widgets.map((widget) => [widget.id, widget]));
  const sortedWidgets = order.map((id) => widgetMap.get(id)).filter(Boolean) as DashboardWidget[];

  function move(targetId: string) {
    if (!dragged || dragged === targetId) return;
    setOrder((current) => {
      const next = current.filter((id) => id !== dragged);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, dragged);
      return next;
    });
  }

  return (
    <section className="grid gap-5 xl:grid-cols-2">
      {sortedWidgets.map((widget) => {
        const isCollapsed = collapsed[widget.id];
        return (
          <article
            key={widget.id}
            draggable
            onDragStart={() => setDragged(widget.id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => move(widget.id)}
            onDragEnd={() => setDragged(null)}
            className={`ds-card rounded-[2rem] p-5 transition ${dragged === widget.id ? "scale-[0.99] opacity-70" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#0f5f3a]">{widget.eyebrow}</p>
                <h3 className="mt-1 text-xl font-black text-[#071d3a]">{widget.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 cursor-grab items-center justify-center rounded-full bg-slate-100 text-slate-500" title={labels.reorder}>
                  <GripVertical size={18} />
                </span>
                <button
                  type="button"
                  onClick={() => setCollapsed((current) => ({ ...current, [widget.id]: !current[widget.id] }))}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-[#071d3a]"
                  aria-label={isCollapsed ? labels.expand : labels.collapse}
                >
                  {isCollapsed ? <Plus size={18} /> : <Minus size={18} />}
                </button>
              </div>
            </div>
            {!isCollapsed && <div className="mt-5">{widget.children}</div>}
          </article>
        );
      })}
    </section>
  );
}

function readWidgetOrder(storageKey: string, fallbackOrder: string[]) {
  if (typeof window === "undefined") return fallbackOrder;
  const stored = window.localStorage.getItem(`${storageKey}:order`);
  if (!stored) return fallbackOrder;
  try {
    const parsed = JSON.parse(stored) as string[];
    return [...parsed.filter((id) => fallbackOrder.includes(id)), ...fallbackOrder.filter((id) => !parsed.includes(id))];
  } catch {
    return fallbackOrder;
  }
}
