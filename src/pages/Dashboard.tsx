import { useEffect, useState } from "react";
import { api, linkFor, type Message, type Profile } from "../lib/api";
import { Button, Field, Logo, Panel } from "../components/ui";

type Nav = { go: (route: string) => void };

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default function Dashboard({
  profile,
  nav,
  onProfile,
  onLogout,
}: {
  profile: Profile;
  nav: Nav;
  onProfile: (p: Profile) => void;
  onLogout: () => void;
}) {
  const [tab, setTab] = useState<"inbox" | "settings">("inbox");
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [copied, setCopied] = useState(false);
  const link = linkFor(profile.slug);

  async function load() {
    try {
      const { messages } = await api.messages();
      setMessages(messages);
    } catch {
      setMessages([]);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function copy() {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  async function remove(id: string) {
    setMessages((m) => (m ? m.filter((x) => x.id !== id) : m));
    try {
      await api.deleteMessage(id);
    } catch {
      load();
    }
  }

  return (
    <div className="aurora min-h-full">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6">
        <Logo onClick={() => nav.go("landing")} />
        <div className="flex items-center gap-2">
          <span className="hidden text-sm text-subtle sm:inline">@{profile.slug}</span>
          <Button
            variant="ghost"
            className="px-3 py-2 text-sm"
            onClick={async () => {
              await api.logout();
              onLogout();
              nav.go("landing");
            }}
          >
            Log out
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-16">
        {/* Share card */}
        <Panel className="overflow-hidden">
          <div className="grad-btn p-6 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/80">Your link</p>
            <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-white sm:text-4xl">
              {profile.displayName}
            </h1>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 truncate rounded-2xl bg-black/25 px-4 py-3 font-medium text-white">
                {link.replace(/^https?:\/\//, "")}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={copy}
                  className="rounded-2xl bg-white px-5 py-3 text-[15px] font-semibold text-[#1a0f2b] transition-transform active:scale-95"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Send me an anonymous message 👀 ${link}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center rounded-2xl bg-black/25 px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-black/40"
                >
                  WhatsApp Share
                </a>
              </div>
            </div>
            <button
              onClick={() => nav.go(`send:${profile.slug}`)}
              className="mt-4 text-sm font-medium text-white/85 underline decoration-white/40 underline-offset-4 hover:text-white"
            >
              View my page →
            </button>
          </div>
        </Panel>

        {/* Tabs */}
        <div className="mt-8 flex items-center gap-1 rounded-2xl border border-line bg-panel p-1">
          {(["inbox", "settings"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold capitalize transition-colors",
                tab === t ? "bg-panel-2 text-ink" : "text-subtle hover:text-ink",
              ].join(" ")}
            >
              {t}
              {t === "inbox" && messages && messages.length > 0 && (
                <span className="ml-2 rounded-full bg-fuchsia/20 px-2 py-0.5 text-xs text-fuchsia">
                  {messages.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "inbox" ? (
          <div className="mt-6">
            {messages === null ? (
              <div className="flex justify-center py-16">
                <span className="h-7 w-7 animate-spin-fast rounded-full border-2 border-line-2 border-t-violet" />
              </div>
            ) : messages.length === 0 ? (
              <Panel className="p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-panel-2 text-2xl">
                  📭
                </div>
                <h2 className="font-display text-2xl uppercase tracking-wide text-ink">No messages yet</h2>
                <p className="mt-2 text-[15px] text-subtle">
                  Share your link and the anonymous messages will land right here.
                </p>
                <Button className="mt-6" variant="outline" onClick={copy}>
                  {copied ? "Copied!" : "Copy my link"}
                </Button>
              </Panel>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {messages.map((m) => (
                  <Panel key={m.id} className="group flex flex-col p-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink">
                        <span className="text-fuchsia">◆</span> {m.senderName}
                      </span>
                      <span className="text-xs text-faint">{timeAgo(m.createdAt)}</span>
                    </div>
                    <p className="flex-1 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                      {m.message}
                    </p>
                    <button
                      onClick={() => remove(m.id)}
                      className="mt-4 self-start text-xs font-medium text-faint opacity-0 transition-opacity hover:text-fuchsia group-hover:opacity-100"
                    >
                      Delete
                    </button>
                  </Panel>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Settings profile={profile} onProfile={onProfile} onDeleted={onLogout} nav={nav} />
        )}
      </main>
    </div>
  );
}

function Settings({
  profile,
  onProfile,
  onDeleted,
  nav,
}: {
  profile: Profile;
  onProfile: (p: Profile) => void;
  onDeleted: () => void;
  nav: Nav;
}) {
  const [name, setName] = useState(profile.displayName);
  const [nameMsg, setNameMsg] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);

  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  async function saveName() {
    setSavingName(true);
    setNameMsg(null);
    try {
      const { profile: p } = await api.setDisplayName(name.trim());
      onProfile(p);
      setNameMsg("Saved!");
    } catch (err) {
      setNameMsg(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSavingName(false);
    }
  }

  async function savePw() {
    setSavingPw(true);
    setPwMsg(null);
    setPwErr(null);
    try {
      await api.setPassword(cur, next);
      setCur("");
      setNext("");
      setPwMsg("Password updated!");
    } catch (err) {
      setPwErr(err instanceof Error ? err.message : "Failed.");
    } finally {
      setSavingPw(false);
    }
  }

  async function del() {
    try {
      await api.deleteAccount();
    } finally {
      onDeleted();
      nav.go("landing");
    }
  }

  return (
    <div className="mt-6 grid gap-5">
      <Panel className="p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-ink">Display name</h2>
        <p className="mt-1 text-sm text-subtle">How senders see you on your page.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field id="dn" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <Button onClick={saveName} loading={savingName} disabled={!name.trim()}>
            Save
          </Button>
        </div>
        {nameMsg && <p className="mt-2 text-xs font-medium text-success">{nameMsg}</p>}
      </Panel>

      <Panel className="p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-ink">Change password</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            id="cur"
            label="Current password"
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
          />
          <Field
            id="next"
            label="New password"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            error={pwErr}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={savePw} loading={savingPw} disabled={!cur || next.length < 6}>
            Update password
          </Button>
          {pwMsg && <span className="text-xs font-medium text-success">{pwMsg}</span>}
        </div>
      </Panel>

      <Panel className="border-fuchsia/30 p-6">
        <h2 className="font-display text-xl uppercase tracking-wide text-fuchsia">Danger zone</h2>
        <p className="mt-1 text-sm text-subtle">
          Deleting your account removes your link and every message you&apos;ve received. This can&apos;t be undone.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-ink">Are you sure?</span>
            <Button
              className="grad-btn"
              onClick={del}
            >
              Yes, delete everything
            </Button>
            <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            className="mt-4 border-fuchsia/40 text-fuchsia hover:border-fuchsia hover:bg-fuchsia/5"
            variant="outline"
            onClick={() => setConfirmDelete(true)}
          >
            Delete my account
          </Button>
        )}
      </Panel>
    </div>
  );
}
