"use client";

type Point = { label: string; value: number };

export function ActivityHeatmap({ data, title, emptyLabel }: { data: Point[]; title: string; emptyLabel: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-xl shadow-[#071d3a]/5">
      <h3 className="text-lg font-black text-[#071d3a]">{title}</h3>
      {data.length ? (
        <div className="mt-5 grid grid-cols-7 gap-2">
          {data.map((item, index) => {
            const opacity = 0.14 + (item.value / max) * 0.86;
            return (
              <div
                key={`activity-${index}-${item.label}`}
                title={`${item.label}: ${item.value}`}
                className="aspect-square rounded-lg border border-[#0f5f3a]/10"
                style={{ backgroundColor: `rgba(15, 95, 58, ${opacity})` }}
              />
            );
          })}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-500">{emptyLabel}</p>
      )}
    </section>
  );
}
