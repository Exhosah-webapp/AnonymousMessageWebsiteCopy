import { useState } from "react";
import { api, type Profile } from "../lib/api";
import { Button, Field, Logo, Panel } from "../components/ui";

type Nav = { go: (route: string) => void };

export default function Auth({
  mode,
  nav,
  onAuthed,
}: {
  mode: "login" | "signup";
  nav: Nav;
  onAuthed: (p: Profile) => void;
}) {
  const isSignup = mode === "signup";
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = isSignup
        ? await api.signup({ slug: cleanSlug, displayName: displayName.trim() || cleanSlug, password })
        : await api.login({ slug: cleanSlug, password });
      onAuthed(profile);
      nav.go("dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="aurora flex min-h-full flex-col">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-6">
        <Logo onClick={() => nav.go("landing")} />
        <button
          onClick={() => nav.go(isSignup ? "login" : "signup")}
          className="text-sm font-medium text-subtle transition-colors hover:text-ink"
        >
          {isSignup ? "Have a link? Log in" : "Need a link? Sign up"}
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px]">
          <div className="mb-6 text-center">
            <h1 className="font-display text-4xl uppercase tracking-wide text-ink sm:text-5xl">
              {isSignup ? (
                <>
                  Create an <span className="text-gradient">account</span>
                </>
              ) : (
                <>
                  Welcome <span className="text-gradient">BACK</span>
                </>
              )}
            </h1>
            <p className="mt-2 text-[15px] text-subtle">
              {isSignup
                ? "Pick a name, set a password, start receiving anonymous messages."
                : "Log in with your link name and password."}
            </p>
          </div>

          <Panel className="p-6 sm:p-7">
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field
                id="slug"
                label="Enter your name"
                prefix="secretmessage.link/"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="yourname"
                autoCapitalize="none"
                autoComplete="username"
                spellCheck={false}
                hint={isSignup ? "Letters, numbers and dashes. This is your shareable link." : undefined}
              />

              {isSignup && (
                <Field
                  id="display"
                  label="Username"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="nickname"
                />
              )}

              <Field
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? "At least 6 characters" : "Your password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />

              {error && (
                <p className="rounded-xl bg-fuchsia/10 px-3 py-2 text-xs font-medium text-fuchsia">{error}</p>
              )}

              <Button type="submit" full loading={busy}>
                {isSignup ? "Create my link" : "Log in"} {!busy && <span aria-hidden>→</span>}
              </Button>
            </form>
          </Panel>

          <p className="mt-5 text-center text-xs text-faint">
            Not for collecting sensitive or personal data — keep it fun.
          </p>
        </div>
      </main>
    </div>
  );
}
