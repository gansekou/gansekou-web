"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { platformService } from "@/services/platform.service";
import { canCreateCourse } from "@/lib/permissions";
import type { Content } from "@/types/content";
import type { Level, PageData, Subject } from "@/types/platform";
import type { User } from "@/types/user";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/files";

export function CoursesPage() {
  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects] = await Promise.all([
      platformService.contents.byType("COURS").catch(() => [] as Content[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
    ]);
    return { contents, levels, subjects };
  }, []);

  return (
    <AuthenticatedPage loadingLabel="Chargement des cours..." load={load}>
      {({ user, data }) => (
        <CourseCatalog
          user={user}
          contents={(data.contents as Content[]) || []}
          levels={(data.levels as Level[]) || []}
          subjects={(data.subjects as Subject[]) || []}
        />
      )}
    </AuthenticatedPage>
  );
}

function CourseCatalog({ user, contents, levels, subjects }: { user: User; contents: Content[]; levels: Level[]; subjects: Subject[] }) {
  const [query, setQuery] = useState("");
  const [levelId, setLevelId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const filtered = useMemo(
    () =>
      contents.filter((item) => {
        const label = `${item.title || ""} ${item.description || ""}`.toLowerCase();
        return (
          (!query || label.includes(query.toLowerCase())) &&
          (!levelId || item.level_id === levelId) &&
          (!subjectId || item.subject_id === subjectId) &&
          (!premiumOnly || item.is_premium)
        );
      }),
    [contents, levelId, premiumOnly, query, subjectId]
  );

  return (
    <section className="rounded-[2rem] bg-white p-7 shadow-xl shadow-[#082f1f]/5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <h3 className="text-2xl font-black text-[#082f1f]">Parcours de cours</h3>
          <p className="mt-2 text-sm font-bold text-slate-500">Cours disponibles selon votre espace Gansekou.</p>
        </div>
        {canCreateCourse(user) ? <Link href="/courses/new" className="ds-button-primary">Ajouter un cours</Link> : null}
      </div>
      <div className="mt-6 grid gap-2 md:grid-cols-4">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none" />
        <select value={levelId} onChange={(event) => setLevelId(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
          <option value="">Niveau</option>
          {levels.map((level) => <option key={level.id} value={level.id}>{level.name_fr}</option>)}
        </select>
        <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
          <option value="">Matiere</option>
          {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name_fr}</option>)}
        </select>
        <button type="button" onClick={() => setPremiumOnly((value) => !value)} className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black ${premiumOnly ? "bg-[#f6c445] text-[#082f1f]" : "bg-slate-100 text-slate-600"}`}>
          <Filter size={16} />
          Premium
        </button>
      </div>
      {!filtered.length ? (
  <EmptyState
    title="Aucun cours disponible"
    message="Les cours publiés apparaîtront ici."
  />
) : (
  <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {filtered.map((item) => (
              <Link
                key={item.id}
                href={`/courses/${item.id}`}
                className="group overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Image */}
                <div className="relative overflow-hidden">
                  <Image
                    src={getThumbnailUrl(item.thumbnail_url)}
                    alt={item.title || "Cours Gansekou"}
                    width={400}
                    height={240}
                    className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
                  />
        
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
                  <span className="absolute left-4 top-4 rounded-full bg-[#0f5f3a] px-3 py-1 text-xs font-bold text-white shadow">
                    📘 COURS
                  </span>
        
                  {item.is_premium && (
                    <span className="absolute right-4 top-4 rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#082f1f] shadow-lg">
                      ⭐ PREMIUM
                    </span>
                  )}
                </div>
        
                {/* Contenu */}
                <div className="p-5">
        
                  <h3 className="line-clamp-2 text-lg font-extrabold text-[#082f1f]">
                    {item.title || "Cours sans titre"}
                  </h3>
        
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {item.description || "Aucune description disponible."}
                  </p>
        
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
        
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {item.status || "APPROVED"}
                    </span>
        
                    <span className="text-sm font-bold text-[#0f5f3a] transition group-hover:translate-x-1">
                      Voir le cours →
                    </span>
        
                  </div>
        
                </div>
              </Link>
            ))}
          </div>
        )}
       
    </section>
  );
}

