"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/files";
import { ContentEditor } from "@/components/content/ContentEditor";
import { ContentMediaViewer } from "@/components/content/ContentMediaViewer";
import { ContentManager } from "@/components/content/ContentManager";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import { downloadAuthenticatedFile, getContentMainUrl } from "@/lib/content-media";
import { isAdminRole, isStudentRole } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type { Level, PageData, Specialty, Subject } from "@/types/platform";
import type { User } from "@/types/user";

type LearningKind = "exercises" | "subjects";

const config = {
  exercises: {
    type: "EXERCICE",
    listTitleKey: "exercise.title",
    listHelpKey: "exercise.help",
    addKey: "exercise.add",
    detailKey: "exercise.detail",
    similarKey: "exercise.similar",
    emptyKey: "exercise.empty",
    actionKey: "exercise.view",
    basePath: "/exercises",
    adminPath: "/admin/exercises",
  },
  subjects: {
    type: "SUJET",
    listTitleKey: "subjectPaper.title",
    listHelpKey: "subjectPaper.help",
    addKey: "subjectPaper.add",
    detailKey: "subjectPaper.detail",
    similarKey: "subjectPaper.similar",
    emptyKey: "subjectPaper.empty",
    actionKey: "subjectPaper.view",
    basePath: "/subjects",
    adminPath: "/admin/subjects",
  },
} as const;

export function LearningContentListPage({ kind }: { kind: LearningKind }) {
  const settings = config[kind];
  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects, specialties] = await Promise.all([
      platformService.contents.byTypeAll(settings.type).catch(() => [] as Content[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
    ]);
    return { contents, levels, subjects, specialties };
  }, [settings.type]);

  return (
    <AuthenticatedPage loadingLabel="Chargement..." load={load}>
      {({ user, data }) => (
        <LearningContentCatalog
          kind={kind}
          user={user}
          contents={(data.contents as Content[]) || []}
          levels={(data.levels as Level[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          specialties={(data.specialties as Specialty[]) || []}
        />
      )}
    </AuthenticatedPage>
  );
}

export function LearningContentDetailPage({
  kind,
  id,
}: {
  kind: LearningKind;
  id?: string;
}) {
  const load = useCallback(async (): Promise<PageData> => {
    if (!id) return {};

    // 1. Charger le contenu en premier
    const content = await platformService.contents
      .byId(id)
      .catch(() => undefined);

    return { content };
  }, [id]);

  return (
    <AuthenticatedPage loadingLabel="Chargement..." load={load}>
      {({ user, data, reload }) => (
        <LearningContentDetail
          kind={kind}
          user={user}
          content={(data.content as Content | null) || null}
          related={[]}
          translations={[]}
          levels={[]}
          subjects={[]}
          specialties={[]}
          courses={[]}
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}

export function AdminLearningContentListPage({ kind }: { kind: LearningKind }) {
  const settings = config[kind];
  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects, specialties] = await Promise.all([
      platformService.contents.allPages().catch(() => [] as Content[]),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
    ]);
    return { contents: contents.filter((item) => item.content_type === settings.type), levels, subjects, specialties };
  }, [settings.type]);

  return (
    <AuthenticatedPage loadingLabel="Chargement..." load={load}>
      {({ user, data, reload }) => (
        <AdminLearningContentManager
          kind={kind}
          user={user}
          contents={(data.contents as Content[]) || []}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}

function AdminLearningContentManager({
  kind,
  user,
  contents,
  subjects,
  levels,
  reload,
}: {
  kind: LearningKind;
  user: User;
  contents: Content[];
  subjects: Subject[];
  levels: Level[];
  reload: () => Promise<void>;
}) {
  const settings = config[kind];
  const { t } = useI18n(user);

  return (
    <ContentManager
      user={user}
      contents={contents}
      subjects={subjects}
      levels={levels}
      scope={kind}
      basePathOverride={settings.adminPath}
      title={t(settings.listTitleKey)}
      createLabel={t(settings.addKey)}
      createAllowed={isAdminRole(user)}
      reload={reload}
    />
  );
}

export function AdminLearningContentEditorPage({ kind, id }: { kind: LearningKind; id?: string }) {
  const settings = config[kind];
  const load = useCallback(async (): Promise<PageData> => {
    const [content, levels, subjects, specialties] = await Promise.all([
      id ? platformService.contents.byId(id).catch(() => undefined) : Promise.resolve(undefined),
      platformService.education.levels().catch(() => [] as Level[]),
      platformService.education.subjects().catch(() => [] as Subject[]),
      platformService.education.specialties().catch(() => [] as Specialty[]),
    ]);
    return { content, levels, subjects, specialties };
  }, [id]);

  return (
    <AuthenticatedPage loadingLabel="Chargement..." load={load}>
      {({ user, data, reload }) => (
        <ContentEditor
          user={user}
          content={(data.content as Content | null) || null}
          subjects={(data.subjects as Subject[]) || []}
          levels={(data.levels as Level[]) || []}
          specialties={(data.specialties as Specialty[]) || []}
          defaultType={settings.type}
          lockedType={settings.type}
          scope={kind}
          redirectBasePath={settings.adminPath}
          reload={reload}
        />
      )}
    </AuthenticatedPage>
  );
}

function LearningContentCatalog({
  kind,
  user,
  contents,
  levels,
  subjects,
  specialties,
}: {
  kind: LearningKind;
  user: User;
  contents: Content[];
  levels: Level[];
  subjects: Subject[];
  specialties: Specialty[];
}) {
  const settings = config[kind];
  const { t } = useI18n(user);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [levelId, setLevelId] = useState("");
  const [specialtyId, setSpecialtyId] = useState("");
  const [year, setYear] = useState("");
  const [examType, setExamType] = useState("");
  const subjectById = useMemo(() => new Map(subjects.map((item) => [item.id, item])), [subjects]);
  const levelById = useMemo(() => new Map(levels.map((item) => [item.id, item])), [levels]);
  const years = Array.from(new Set(contents.map(readYear).filter(Boolean))).sort().reverse();
  const examTypes = Array.from(new Set(contents.map(readExamType).filter(Boolean)));
  const filtered = contents.filter((item) => {
    const label = `${item.title || ""} ${item.description || ""} ${item.tags || ""}`.toLowerCase();
    return (
      (!query || label.includes(query.toLowerCase())) &&
      (!subjectId || item.subject_id === subjectId) &&
      (!levelId || item.level_ids?.includes(levelId)) &&
      (!specialtyId || item.specialty_ids?.includes(specialtyId)) &&
      (!year || readYear(item) === year) &&
      (!examType || readExamType(item) === examType)
    );
  });

  return (
    <section className="grid gap-5">
      <section className="rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t(settings.listTitleKey)}</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">{t(settings.listTitleKey)}</h2>
            <p className="mt-3 max-w-2xl text-sm font-bold leading-7 text-white/70">{t(settings.listHelpKey)}</p>
          </div>
          {isAdminRole(user) ? <Link href={settings.adminPath + "/new"} className="ds-button-premium">{t(settings.addKey)}</Link> : null}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <div className={`grid gap-3 ${kind === "subjects" ? "lg:grid-cols-6" : "lg:grid-cols-4"}`}>
          <label className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("common.search")} className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 text-sm font-bold outline-none" />
          </label>
          <Select value={subjectId} onChange={setSubjectId} label={t("common.subject")} options={subjects.map((item) => [item.id, item.name_fr])} />
          <Select value={levelId} onChange={setLevelId} label={t("common.level")} options={levels.map((item) => [item.id, item.name_fr])} />
          <Select value={specialtyId} onChange={setSpecialtyId} label={t("subject.specialty")} options={specialties.map((item) => [item.id, item.name_fr])} />
          {kind === "subjects" ? <Select value={year} onChange={setYear} label={t("content.year")} options={years.map((item) => [item, item])} /> : null}
          {kind === "subjects" ? <Select value={examType} onChange={setExamType} label={t("content.examType")} options={examTypes.map((item) => [item, item])} /> : null}
        </div>

        {!filtered.length ? (
          <EmptyState title={t(settings.emptyKey)} message={t("state.emptyContent")} />
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg"
              >
          
                {item.thumbnail_url && (
                  <div className="relative mb-4 h-40 w-full overflow-hidden rounded-xl">
                    <Image
                      src={getThumbnailUrl(item.thumbnail_url)}
                      alt={item.translations?.[0]?.title || "Thumbnail exercice"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
          
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#0f5f3a]/10 px-3 py-1 text-xs font-black text-[#0f5f3a]">
                      {item.content_type}
                    </span>
                
                    {item.is_premium ? (
                      <span className="rounded-full bg-[#f6c445] px-3 py-1 text-xs font-black text-[#071d3a]">
                        PREMIUM
                      </span>
                    ) : null}
                  </div>
                
                  {item.is_available_offline ? (
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">
                      {t("content.offline")}
                    </span>
                  ) : null}
                </div>
          
                <h3 className="font-black text-[#082f1f]">
                  {item.translations?.[0]?.title || `${item.content_type} ${item.id.slice(0, 8)}`}
                </h3>
          
                <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-500">
                  {item.translations?.[0]?.description || item.status}
                </p>
          
                <dl className="mt-4 grid gap-2 text-xs font-bold text-slate-500">
                  <Meta
                    label={t("common.subject")}
                    value={subjectById.get(item.subject_id)?.name_fr || "-"}
                  />
          
                  <Meta
                    label={t("common.level")}
                    value={
                      item.level_ids
                        ?.map((id) => levelById.get(id)?.name_fr)
                        .filter(Boolean)
                        .join(", ") || "-"
                    }
                  />
          
                  {kind === "subjects" ? (
                    <Meta
                      label={t("content.year")}
                      value={readYear(item) || "-"}
                    />
                  ) : null}
                </dl>
          
                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (item.is_premium && isStudentRole(user) && !user.is_premium) {
                        router.push("/premium");
                        return;
                      }
                  
                      router.push(`${settings.basePath}/${item.id}`);
                    }}
                    className="rounded-full bg-[#0f5f3a] px-4 py-2 text-sm font-black text-white"
                  >
                    {t(settings.actionKey)}
                  </button>
          
                  {item.is_available_offline && getContentMainUrl(item) ? (
                    <DownloadButton
                      content={item}
                      label={t("content.download")}
                      isPremiumUser={Boolean(user.is_premium)}
                    />
                  ) : null}
                </div>
          
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

function LearningContentDetail({
  kind,
  user,
  content,
  related,
  translations,
  levels,
  subjects,
  specialties,
  courses,
}: {
  kind: LearningKind;
  user: User;
  content?: Content | null;
  related: Content[];
  translations: { title?: string; description?: string }[];
  levels: Level[];
  subjects: Subject[];
  specialties: Specialty[];
  courses: Content[];
  reload: () => Promise<void>;
}) {
  const settings = config[kind];
  const { t } = useI18n(user);
  const router = useRouter();

  const [detailData, setDetailData] = useState({
    related: [] as Content[],
    translations: [] as { title?: string; description?: string }[],
    levels: [] as Level[],
    subjects: [] as Subject[],
    specialties: [] as Specialty[],
    courses: [] as Content[],
    loading: true,
  });
  const subjectById = useMemo(
    () => new Map(detailData.subjects.map((item) => [item.id, item])),
    [detailData.subjects]
  );
  
  const levelById = useMemo(
    () => new Map(detailData.levels.map((item) => [item.id, item])),
    [detailData.levels]
  );
  
  const specialtyById = useMemo(
    () => new Map(detailData.specialties.map((item) => [item.id, item])),
    [detailData.specialties]
  );

  
  
  useEffect(() => {
    if (!content) return;
  
    // Le contenu Premium est déjà contrôlé juste après.
    // Si l'utilisateur n'a pas accès, on ne charge rien.
    if (content.is_premium && !user.is_premium) {
      return;
    }
  
    let cancelled = false;
  
    async function loadDetails() {
      if (!content) return;
    
      const contentId = content.id;
    
      const [
        related,
        translations,
        levels,
        subjects,
        specialties,
        courses,
      ] = await Promise.all([
        platformService.contents
          .related(contentId)
          .catch(() => [] as Content[]),
    
        platformService.contents
          .translations(content.id)
          .then(
            (value) =>
              value as { title?: string; description?: string }[]
          )
          .catch(
            () => [] as { title?: string; description?: string }[]
          ),
    
        platformService.education
          .levels()
          .catch(() => [] as Level[]),
    
        platformService.education
          .subjects()
          .catch(() => [] as Subject[]),
    
        platformService.education
          .specialties()
          .catch(() => [] as Specialty[]),
    
        platformService.contents
          .byTypeAll("COURS")
          .catch(() => [] as Content[]),
      ]);
    
      if (!cancelled) {
        setDetailData({
          related,
          translations,
          levels,
          subjects,
          specialties,
          courses,
          loading: false,
        });
      }
    }


    
    loadDetails();
  
    return () => {
      cancelled = true;
    };
  }, [content, user.is_premium]);


  if (!content || content.content_type !== settings.type) {
    return <EmptyState title={t("content.notFound")} message={t("content.notFound")} />;
  }

  console.log("PREMIUM", {
    contentPremium: content?.is_premium,
    userPremium: user.is_premium,
  });

  if (content?.is_premium && !user.is_premium) {
    router.replace("/premium");
    return null;
  }

  const translation = detailData.translations[0];
  const title = translation?.title || content.title || `${content.content_type} ${content.id.slice(0, 8)}`;
  const description = translation?.description || content.description || "";
  const similar = detailData.related.filter(
    (item) =>
      item.content_type === settings.type &&
      item.subject_id === content.subject_id &&
      item.level_ids?.some((id) => content.level_ids?.includes(id))
  );
  
 const recommendedCourse = detailData.courses.find(
    (item) =>
      item.subject_id === content.subject_id &&
      item.level_ids?.some((id) => content.level_ids?.includes(id))
  );

  return (
    <section className="grid gap-5">
      <section className="rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">
        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">{t(settings.detailKey)}</p>
        <h2 className="mt-3 text-4xl font-black tracking-tight">{title}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-white/70">{description || content.content_type}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {content.is_available_offline && getContentMainUrl(content) ? (
            <DownloadButton
              content={content}
              label={t("content.download")}
              dark
              isPremiumUser={user.is_premium === true}
            />
          ) : null}
          <Link href={config[kind].basePath} className="rounded-full bg-white/10 px-5 py-3 font-black text-white">{t("content.all")}</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Info label={t("common.subject")} value={subjectById.get(content.subject_id)?.name_fr || "-"} />
        <Info
          label={t("common.level")}
          value={
            content.level_ids
              ?.map((id) => levelById.get(id)?.name_fr)
              .filter(Boolean)
              .join(", ") || "-"
          }
        />
        <Info
          label={t("subject.specialty")}
          value={
            content.specialty_ids
              ?.map((id) => specialtyById.get(id)?.name_fr)
              .filter(Boolean)
              .join(", ") || "-"
          }
        />
        {kind === "subjects" ? <Info label={t("content.year")} value={readYear(content) || "-"} /> : null}
        {kind === "subjects" ? <Info label={t("content.examType")} value={readExamType(content) || "-"} /> : null}
        <Info label={t("content.offline")} value={content.is_available_offline ? t("common.yes") : t("common.no")} />
      </section>

      <ContentMediaViewer content={content} t={t} />

      {recommendedCourse ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
          <h3 className="text-2xl font-black text-[#071d3a]">{t("content.recommendedCourse")}</h3>
          <Link href={`/courses/${recommendedCourse.id}`} className="mt-5 block rounded-2xl bg-slate-50 p-5 font-black text-[#071d3a] transition hover:bg-white hover:shadow-lg">
            <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">COURS</span>
            <p className="mt-3">{recommendedCourse.translations?.[0]?.title || `COURS ${recommendedCourse.id.slice(0, 8)}`}</p>
            <p className="mt-2 text-sm text-slate-500">{recommendedCourse.description || recommendedCourse.status}</p>
          </Link>
        </section>
      ) : null}

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">
        <h3 className="text-2xl font-black text-[#071d3a]">{t(settings.similarKey)}</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {similar.map((item) => (
            <Link key={item.id} href={`${settings.basePath}/${item.id}`} className="rounded-2xl bg-slate-50 p-4 font-black text-[#071d3a]">
              <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">{item.content_type}</span>
              <p className="mt-2">{item.title || item.id.slice(0, 8)}</p>
            </Link>
          ))}
        </div>
        {!similar.length ? <EmptyState title={t("content.noRelated")} message={t("content.noRelated")} /> : null}
      </section>
    </section>
  );
}

function DownloadButton({
  content,
  label,
  dark = false,
  isPremiumUser,
}: {
  content: Content;
  label: string;
  dark?: boolean;
  isPremiumUser: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function download() {
    // Le téléchargement est réservé aux abonnés Premium.
    // Peu importe que le contenu soit premium ou gratuit.
    if (!isPremiumUser) {
      router.push("/premium");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await platformService.contents.download(content.id);
      await downloadAuthenticatedFile(content);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Download failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <span className="inline-flex flex-col gap-2">
      <button
        type="button"
        onClick={download}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black disabled:opacity-60 ${
          dark
            ? "bg-white/10 text-white"
            : "bg-[#f6c445] text-[#071d3a]"
        }`}
      >
        <Download size={16} />
        {loading ? "..." : label}
      </button>

      {error ? (
        <span className="text-xs font-bold text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}

function Select({ value, onChange, label, options }: { value: string; onChange: (value: string) => void; label: string; options: Array<[string, string]> }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none">
      <option value="">{label}</option>
      {options.map(([id, name]) => <option key={`${label}-${id}`} value={id}>{name}</option>)}
    </select>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><dt>{label}</dt><dd className="text-right text-[#071d3a]">{value}</dd></div>;
}

function Info({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl bg-white p-5 shadow-xl shadow-[#082f1f]/5"><p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{label}</p><p className="mt-3 text-xl font-black text-[#071d3a]">{value}</p></div>;
}

function shortId(value?: string | null) {
  return value ? value.slice(0, 8) : "-";
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function readYear(content: Content) {
  const source = `${content.tags || ""} ${content.title || ""}`;
  return source.match(/\b(20\d{2}|19\d{2})\b/)?.[1] || "";
}

function readExamType(content: Content) {
  const source = content.tags || "";
  const match = source.match(/(?:exam|examen|type)[:=]\s*([^,;]+)/i);
  return match?.[1]?.trim() || "";
}
