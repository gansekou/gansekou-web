"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Crown,
  Download,
  Eye,
  GraduationCap,
  Search,
} from "lucide-react";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/files";
import { ContentEditor } from "@/components/content/ContentEditor";
import { ContentMediaViewer } from "@/components/content/ContentMediaViewer";
import { ContentManager } from "@/components/content/ContentManager";
import { EmptyState } from "@/components/app/StateViews";
import { AuthenticatedPage } from "@/components/pages/shared/AuthenticatedPage";
import { useI18n } from "@/hooks/useI18n";
import { ApiError } from "@/lib/api";
import {
  downloadAuthenticatedFile,
  getContentMainUrl,
} from "@/lib/content-media";
import { isAdminRole, isStudentRole } from "@/lib/permissions";
import { useRouter } from "next/navigation";
import { platformService } from "@/services/platform.service";
import type { Content } from "@/types/content";
import type {
  Level,
  PageData,
  Specialty,
  Subject,
} from "@/types/platform";
import type { User } from "@/types/user";

/* =========================================================
   TYPE
========================================================= */

type LearningKind = "courses" | "exercises" | "subjects";

/* =========================================================
   CONFIGURATION
========================================================= */

const config = {
  courses: {
    type: "COURS",
    listTitleKey: "course.title",
    listHelpKey: "course.help",
    addKey: "course.add",
    detailKey: "course.detail",
    similarKey: "course.similar",
    emptyKey: "course.empty",
    actionKey: "course.view",
    basePath: "/courses",
    adminPath: "/admin/courses",
  },

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

/* =========================================================
   LABELS
========================================================= */

function getLearningListLabel(
  kind: LearningKind
): string {
  if (kind === "courses") {
    return "Cours";
  }

  if (kind === "exercises") {
    return "Exercices";
  }

  return "Sujets";
}

function getLearningDetailLabel(
  kind: LearningKind
): string {
  if (kind === "courses") {
    return "Détail du cours";
  }

  if (kind === "exercises") {
    return "Détail de l'exercice";
  }

  return "Détail du sujet";
}

function getLearningActionLabel(
  kind: LearningKind,
  action: "add" | "view"
): string {
  if (kind === "courses") {
    return action === "add"
      ? "Ajouter un cours"
      : "Voir le cours";
  }

  if (kind === "exercises") {
    return action === "add"
      ? "Ajouter un exercice"
      : "Voir l'exercice";
  }

  return action === "add"
    ? "Ajouter un sujet"
    : "Voir le sujet";
}

/* =========================================================
   LIST PAGE
========================================================= */

export function LearningContentListPage({
  kind,
}: {
  kind: LearningKind;
}) {
  const settings = config[kind];

  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects, specialties] =
      await Promise.all([
        platformService.contents
          .byTypeAll(settings.type)
          .catch(() => [] as Content[]),

        platformService.education
          .levels()
          .catch(() => [] as Level[]),

        platformService.education
          .subjects()
          .catch(() => [] as Subject[]),

        platformService.education
          .specialties()
          .catch(() => [] as Specialty[]),
      ]);

    return {
      contents,
      levels,
      subjects,
      specialties,
    };
  }, [settings.type]);

  return (
    <AuthenticatedPage
      loadingLabel="Chargement..."
      load={load}
    >
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

/* =========================================================
   DETAIL PAGE
========================================================= */

export function LearningContentDetailPage({
  kind,
  id,
}: {
  kind: LearningKind;
  id?: string;
}) {
  const load = useCallback(async (): Promise<PageData> => {
    if (!id) {
      return {};
    }

    const content = await platformService.contents
      .byId(id)
      .catch(() => undefined);

    return {
      content,
    };
  }, [id]);

  return (
    <AuthenticatedPage
      loadingLabel="Chargement..."
      load={load}
    >
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

/* =========================================================
   ADMIN LIST PAGE
========================================================= */

export function AdminLearningContentListPage({
  kind,
}: {
  kind: LearningKind;
}) {
  const settings = config[kind];

  const load = useCallback(async (): Promise<PageData> => {
    const [contents, levels, subjects, specialties] =
      await Promise.all([
        platformService.contents
          .allPages()
          .catch(() => [] as Content[]),

        platformService.education
          .levels()
          .catch(() => [] as Level[]),

        platformService.education
          .subjects()
          .catch(() => [] as Subject[]),

        platformService.education
          .specialties()
          .catch(() => [] as Specialty[]),
      ]);

    return {
      contents: contents.filter(
        (item) => item.content_type === settings.type
      ),
      levels,
      subjects,
      specialties,
    };
  }, [settings.type]);

  return (
    <AuthenticatedPage
      loadingLabel="Chargement..."
      load={load}
    >
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

/* =========================================================
   ADMIN MANAGER
========================================================= */

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

  const title =
    kind === "courses"
      ? "Cours"
      : t(settings.listTitleKey);

  const createLabel =
    getLearningActionLabel(kind, "add");

  return (
    <ContentManager
      user={user}
      contents={contents}
      subjects={subjects}
      levels={levels}
      scope={kind}
      basePathOverride={settings.adminPath}
      title={title}
      createLabel={createLabel}
      createAllowed={isAdminRole(user)}
      reload={reload}
    />
  );
}

/* =========================================================
   ADMIN EDITOR
========================================================= */

export function AdminLearningContentEditorPage({
  kind,
  id,
}: {
  kind: LearningKind;
  id?: string;
}) {
  const settings = config[kind];

  const load = useCallback(async (): Promise<PageData> => {
    const [content, levels, subjects, specialties] =
      await Promise.all([
        id
          ? platformService.contents
              .byId(id)
              .catch(() => undefined)
          : Promise.resolve(undefined),

        platformService.education
          .levels()
          .catch(() => [] as Level[]),

        platformService.education
          .subjects()
          .catch(() => [] as Subject[]),

        platformService.education
          .specialties()
          .catch(() => [] as Specialty[]),
      ]);

    return {
      content,
      levels,
      subjects,
      specialties,
    };
  }, [id]);

  return (
    <AuthenticatedPage
      loadingLabel="Chargement..."
      load={load}
    >
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

/* =========================================================
   CATALOG
========================================================= */

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

  const subjectById = useMemo(() => {
    return new Map(
      subjects.map((item) => [
        item.id,
        item,
      ])
    );
  }, [subjects]);

  const levelById = useMemo(() => {
    return new Map(
      levels.map((item) => [
        item.id,
        item,
      ])
    );
  }, [levels]);

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    return contents.filter((item) => {
      const translationsText =
        item.translations
          ?.map((translation) =>
            [
              translation.title || "",
              translation.description || "",
            ].join(" ")
          )
          .join(" ") || "";

      const subjectName =
        subjectById.get(
          item.subject_id
        )?.name_fr || "";

      const searchText = [
        item.title || "",
        item.description || "",
        item.tags || "",
        translationsText,
        subjectName,
        item.content_type || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        !normalizedQuery ||
        searchText.includes(
          normalizedQuery
        );

      const matchesSubject =
        !subjectId ||
        item.subject_id === subjectId;

      const matchesLevel =
        !levelId ||
        Boolean(
          item.level_ids?.includes(
            levelId
          )
        );

      const matchesSpecialty =
        !specialtyId ||
        Boolean(
          item.specialty_ids?.includes(
            specialtyId
          )
        );

      return (
        matchesQuery &&
        matchesSubject &&
        matchesLevel &&
        matchesSpecialty
      );
    });
  }, [
    contents,
    query,
    subjectId,
    levelId,
    specialtyId,
    subjectById,
  ]);

  return (
    <section className="grid gap-4">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="rounded-[1.5rem] bg-[#071d3a] p-5 text-white shadow-xl shadow-[#071d3a]/15 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f6c445] sm:text-xs">
              {kind === "courses"
                ? "Cours"
                : t(settings.listTitleKey)}
            </p>

            <h2 className="mt-1.5 text-2xl font-black tracking-tight sm:text-3xl">
              {kind === "courses"
                ? "Cours"
                : t(settings.listTitleKey)}
            </h2>

            <p className="mt-2 max-w-2xl text-xs font-bold leading-5 text-white/65 sm:text-sm">
              {t(settings.listHelpKey)}
            </p>
          </div>

          {isAdminRole(user) ? (
            <Link
              href={settings.adminPath + "/new"}
              className="ds-button-premium !rounded-xl !px-4 !py-2 !text-xs"
            >
              {getLearningActionLabel(
                kind,
                "add"
              )}
            </Link>
          ) : null}

        </div>
      </section>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <section className="rounded-[1.5rem] bg-white p-3 shadow-lg shadow-[#082f1f]/5 sm:p-4">

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">

          {/* SEARCH */}

          <label
            className={
              "relative " +
              (user?.role === "ELEVE"
                ? "sm:col-span-2 lg:col-span-2"
                : "sm:col-span-2 lg:col-span-1")
            }
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />

            <input
              value={query}
              onChange={(event) => {
                setQuery(
                  event.target.value
                );
              }}
              placeholder={t("common.search")}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-bold text-[#071d3a] outline-none transition placeholder:text-slate-400 focus:border-[#0f5132] focus:bg-white focus:ring-2 focus:ring-[#0f5132]/10"
            />
          </label>

          {/* SUBJECT */}

          <Select
            value={subjectId}
            onChange={setSubjectId}
            label={t("common.subject")}
            options={subjects.map(
              (item) => [
                item.id,
                item.name_fr,
              ]
            )}
          />

          {/* LEVEL + SPECIALTY */}

          {user?.role !== "ELEVE" ? (
            <>
              <Select
                value={levelId}
                onChange={setLevelId}
                label={t("common.level")}
                options={levels.map(
                  (item) => [
                    item.id,
                    item.name_fr,
                  ]
                )}
              />

              <Select
                value={specialtyId}
                onChange={setSpecialtyId}
                label={t("subject.specialty")}
                options={specialties.map(
                  (item) => [
                    item.id,
                    item.name_fr,
                  ]
                )}
              />
            </>
          ) : null}

        </div>
      </section>

      {/* ===================================================
          EMPTY
      =================================================== */}

      {!filtered.length ? (
        <EmptyState
          title={
            kind === "courses"
              ? "Aucun cours disponible"
              : t(settings.emptyKey)
          }
          message={t(
            "state.emptyContent"
          )}
        />
      ) : (
        <div
          className="
            grid
            grid-cols-3
            gap-2
            sm:gap-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
          "
        >

          {/* =================================================
              CONTENT CARDS
          ================================================= */}

          {filtered.map((item) => {
            const title =
              item.translations?.[0]
                ?.title ||
              item.title ||
              item.content_type +
                " " +
                shortId(item.id);

            const subjectName =
              subjectById.get(
                item.subject_id
              )?.name_fr || "-";

            const levelName =
              item.level_ids
                ?.map((levelId) => {
                  return levelById.get(
                    levelId
                  )?.name_fr;
                })
                .filter(Boolean)
                .join(", ") || "-";

            const viewLabel =
              getLearningActionLabel(
                kind,
                "view"
              );

            return (
              <article
                key={item.id}
                className="
                  group
                  min-w-0
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-100
                  bg-white
                  p-2
                  transition
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-slate-200
                  hover:shadow-md
                  sm:rounded-2xl
                  sm:p-2.5
                  lg:p-3
                "
              >

                {/* IMAGE */}

                {item.thumbnail_url ? (
                  <div className="relative mb-2 h-20 w-full overflow-hidden rounded-lg bg-slate-100 sm:h-24 lg:h-28">

                    <Image
                      src={getThumbnailUrl(
                        item.thumbnail_url
                      )}
                      alt={title}
                      fill
                      sizes="(max-width: 639px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 20vw, 16vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />

                    {item.is_premium ? (
                      <span
                        title="Premium"
                        aria-label="Premium"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#f6c445] text-[#071d3a] shadow-sm"
                      >
                        <Crown
                          size={12}
                          strokeWidth={2.5}
                        />
                      </span>
                    ) : null}

                  </div>
                ) : (
                  <div className="relative mb-2 flex h-20 items-center justify-center rounded-lg bg-slate-100 sm:h-24 lg:h-28">

                    <BookOpen
                      size={22}
                      className="text-slate-300"
                    />

                    {item.is_premium ? (
                      <span
                        title="Premium"
                        aria-label="Premium"
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#f6c445] text-[#071d3a]"
                      >
                        <Crown
                          size={12}
                          strokeWidth={2.5}
                        />
                      </span>
                    ) : null}

                  </div>
                )}

                {/* TYPE + DOWNLOAD */}

                <div className="mb-1.5 flex items-center justify-between gap-1">

                  <span className="truncate rounded-md bg-[#0f5f3a]/10 px-1.5 py-0.5 text-[8px] font-black text-[#0f5f3a] sm:text-[9px]">
                    {item.content_type}
                  </span>

                  {item.is_available_offline ? (
                    <span
                      title={t(
                        "content.offline"
                      )}
                      aria-label={t(
                        "content.offline"
                      )}
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                    >
                      <Download size={10} />
                    </span>
                  ) : null}

                </div>

                {/* TITLE */}

                <h3 className="line-clamp-2 min-h-[2rem] text-[10px] font-black leading-4 text-[#082f1f] sm:text-[11px] sm:leading-4">
                  {title}
                </h3>

                {/* DESCRIPTION */}

                <p className="mt-1 line-clamp-1 text-[8px] font-semibold leading-3.5 text-slate-400 sm:text-[9px]">
                  {item.translations?.[0]
                    ?.description ||
                    item.description ||
                    ""}
                </p>

                {/* METADATA */}

                <div className="mt-2 space-y-1">

                  <div
                    className="flex min-w-0 items-center gap-1 text-[8px] font-bold text-slate-500 sm:text-[9px]"
                    title={subjectName}
                  >
                    <BookOpen
                      size={11}
                      className="shrink-0 text-[#0f5f3a]"
                    />

                    <span className="truncate">
                      {subjectName}
                    </span>
                  </div>

                  <div
                    className="flex min-w-0 items-center gap-1 text-[8px] font-bold text-slate-500 sm:text-[9px]"
                    title={levelName}
                  >
                    <GraduationCap
                      size={12}
                      className="shrink-0 text-[#0f5f3a]"
                    />

                    <span className="truncate">
                      {levelName}
                    </span>
                  </div>

                </div>

                {/* ACTIONS */}

                <div className="mt-2 flex items-center gap-1">

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        item.is_premium &&
                        isStudentRole(user) &&
                        !user.is_premium
                      ) {
                        router.push(
                          "/premium"
                        );
                        return;
                      }

                      router.push(
                        settings.basePath +
                          "/" +
                          item.id
                      );
                    }}
                    title={viewLabel}
                    aria-label={viewLabel}
                    className="
                      flex
                      h-7
                      min-w-0
                      flex-1
                      items-center
                      justify-center
                      gap-1
                      rounded-lg
                      bg-[#0f5f3a]
                      px-1.5
                      text-[9px]
                      font-black
                      text-white
                      transition
                      hover:bg-[#0b492c]
                      sm:h-8
                      sm:text-[10px]
                    "
                  >
                    <Eye size={12} />

                    <span className="truncate">
                      {viewLabel}
                    </span>
                  </button>

                  {item.is_available_offline &&
                  getContentMainUrl(item) ? (
                    <DownloadButton
                      content={item}
                      label=""
                      isPremiumUser={Boolean(
                        user.is_premium
                      )}
                      compact
                    />
                  ) : null}

                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   DETAIL COMPONENT
========================================================= */

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
  reload,
}: {
  kind: LearningKind;
  user: User;
  content?: Content | null;
  related: Content[];
  translations: {
    title?: string;
    description?: string;
  }[];
  levels: Level[];
  subjects: Subject[];
  specialties: Specialty[];
  courses: Content[];
  reload: () => Promise<void>;
}) {
  const settings = config[kind];
  const { t } = useI18n(user);
  const router = useRouter();

  const [detailData, setDetailData] =
    useState({
      related: [] as Content[],

      translations: [] as {
        title?: string;
        description?: string;
      }[],

      levels: [] as Level[],

      subjects: [] as Subject[],

      specialties: [] as Specialty[],

      courses: [] as Content[],

      loading: true,
    });

  const subjectById = useMemo(() => {
    return new Map(
      detailData.subjects.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );
  }, [detailData.subjects]);

  const levelById = useMemo(() => {
    return new Map(
      detailData.levels.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );
  }, [detailData.levels]);

  const specialtyById = useMemo(() => {
    return new Map(
      detailData.specialties.map(
        (item) => [
          item.id,
          item,
        ]
      )
    );
  }, [detailData.specialties]);

  useEffect(() => {
    if (!content) {
      return;
    }

    if (
      content.is_premium &&
      isStudentRole(user) &&
      !user.is_premium
    ) {
      return;
    }

    let cancelled = false;

    async function loadDetails() {
      if (!content) {
        return;
      }

      const contentId = content.id;

      const [
        relatedContent,
        contentTranslations,
        allLevels,
        allSubjects,
        allSpecialties,
        allCourses,
      ] = await Promise.all([
        platformService.contents
          .related(contentId)
          .catch(() => [] as Content[]),

        platformService.contents
          .translations(content.id)
          .then((value) => {
            return value as {
              title?: string;
              description?: string;
            }[];
          })
          .catch(() => {
            return [] as {
              title?: string;
              description?: string;
            }[];
          }),

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
          related: relatedContent,
          translations: contentTranslations,
          levels: allLevels,
          subjects: allSubjects,
          specialties: allSpecialties,
          courses: allCourses,
          loading: false,
        });
      }
    }

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [
    content,
    user.is_premium,
    user.role,
  ]);

  if (
    !content ||
    content.content_type !== settings.type
  ) {
    return (
      <EmptyState
        title={t("content.notFound")}
        message={t("content.notFound")}
      />
    );
  }

  if (
    content.is_premium &&
    isStudentRole(user) &&
    !user.is_premium
  ) {
    router.replace("/premium");

    return null;
  }

  const translation =
    detailData.translations[0];

  const title =
    translation?.title ||
    content.title ||
    content.content_type +
      " " +
      shortId(content.id);

  const description =
    translation?.description ||
    content.description ||
    "";

  const similar =
    detailData.related.filter((item) => {
      const sameType =
        item.content_type === settings.type;

      const sameSubject =
        item.subject_id ===
        content.subject_id;

      const sameLevel =
        Boolean(
          item.level_ids?.some(
            (levelId) =>
              content.level_ids?.includes(
                levelId
              )
          )
        );

      return (
        sameType &&
        sameSubject &&
        sameLevel
      );
    });

  const recommendedCourse =
    kind !== "courses"
      ? detailData.courses.find((item) => {
          const sameSubject =
            item.subject_id ===
            content.subject_id;

          const sameLevel =
            Boolean(
              item.level_ids?.some(
                (levelId) =>
                  content.level_ids?.includes(
                    levelId
                  )
              )
            );

          return (
            sameSubject &&
            sameLevel
          );
        })
      : undefined;

  return (
    <section className="grid gap-5">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="rounded-[2rem] bg-[#071d3a] p-7 text-white shadow-2xl shadow-[#071d3a]/20">

        <p className="text-sm font-black uppercase tracking-[0.25em] text-[#f6c445]">
          {getLearningDetailLabel(kind)}
        </p>

        <h2 className="mt-3 text-4xl font-black tracking-tight">
          {title}
        </h2>

        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          {description ||
            content.content_type}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">

          {/* DOWNLOAD */}

          {content.is_available_offline &&
          getContentMainUrl(content) ? (
            <DownloadButton
              content={content}
              label={t(
                "content.download"
              )}
              dark
              isPremiumUser={
                user.is_premium === true
              }
            />
          ) : null}

          {/* BACK */}

          <Link
            href={settings.basePath}
            className="rounded-full bg-white/10 px-5 py-3 font-black text-white"
          >
            {t("content.all")}
          </Link>

        </div>
      </section>

      {/* =================================================
          INFORMATION
      ================================================= */}

      <section className="grid gap-4 md:grid-cols-4">

        <Info
          label={t("common.subject")}
          value={
            subjectById.get(
              content.subject_id
            )?.name_fr || "-"
          }
        />

        <Info
          label={t("common.level")}
          value={
            content.level_ids
              ?.map((levelId) => {
                return levelById.get(
                  levelId
                )?.name_fr;
              })
              .filter(Boolean)
              .join(", ") || "-"
          }
        />

        <Info
          label={t("subject.specialty")}
          value={
            content.specialty_ids
              ?.map((specialtyId) => {
                return specialtyById.get(
                  specialtyId
                )?.name_fr;
              })
              .filter(Boolean)
              .join(", ") || "-"
          }
        />

        {kind === "subjects" ? (
          <Info
            label={t("content.year")}
            value={
              readYear(content) || "-"
            }
          />
        ) : null}

        {kind === "subjects" ? (
          <Info
            label={t("content.examType")}
            value={
              readExamType(content) || "-"
            }
          />
        ) : null}

        <Info
          label={t("content.offline")}
          value={
            content.is_available_offline
              ? t("common.yes")
              : t("common.no")
          }
        />

      </section>

      {/* =================================================
          MEDIA
      ================================================= */}

      <ContentMediaViewer
        content={content}
        t={t}
      />

      {/* =================================================
          RECOMMENDED COURSE
      ================================================= */}

      {kind !== "courses" &&
      recommendedCourse ? (
        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">

          <h3 className="text-2xl font-black text-[#071d3a]">
            {t(
              "content.recommendedCourse"
            )}
          </h3>

          <Link
            href={
              "/courses/" +
              recommendedCourse.id
            }
            className="mt-5 block rounded-2xl bg-slate-50 p-5 font-black text-[#071d3a] transition hover:bg-white hover:shadow-lg"
          >

            <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">
              COURS
            </span>

            <p className="mt-3">
              {recommendedCourse
                .translations?.[0]
                ?.title ||
                recommendedCourse.title ||
                "COURS " +
                  shortId(
                    recommendedCourse.id
                  )}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {recommendedCourse
                .translations?.[0]
                ?.description ||
                recommendedCourse.description ||
                recommendedCourse.status}
            </p>

          </Link>
        </section>
      ) : null}

      {/* =================================================
          SIMILAR CONTENT
      ================================================= */}

      <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-[#082f1f]/5">

        <h3 className="text-2xl font-black text-[#071d3a]">
          {t(settings.similarKey)}
        </h3>

        <div className="mt-5 grid gap-4 md:grid-cols-3">

          {similar.map((item) => (
            <Link
              key={item.id}
              href={
                settings.basePath +
                "/" +
                item.id
              }
              className="rounded-2xl bg-slate-50 p-4 font-black text-[#071d3a]"
            >

              <span className="text-xs uppercase tracking-[0.14em] text-[#0f5f3a]">
                {item.content_type}
              </span>

              <p className="mt-2">
                {item.translations?.[0]
                  ?.title ||
                  item.title ||
                  shortId(item.id)}
              </p>

            </Link>
          ))}

        </div>

        {!similar.length ? (
          <EmptyState
            title={t(
              "content.noRelated"
            )}
            message={t(
              "content.noRelated"
            )}
          />
        ) : null}

      </section>
    </section>
  );
}

/* =========================================================
   DOWNLOAD BUTTON
========================================================= */

function DownloadButton({
  content,
  label,
  dark = false,
  isPremiumUser,
  compact = false,
}: {
  content: Content;
  label: string;
  dark?: boolean;
  isPremiumUser: boolean;
  compact?: boolean;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function download() {
    if (!isPremiumUser) {
      router.push("/premium");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await platformService.contents.download(
        content.id
      );

      await downloadAuthenticatedFile(
        content
      );
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

  void compact;

  return (
    <span className="inline-flex flex-col gap-1">

      <button
        type="button"
        onClick={download}
        disabled={loading}
        title={
          label ||
          "Télécharger"
        }
        aria-label={
          label ||
          "Télécharger"
        }
        className={
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg disabled:opacity-60 sm:h-8 sm:w-8 " +
          (dark
            ? "bg-white/10 text-white"
            : "bg-[#f6c445] text-[#071d3a]")
        }
      >
        <Download
          size={13}
          className={
            loading
              ? "animate-pulse"
              : ""
          }
        />
      </button>

      {error ? (
        <span className="max-w-[120px] text-[8px] font-bold text-red-600">
          {error}
        </span>
      ) : null}

    </span>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  options: Array<[string, string]>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => {
        onChange(
          event.target.value
        );
      }}
      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none"
    >
      <option value="">
        {label}
      </option>

      {options.map(
        ([id, name]) => (
          <option
            key={label + "-" + id}
            value={id}
          >
            {name}
          </option>
        )
      )}

    </select>
  );
}

/* =========================================================
   META
========================================================= */

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">

      <dt>
        {label}
      </dt>

      <dd className="text-right text-[#071d3a]">
        {value}
      </dd>

    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-xl shadow-[#082f1f]/5">

      <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>

      <p className="mt-3 text-xl font-black text-[#071d3a]">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function shortId(
  value?: string | null
) {
  return value
    ? value.slice(0, 8)
    : "-";
}

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

function readYear(
  content: Content
) {
  const source = [
    content.tags || "",
    content.title || "",
  ].join(" ");

  return (
    source.match(
      /\b(20\d{2}|19\d{2})\b/
    )?.[1] || ""
  );
}

function readExamType(
  content: Content
) {
  const source =
    content.tags || "";

  const match =
    source.match(
      /(?:exam|examen|type)[:=]\s*([^,;]+)/i
    );

  return (
    match?.[1]?.trim() || ""
  );
}
