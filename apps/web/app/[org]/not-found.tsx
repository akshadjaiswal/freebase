import Link from "next/link";

export default function OrgNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0e0e10] p-8 text-center">
      <p className="mb-2 text-xs font-medium uppercase tracking-widest text-[#10b981]">
        404
      </p>
      <h1 className="mb-3 text-2xl font-semibold text-[#e2e2e5]">
        Organization not found
      </h1>
      <p className="mb-8 text-sm text-[#a1a1aa]">
        This org doesn't exist or may have been deleted.
      </p>
      <Link
        href="/"
        className="rounded px-4 py-2 text-sm font-medium bg-[#10b981] text-white hover:opacity-90 transition-opacity"
      >
        Go home
      </Link>
    </div>
  );
}
