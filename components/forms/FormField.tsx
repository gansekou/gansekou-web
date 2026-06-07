export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-black text-[#082f1f]">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}
