import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { safeNextPath } from "@/lib/safeNext";

export const metadata = { title: "Log in — Octo" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[]; reason?: string | string[] }>;
}) {
  const { next, reason } = await searchParams;

  // Guard: only allow same-origin paths so ?next= cannot become an open redirect.
  const safeNext = safeNextPath(next);

  return (
    <AuthShell>
      <AuthForm mode="login" next={safeNext} reason={reason === "expired" ? reason : undefined} />
    </AuthShell>
  );
}
