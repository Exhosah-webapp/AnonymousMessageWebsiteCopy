import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info";

const supabase = createClient(`https://${projectId}.supabase.co`, publicAnonKey);

const SLUG_KEY = "sm.slug";

export type Profile = {
  slug: string;
  displayName: string;
  createdAt?: string;
};

export type Message = {
  id: string;
  slug: string;
  message: string;
  senderName: string;
  createdAt: string;
};

// ---- helpers ----------------------------------------------------------------

export function normalizeSlug(raw: string): string {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

async function hashPassword(slug: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`sm:${slug}:${password}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function friendly(error: { message?: string; code?: string } | null): string {
  if (!error) return "Something went wrong. Please try again.";
  if (error.code === "42P01" || /does not exist/i.test(error.message ?? "")) {
    return "The database tables aren't set up yet. Run the setup SQL in Supabase first.";
  }
  return error.message ?? "Something went wrong. Please try again.";
}

type AccountRow = {
  slug: string;
  display_name: string;
  password_hash: string;
  created_at: string;
};

type MessageRow = {
  id: string;
  slug: string;
  message: string;
  sender_name: string | null;
  created_at: string;
};

function toProfile(row: AccountRow): Profile {
  return { slug: row.slug, displayName: row.display_name, createdAt: row.created_at };
}

// ---- session ----------------------------------------------------------------

export function getSlug(): string | null {
  return localStorage.getItem(SLUG_KEY);
}

function setSlug(slug: string) {
  localStorage.setItem(SLUG_KEY, slug);
}

export function clearSession() {
  localStorage.removeItem(SLUG_KEY);
}

// ---- api --------------------------------------------------------------------

export const api = {
  async signup(input: { slug: string; displayName: string; password: string }): Promise<Profile> {
    const slug = normalizeSlug(input.slug);
    if (slug.length < 3) throw new Error("Link name must be at least 3 characters.");
    if (input.password.length < 6) throw new Error("Password must be at least 6 characters.");

    const { data: existing } = await supabase
      .from("sm_accounts")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();
    if (existing) throw new Error("That link name is already taken.");

    const row = {
      slug,
      display_name: input.displayName.trim().slice(0, 40) || slug,
      password_hash: await hashPassword(slug, input.password),
    };

    const { data, error } = await supabase.from("sm_accounts").insert(row).select().single();
    if (error) throw new Error(friendly(error));
    setSlug(slug);
    return toProfile(data as AccountRow);
  },

  async login(input: { slug: string; password: string }): Promise<Profile> {
    const slug = normalizeSlug(input.slug);
    const { data, error } = await supabase
      .from("sm_accounts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(friendly(error));
    if (!data) throw new Error("No account found for that link name.");
    if ((data as AccountRow).password_hash !== (await hashPassword(slug, input.password))) {
      throw new Error("Incorrect password.");
    }
    setSlug(slug);
    return toProfile(data as AccountRow);
  },

  async logout(): Promise<void> {
    clearSession();
  },

  async me(): Promise<{ profile: Profile }> {
    const slug = getSlug();
    if (!slug) throw new Error("Not authenticated.");
    const { data, error } = await supabase
      .from("sm_accounts")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(friendly(error));
    if (!data) {
      clearSession();
      throw new Error("Account not found.");
    }
    return { profile: toProfile(data as AccountRow) };
  },

  async lookup(slug: string): Promise<{ slug: string; displayName: string }> {
    const s = normalizeSlug(slug);
    const { data, error } = await supabase
      .from("sm_accounts")
      .select("slug, display_name")
      .eq("slug", s)
      .maybeSingle();
    if (error) throw new Error(friendly(error));
    if (!data) throw new Error("This link doesn't exist.");
    return { slug: data.slug, displayName: data.display_name };
  },

  async send(slug: string, message: string, senderName?: string): Promise<{ ok: boolean }> {
    const s = normalizeSlug(slug);
    const clean = message.trim().slice(0, 1000);
    if (!clean) throw new Error("Message is required.");
    const name = (senderName ?? "").trim().slice(0, 40);

    const { error } = await supabase
      .from("sm_messages")
      .insert({ slug: s, message: clean, sender_name: name || null });

    if (error) {
      // If the sender_name column hasn't been added yet, still deliver the message.
      if (/sender_name/.test(error.message ?? "") || error.code === "PGRST204") {
        const { error: retry } = await supabase
          .from("sm_messages")
          .insert({ slug: s, message: clean });
        if (retry) throw new Error(friendly(retry));
        return { ok: true };
      }
      throw new Error(friendly(error));
    }
    return { ok: true };
  },

  async messages(): Promise<{ messages: Message[] }> {
    const slug = getSlug();
    if (!slug) throw new Error("Not authenticated.");
    const { data, error } = await supabase
      .from("sm_messages")
      .select("*")
      .eq("slug", slug)
      .order("created_at", { ascending: false });
    if (error) throw new Error(friendly(error));
    const messages = ((data ?? []) as MessageRow[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      message: r.message,
      senderName: r.sender_name ?? "Anonymous",
      createdAt: r.created_at,
    }));
    return { messages };
  },

  async deleteMessage(id: string): Promise<{ ok: boolean }> {
    const { error } = await supabase.from("sm_messages").delete().eq("id", id);
    if (error) throw new Error(friendly(error));
    return { ok: true };
  },

  async setDisplayName(displayName: string): Promise<{ profile: Profile }> {
    const slug = getSlug();
    if (!slug) throw new Error("Not authenticated.");
    const { data, error } = await supabase
      .from("sm_accounts")
      .update({ display_name: displayName.trim().slice(0, 40) })
      .eq("slug", slug)
      .select()
      .single();
    if (error) throw new Error(friendly(error));
    return { profile: toProfile(data as AccountRow) };
  },

  async setPassword(currentPassword: string, newPassword: string): Promise<{ ok: boolean }> {
    const slug = getSlug();
    if (!slug) throw new Error("Not authenticated.");
    if (newPassword.length < 6) throw new Error("New password must be at least 6 characters.");
    const { data } = await supabase.from("sm_accounts").select("password_hash").eq("slug", slug).maybeSingle();
    if (!data || (data as AccountRow).password_hash !== (await hashPassword(slug, currentPassword))) {
      throw new Error("Current password is incorrect.");
    }
    const { error } = await supabase
      .from("sm_accounts")
      .update({ password_hash: await hashPassword(slug, newPassword) })
      .eq("slug", slug);
    if (error) throw new Error(friendly(error));
    return { ok: true };
  },

  async deleteAccount(): Promise<{ ok: boolean }> {
    const slug = getSlug();
    if (!slug) throw new Error("Not authenticated.");
    await supabase.from("sm_messages").delete().eq("slug", slug);
    const { error } = await supabase.from("sm_accounts").delete().eq("slug", slug);
    if (error) throw new Error(friendly(error));
    clearSession();
    return { ok: true };
  },
};

export function linkFor(slug: string): string {
  return `${window.location.origin}/?to=${slug}`;
}
