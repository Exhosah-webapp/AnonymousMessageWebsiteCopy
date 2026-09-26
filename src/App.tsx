import { useEffect, useState } from "react";
import { api, getSlug, type Profile } from "./lib/api";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";

type Route =
  | { name: "landing" }
  | { name: "login" }
  | { name: "signup" }
  | { name: "dashboard" }
  | { name: "send"; slug: string };

function parseRoute(): Route {
  const params = new URLSearchParams(window.location.search);
  const to = params.get("to");
  if (to) return { name: "send", slug: to.toLowerCase().replace(/[^a-z0-9-]/g, "") };
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (hash === "login") return { name: "login" };
  if (hash === "signup") return { name: "signup" };
  if (hash === "dashboard") return { name: "dashboard" };
  return { name: "landing" };
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseRoute);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [booted, setBooted] = useState(false);

  // Restore session on load.
  useEffect(() => {
    if (getSlug()) {
      api
        .me()
        .then(({ profile }) => setProfile(profile))
        .catch(() => {})
        .finally(() => setBooted(true));
    } else {
      setBooted(true);
    }
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parseRoute());
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);

  function go(target: string) {
    if (target.startsWith("send:")) {
      const slug = target.slice(5);
      window.history.pushState({}, "", `?to=${slug}`);
      setRoute({ name: "send", slug });
      window.scrollTo(0, 0);
      return;
    }
    // Clear any ?to= when navigating to app routes.
    window.history.pushState({}, "", `${window.location.pathname}#/${target === "landing" ? "" : target}`);
    setRoute(parseRoute());
    window.scrollTo(0, 0);
  }

  const nav = { go };

  // Public send page renders regardless of auth.
  if (route.name === "send") {
    return <Send slug={route.slug} nav={nav} />;
  }

  if (!booted) {
    return (
      <div className="aurora flex min-h-full items-center justify-center">
        <span className="h-8 w-8 animate-spin-fast rounded-full border-2 border-line-2 border-t-violet" />
      </div>
    );
  }

  // Guard: dashboard requires auth.
  if (route.name === "dashboard") {
    if (!profile) return <Auth mode="login" nav={nav} onAuthed={setProfile} />;
    return (
      <Dashboard
        profile={profile}
        nav={nav}
        onProfile={setProfile}
        onLogout={() => setProfile(null)}
      />
    );
  }

  if (route.name === "login") {
    if (profile) {
      go("dashboard");
      return null;
    }
    return <Auth mode="login" nav={nav} onAuthed={setProfile} />;
  }

  if (route.name === "signup") {
    if (profile) {
      go("dashboard");
      return null;
    }
    return <Auth mode="signup" nav={nav} onAuthed={setProfile} />;
  }

  return <Landing nav={nav} />;
}
