import Link from "next/link";

export const metadata = { title: "Terms of Service — Octo" };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-foreground">
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ‹ Home
      </Link>
      <h1 className="mt-6 text-3xl font-semibold">Terms of Service</h1>
      <p className="mt-4 rounded-lg border border-border bg-burgundy-soft/30 px-4 py-3 text-sm text-muted">
        Placeholder: the final text is pending review by the Octo team and is not yet legally binding.
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted">
        These terms will describe the acceptable use of Octo, the non-custodial nature of the service, and your responsibilities for keeping your keys and wallet encryption password safe.
      </p>
    </main>
  );
}
