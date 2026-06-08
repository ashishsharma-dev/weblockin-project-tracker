import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./view";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl gap-8 rounded-[2rem] border bg-card/90 p-6 shadow-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
        <section className="rounded-[1.5rem] bg-[linear-gradient(140deg,#0060d1,#369fff)] p-8 text-white">
          <p className="text-xs uppercase tracking-[0.4em] text-white/70">Weblockin Internal ERP</p>
          <h1 className="mt-4 max-w-md text-4xl font-bold leading-tight">Track partner profits, project health, and payouts in one place.</h1>
          <p className="mt-4 max-w-lg text-sm text-white/80">
            Built for small agencies where lead generation and delivery both matter. Profit shares, ledgers, expenses, and collections stay aligned automatically.
          </p>
        </section>
        <section className="flex items-center">
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
