"use client";

import { useState } from "react";

export function PasswordField({
  label,
  name,
  placeholder,
  autoComplete,
  minLength,
}: {
  label: string;
  name: string;
  placeholder?: string;
  autoComplete?: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      <span className="relative block">
        <input
          className="input"
          style={{ paddingRight: "2.75rem" }}
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-white/8 hover:text-text"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2.5 12S6.5 6.5 12 6.5 21.5 12 21.5 12 17.5 17.5 12 17.5 2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4.5 20.5 20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9.2 6.9A9.5 9.5 0 0 1 12 6.5c5.5 0 9.5 5.5 9.5 5.5a16 16 0 0 1-3.1 3.4M6.1 8.2C3.9 9.8 2.5 12 2.5 12S6.5 17.5 12 17.5c1.2 0 2.3-.2 3.3-.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.1 10.2a2.6 2.6 0 0 0 3.6 3.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
