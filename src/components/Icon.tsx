import type { SVGProps } from "react";

type Common = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 18, children, ...rest }: Common & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Search = (p: Common) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
);
export const Menu = (p: Common) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
);
export const Close = (p: Common) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);
export const ArrowRight = (p: Common) => (
  <Base {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Base>
);
export const ArrowLeft = (p: Common) => (
  <Base {...p}>
    <path d="M19 12H5M11 19l-7-7 7-7" />
  </Base>
);
export const Clock = (p: Common) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Base>
);
export const Eye = (p: Common) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
);
export const Heart = (p: Common) => (
  <Base {...p}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
  </Base>
);
export const MessageSquare = (p: Common) => (
  <Base {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.2 7.4L3 21l2.1-5.8A8.4 8.4 0 1 1 21 11.5Z" />
  </Base>
);
export const Tag = (p: Common) => (
  <Base {...p}>
    <path d="M20 12 12 20l-8-8 8-8h8v8Z" />
    <circle cx="16" cy="8" r="1.5" />
  </Base>
);
export const User = (p: Common) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
);
export const Twitter = (p: Common) => (
  <Base {...p}>
    <path d="M22 5.9a8 8 0 0 1-2.3.6 4 4 0 0 0 1.7-2.2 8 8 0 0 1-2.6 1 4 4 0 0 0-6.9 3.6 11.4 11.4 0 0 1-8.3-4.2 4 4 0 0 0 1.3 5.4 4 4 0 0 1-1.8-.5v.1a4 4 0 0 0 3.2 4 4 4 0 0 1-1.8.1 4 4 0 0 0 3.7 2.8A8 8 0 0 1 2 18.5a11.3 11.3 0 0 0 6.1 1.8c7.3 0 11.3-6 11.3-11.3v-.5A8 8 0 0 0 22 6Z" />
  </Base>
);
export const Github = (p: Common) => (
  <Base {...p}>
    <path d="M9 19c-4 1.5-4-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C7 2.8 6 3.1 6 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.5 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.5 1.1-.5 2V21" />
  </Base>
);
export const Linkedin = (p: Common) => (
  <Base {...p}>
    <path d="M4 4h4v4H4zM4 10h4v10H4zM10 10h4v2c.6-1 2-2 4-2 3 0 4 2 4 5v5h-4v-4.5c0-1.4-.5-2.5-2-2.5s-2 1-2 2.5V20h-4V10Z" />
  </Base>
);
export const Globe = (p: Common) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Base>
);
export const Share = (p: Common) => (
  <Base {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </Base>
);
export const Bookmark = (p: Common) => (
  <Base {...p}>
    <path d="M6 3h12v18l-6-4-6 4Z" />
  </Base>
);
export const Sparkles = (p: Common) => (
  <Base {...p}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
  </Base>
);
export const TrendUp = (p: Common) => (
  <Base {...p}>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </Base>
);
export const Mail = (p: Common) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 7 9-7" />
  </Base>
);
export const Phone = (p: Common) => (
  <Base {...p}>
    <path d="M5 4h3l2 5-2 1a11 11 0 0 0 6 6l1-2 5 2v3a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </Base>
);
export const MapPin = (p: Common) => (
  <Base {...p}>
    <path d="M12 22s-7-7-7-13a7 7 0 0 1 14 0c0 6-7 13-7 13Z" />
    <circle cx="12" cy="9" r="2.5" />
  </Base>
);
export const Home = (p: Common) => (
  <Base {...p}>
    <path d="m3 11 9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
  </Base>
);
export const FileText = (p: Common) => (
  <Base {...p}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
    <path d="M14 3v6h6M8 13h8M8 17h6" />
  </Base>
);
export const Layers = (p: Common) => (
  <Base {...p}>
    <path d="m12 2 10 6-10 6L2 8Z" />
    <path d="m2 16 10 6 10-6M2 12l10 6 10-6" />
  </Base>
);
export const Users = (p: Common) => (
  <Base {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2 21a7 7 0 0 1 14 0" />
    <circle cx="17" cy="7" r="2.5" />
    <path d="M16 14a5 5 0 0 1 6 5" />
  </Base>
);
export const BarChart = (p: Common) => (
  <Base {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Base>
);
export const Settings = (p: Common) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1A2 2 0 1 1 7 4.7l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
  </Base>
);
export const Plus = (p: Common) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
);
export const Edit = (p: Common) => (
  <Base {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
  </Base>
);
export const Trash = (p: Common) => (
  <Base {...p}>
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
  </Base>
);
export const Check = (p: Common) => (
  <Base {...p}>
    <path d="m5 12 5 5L20 7" />
  </Base>
);
export const Filter = (p: Common) => (
  <Base {...p}>
    <path d="M3 5h18l-7 9v6l-4-2v-4Z" />
  </Base>
);
export const Logo = (p: Common) => (
  <Base {...p} strokeWidth={0} fill="url(#nexgrad)">
    <defs>
      <linearGradient id="nexgrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path d="M4 4h4l8 12V4h4v16h-4L8 8v12H4z" />
  </Base>
);
