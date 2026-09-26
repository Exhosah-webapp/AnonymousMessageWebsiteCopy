import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2.5 outline-none"
    >
      <span className="grad-btn flex h-9 w-9 items-center justify-center rounded-2xl shadow-[0_8px_24px_-8px_rgba(255,77,157,0.7)] transition-transform duration-200 group-hover:-rotate-6">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3.5 7.5 12 13l8.5-5.5M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="font-display text-[19px] uppercase tracking-wide text-ink">
        Secret<span className="text-gradient">Message</span>
      </span>
    </button>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
  full?: boolean;
};

export function Button({
  variant = "primary",
  loading = false,
  full = false,
  className = "",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[15px] font-semibold transition-all duration-150 outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98]";
  const variants = {
    primary:
      "grad-btn text-white shadow-[0_10px_30px_-10px_rgba(139,92,255,0.8)] hover:shadow-[0_14px_38px_-10px_rgba(255,77,157,0.7)] focus-visible:ring-fuchsia/30",
    outline:
      "border border-line-2 bg-panel text-ink hover:border-violet hover:bg-panel-2 focus-visible:ring-violet/25",
    ghost: "text-subtle hover:text-ink hover:bg-panel focus-visible:ring-violet/25",
  } as const;
  return (
    <button
      className={[base, variants[variant], full ? "w-full" : "", className].join(" ")}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin-fast rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  prefix?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, prefix, className = "", id, ...props },
  ref,
) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <div
        className={[
          "flex items-center rounded-2xl border bg-panel transition-all duration-150",
          error
            ? "border-fuchsia/70 ring-4 ring-fuchsia/15"
            : "border-line focus-within:border-violet focus-within:ring-4 focus-within:ring-violet/20",
        ].join(" ")}
      >
        {prefix && (
          <span className="pl-3.5 pr-1 text-[15px] text-faint select-none">{prefix}</span>
        )}
        <input
          id={id}
          ref={ref}
          className={[
            "w-full bg-transparent px-3.5 py-3 text-[15px] text-ink outline-none placeholder:text-faint",
            prefix ? "pl-0" : "",
            className,
          ].join(" ")}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-fuchsia">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-subtle">{hint}</p>
      ) : null}
    </div>
  );
});

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string | null };

export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea(
  { className = "", error, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={[
        "w-full resize-none rounded-2xl border bg-panel px-3.5 py-3 text-[15px] leading-relaxed text-ink outline-none transition-all duration-150 placeholder:text-faint",
        error
          ? "border-fuchsia/70 ring-4 ring-fuchsia/15"
          : "border-line focus:border-violet focus:ring-4 focus:ring-violet/20",
        className,
      ].join(" ")}
      {...props}
    />
  );
});

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-3xl border border-line bg-panel/80 backdrop-blur-sm shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_30px_60px_-30px_rgba(0,0,0,0.8)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-panel px-3.5 py-1.5 text-xs font-medium text-subtle">
      {children}
    </span>
  );
}
