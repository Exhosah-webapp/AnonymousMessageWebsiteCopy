import { useState } from "react";
import { Button, Logo, Panel, Pill } from "../components/ui";

type Nav = { go: (route: string) => void };

const FEATURES = [
  {
    emoji: "🕶️",
    title: "Truly anonymous",
    body: "We never log a sender's IP, device or identity. Only the message reaches your inbox.",
  },
  {
    emoji: "⚡",
    title: "Live in seconds",
    body: "Claim a link, drop it in your bio or story, and watch the confessions roll in.",
  },
  {
    emoji: "🔑",
    title: "Yours to control",
    body: "Password-protected inbox. Delete any message, rename yourself, or nuke it all anytime.",
  },
  {
    emoji: "💸",
    title: "Free forever",
    body: "No paywalls, no credit card, no catch. Send and receive as much as you want.",
  },
];

const STEPS = [
  { n: "01", title: "Create your link", body: "Pick a name and a password. Your personal link is ready instantly." },
  { n: "02", title: "Share it everywhere", body: "Post it to Instagram, WhatsApp, TikTok — anywhere your people are." },
  { n: "03", title: "Read the tea", body: "Anonymous messages land in your private inbox. Reply with story cards." },
];

const FAQ = [
  {
    q: "Is it really anonymous?",
    a: "Yes. We don't store the sender's IP address, cookies or device info. There's no way for you — or us — to trace who sent a message.",
  },
  {
    q: "Do senders need an account?",
    a: "Never. Anyone with your link can send a message in one tap, no signup required.",
  },
  {
    q: "Can I delete messages?",
    a: "Of course. Every message has a delete button, and you can wipe your whole account from the Danger Zone.",
  },
  {
    q: "How long is a message?",
    a: "Up to 1,000 characters — plenty of room for the whole story.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen((o) => !o)}
      className="w-full border-b border-line py-5 text-left"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="text-[17px] font-semibold text-ink">{q}</span>
        <span
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line-2 text-subtle transition-transform",
            open ? "rotate-45" : "",
          ].join(" ")}
        >
          +
        </span>
      </div>
      <div
        className={[
          "grid transition-all duration-300",
          open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        ].join(" ")}
      >
        <p className="overflow-hidden text-[15px] leading-relaxed text-subtle">{a}</p>
      </div>
    </button>
  );
}

export default function Landing({ nav }: { nav: Nav }) {
  const [agree, setAgree] = useState(false);
  const [slug, setSlug] = useState("");

  function create() {
    nav.go("signup");
  }

  return (
    <div className="aurora min-h-full">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <Logo onClick={() => nav.go("landing")} />
        <nav className="flex items-center gap-2 sm:gap-5">
          <button className="hidden text-sm font-medium text-subtle transition-colors hover:text-ink sm:inline">
            How it works
          </button>
          <button
            onClick={() => nav.go("login")}
            className="text-sm font-medium text-subtle transition-colors hover:text-ink"
          >
            Log in
          </button>
          <Button className="px-4 py-2.5 text-sm" onClick={() => nav.go("signup")}>
            Get started
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
        <div>
          <Pill>
            <span className="text-fuchsia">●</span> 2.4M anonymous messages sent
          </Pill>
          <h1 className="mt-5 font-display text-6xl uppercase leading-[0.92] tracking-wide text-ink sm:text-7xl lg:text-8xl">
            Send me
            <br />
            <span className="text-gradient">anonymous</span>
            <br />
            messages
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-subtle">
            Create your free link, share it on your story, and let people tell you what they really
            think — without ever knowing who they are.
          </p>

          <Panel className="mt-8 max-w-md p-5">
            <div className="flex items-center rounded-2xl border border-line bg-canvas px-3.5 py-3 focus-within:border-violet">
              <span className="text-[15px] text-faint">secretmessage.link/</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="yourname"
                className="w-full bg-transparent px-1 text-[15px] text-ink outline-none placeholder:text-faint"
              />
            </div>
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm text-subtle">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 accent-[#8b5cff]"
              />
              I agree to the Terms &amp; Conditions
            </label>
            <Button className="mt-4" full disabled={!agree} onClick={create}>
              Create your link →
            </Button>
          </Panel>
        </div>

        {/* Floating phone mock */}
        <div className="relative hidden lg:block">
          <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-violet/20 to-fuchsia/20 blur-3xl" />
          <div className="animate-float relative mx-auto w-[290px] rounded-[2.4rem] border border-line-2 bg-canvas-2 p-4 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)]">
            <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-line-2" />
            <div className="grad-btn rounded-2xl p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-white/75">Anonymous to</p>
              <p className="font-display text-2xl uppercase tracking-wide text-white">@luna</p>
            </div>
            <div className="mt-4 space-y-3">
              {[
                "ok but who gave you the right to be this funny 😭",
                "i've had a crush on you since sophomore year fr",
                "your playlist changed my life, no exaggeration",
              ].map((t, i) => (
                <div key={i} className="rounded-2xl border border-line bg-panel px-4 py-3">
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-faint">
                    ◆ Anonymous
                  </p>
                  <p className="text-sm text-ink">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line bg-canvas-2/40">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-tight tracking-wide text-ink sm:text-5xl">
            Why <span className="text-gradient">SecretMessage?</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <Panel key={f.title} className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-panel-2 text-2xl">
                  {f.emoji}
                </div>
                <h3 className="text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{f.body}</p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-4xl uppercase tracking-wide text-ink sm:text-5xl">
          Three steps <span className="text-gradient">to the tea</span>
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="font-display text-6xl text-line-2">{s.n}</span>
              <h3 className="mt-2 text-xl font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-subtle">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="text-center font-display text-4xl uppercase tracking-wide text-ink sm:text-5xl">
          Questions? <span className="text-gradient">Answered.</span>
        </h2>
        <div className="mt-8">
          {FAQ.map((f) => (
            <FaqItem key={f.q} {...f} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <div className="grad-btn relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-16">
          <h2 className="font-display text-4xl uppercase leading-tight tracking-wide text-white sm:text-6xl">
            Ready to hear
            <br />
            what they really think?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/85">
            It takes ten seconds and it&apos;s completely free.
          </p>
          <Button
            className="mt-8 bg-white text-[#1a0f2b] shadow-none hover:bg-white"
            onClick={() => nav.go("signup")}
          >
            Create your free secret link →
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint sm:flex-row">
          <Logo onClick={() => nav.go("landing")} />
          <p>Made for fun. Not for collecting sensitive or personal data.</p>
          <div className="flex gap-5">
            <button className="transition-colors hover:text-ink">About</button>
            <button onClick={() => nav.go("login")} className="transition-colors hover:text-ink">
              Log in
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
