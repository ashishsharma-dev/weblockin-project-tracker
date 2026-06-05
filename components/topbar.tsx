import { auth, signOut } from "@/auth";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";

export async function Topbar() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-card/90 p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">Welcome back</p>
        <h2 className="text-xl font-semibold">{session?.user.name}</h2>
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <Button variant="outline">Logout</Button>
        </form>
      </div>
    </div>
  );
}
