import { AlertCircle } from "lucide-react";
import { EmptyState as UiEmptyState } from "@/components/ui/EmptyState";
import { LoadingState as UiLoadingState } from "@/components/ui/LoadingState";

export function LoadingState({ label = "Chargement..." }: { label?: string }) {
  return <UiLoadingState label={label} />;
}

export function ErrorState({
  title = "Chargement impossible",
  message,
}: {
  title?: string;
  message?: string | null;
}) {
  return (
    <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700">
      <div className="flex items-center gap-3">
        <AlertCircle size={22} />
        <p className="font-black">{title}</p>
      </div>
      <p className="mt-2 text-sm font-bold">
        {message || "Une erreur est survenue pendant le chargement."}
      </p>
    </div>
  );
}

export function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return <UiEmptyState title={title} message={message} />;
}
