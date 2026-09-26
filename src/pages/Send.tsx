import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { Button, Field, Logo, Panel, TextArea } from "../components/ui";

const MAX_CHARS = 1000;

type Nav = { go: (route: string) => void };

export default function Send({ slug, nav }: { slug: string; nav: Nav }) {
  const [status, setStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    api
      .lookup(slug)
      .then((u) => {
        if (!alive) return;
        setDisplayName(u.displayName);
        setStatus("ready");
        setTimeout(() => areaRef.current?.focus(), 300);
      })
      .catch(() => alive && setStatus("missing"));
    return () => {
      alive = false;
    };
  }, [slug]);

  async function send() {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      await api.send(slug, message.trim(), senderName.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send.");
    } finally {
      setSending(false);
    }
  }

  const nearLimit = message.length >= MAX_CHARS * 0.9;

  return (
    <div className="aurora min-h-full">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6">
        <Logo onClick={() => nav.go("landing")} />
        <button
          onClick={() => nav.go("signup")}
          className="text-sm font-medium text-subtle transition-colors hover:text-ink"
        >
          Get your own link →
        </button>
      </header>

      <main className="mx-auto flex max-w-[520px] flex-col px-5 py-8 sm:py-14">
        {status === "loading" && (
          <div className="flex justify-center py-24">
            <span className="h-7 w-7 animate-spin-fast rounded-full border-2 border-line-2 border-t-violet" />
          </div>
        )}

        {status === "missing" && (
          <Panel className="p-8 text-center animate-step-in">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2 text-2xl">
              🕳️
            </div>
            <h1 className="font-display text-3xl uppercase tracking-wide text-ink">Link not found</h1>
            <p className="mt-2 text-[15px] text-subtle">
              The link <span className="text-ink">/{slug}</span> doesn&apos;t exist. Want to create your own?
            </p>
            <Button className="mt-6" full onClick={() => nav.go("signup")}>
              Create your free link
            </Button>
          </Panel>
        )}

        {status === "ready" && !sent && (
          <div className="animate-step-in">
            <p className="mb-2 text-center text-sm font-medium uppercase tracking-[0.2em] text-faint">
              Send an anonymous message to
            </p>
            <h1 className="mb-7 text-center font-display text-4xl uppercase tracking-wide text-gradient sm:text-5xl">
              {displayName}
            </h1>

            <Panel className="p-6 sm:p-7">
              <div className="mb-4">
                <Field
                  id="sender"
                  label="Your name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="off"
                  maxLength={40}
                />
              </div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="msg" className="text-sm font-medium text-ink">
                  Your message
                </label>
                <span
                  className={[
                    "text-xs tabular-nums",
                    nearLimit ? "font-medium text-fuchsia" : "text-faint",
                  ].join(" ")}
                >
                  {message.length} / {MAX_CHARS}
                </span>
              </div>
              <TextArea
                id="msg"
                ref={areaRef}
                rows={6}
                value={message}
                maxLength={MAX_CHARS}
                placeholder="Say what you really think… they'll never know it was you."
                onChange={(e) => setMessage(e.target.value.slice(0, MAX_CHARS))}
              />
              <p className="mt-3 flex items-center gap-2 text-xs text-subtle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
                100% anonymous — no account, no IP, no trace.
              </p>

              {error && (
                <p className="mt-4 rounded-xl bg-fuchsia/10 px-3 py-2 text-xs font-medium text-fuchsia">
                  {error}
                </p>
              )}

              <Button className="mt-5" full loading={sending} onClick={send} disabled={!message.trim()}>
                {sending ? "Sending…" : "Send anonymously"} {!sending && <span aria-hidden>→</span>}
              </Button>
            </Panel>
          </div>
        )}

        {status === "ready" && sent && (
          <Panel className="flex flex-col items-center p-8 text-center animate-step-in">
            <div className="animate-ring-pop flex h-16 w-16 items-center justify-center rounded-full bg-success/15">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    className="animate-check"
                    d="M5 13l4 4L19 7"
                    stroke="#062a1c"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <h1 className="mt-5 font-display text-3xl uppercase tracking-wide text-ink">Sent!</h1>
            <p className="mt-2 text-[15px] text-subtle">
              Your anonymous message is on its way to {displayName}.
            </p>
            <Button
              className="mt-7"
              full
              variant="outline"
              onClick={() => {
                setMessage("");
                setSenderName("");
                setSent(false);
                setTimeout(() => areaRef.current?.focus(), 200);
              }}
            >
              Send another
            </Button>
            <button
              onClick={() => nav.go("signup")}
              className="mt-4 text-sm font-medium text-gradient"
            >
              Get your own anonymous link →
            </button>
          </Panel>
        )}
      </main>
    </div>
  );
}
