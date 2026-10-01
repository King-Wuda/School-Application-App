/* Tiny inline-SVG icon set — no external dep. All 24x24, currentColor. */
import * as React from "react";

type Props = React.SVGAttributes<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: Props & { children: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const HeartIcon = ({ filled, ...p }: Props & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </Svg>
);

export const SearchIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const MapPinIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
    <circle cx="12" cy="10" r="3" />
  </Svg>
);

export const CalendarIcon = (p: Props) => (
  <Svg {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const CheckIcon = (p: Props) => (
  <Svg {...p}>
    <path d="m5 12 5 5L20 7" />
  </Svg>
);

export const ExternalLinkIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </Svg>
);

export const BellIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

export const StarIcon = (p: Props) => (
  <Svg {...p}>
    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </Svg>
);

export const XIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const ChevronRightIcon = (p: Props) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const MenuIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Svg>
);

export const DownloadIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

export const LogoMarkIcon = (p: Props) => (
  <Svg {...p} strokeWidth={0} fill="currentColor">
    <path d="M12 2 2 7l10 5 10-5-10-5z" />
    <path d="m2 17 10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth={2} fill="none" />
  </Svg>
);

export const PhoneIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </Svg>
);

export const NavigationIcon = (p: Props) => (
  <Svg {...p}>
    <path d="m3 11 19-9-9 19-2-8-8-2z" />
  </Svg>
);

export const LocateIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Svg>
);

export const SlidersIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />
  </Svg>
);

export const GlobeIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </Svg>
);

export const UsersIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </Svg>
);

export const GraduationCapIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M22 10 12 5 2 10l10 5 10-5z" />
    <path d="M6 12v5c3 2 9 2 12 0v-5" />
  </Svg>
);

export const WalletIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </Svg>
);

export const ClipboardIcon = (p: Props) => (
  <Svg {...p}>
    <rect width="8" height="4" x="8" y="2" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="m9 14 2 2 4-4" />
  </Svg>
);

export const ArrowRightIcon = (p: Props) => (
  <Svg {...p}>
    <path d="M5 12h14M13 5l7 7-7 7" />
  </Svg>
);

export const InfoIcon = (p: Props) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4M12 8h.01" />
  </Svg>
);

export const ChevronDownIcon = (p: Props) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);
