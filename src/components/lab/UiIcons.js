function SvgBase({ size = 15, className = '', children }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconCost({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M9.5 10.2c0-1.1 1.1-1.8 2.5-1.8s2.5.7 2.5 1.7c0 1.9-5 1.7-5 3.7 0 1 1.1 1.8 2.5 1.8s2.5-.7 2.5-1.8" />
    </SvgBase>
  );
}

export function IconRarity({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M6.5 4h11L21 9.5 12 20 3 9.5 6.5 4Z" />
      <path d="M3 9.5h18" />
      <path d="M9 4l-1.5 5.5L12 20l4.5-10.5L15 4" />
    </SvgBase>
  );
}

export function IconAtk({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 3h2v2l-5 5" />
      <path d="M5 19l5-5" />
    </SvgBase>
  );
}

export function IconHp({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M12 21s-7-4.4-8.6-9.1C2.2 8.4 4.5 5 8 5c2 0 3.4 1.1 4 2.4C12.6 6.1 14 5 16 5c3.5 0 5.8 3.4 4.6 6.9C19 16.6 12 21 12 21Z" />
      <path d="M12 9.5v5M9.5 12h5" />
    </SvgBase>
  );
}

export function IconPlusMode({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M12 8v8M8 12h8" />
    </SvgBase>
  );
}

export function IconInfo({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="0.6" fill="currentColor" stroke="none" />
    </SvgBase>
  );
}

export function IconSuccess({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.4 2.4 4.8-5.2" />
    </SvgBase>
  );
}

export function IconWarning({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M12 3.5 21 19.5H3L12 3.5Z" />
      <path d="M12 9.5v4.5" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
    </SvgBase>
  );
}

export function IconDanger({ size = 16, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M7.8 3h8.4L21 7.8v8.4L16.2 21H7.8L3 16.2V7.8L7.8 3Z" />
      <path d="m9.5 9.5 5 5M14.5 9.5l-5 5" />
    </SvgBase>
  );
}

export function IconClose({ size = 14, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M6 6l12 12M18 6 6 18" />
    </SvgBase>
  );
}

export function IconSliders({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
      <circle cx="9" cy="7" r="2" fill="var(--lab-surface-1, #fff)" />
      <circle cx="15" cy="12" r="2" fill="var(--lab-surface-1, #fff)" />
      <circle cx="10" cy="17" r="2" fill="var(--lab-surface-1, #fff)" />
    </SvgBase>
  );
}

export function IconCheck({ size = 14, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="m5 12.5 4.2 4.2L19 7" />
    </SvgBase>
  );
}

export function IconSave({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M5 3h11l3 3v15H5V3Z" />
      <path d="M8 3v5h7V3" />
      <rect x="8" y="13" width="8" height="8" />
    </SvgBase>
  );
}

export function IconCopy({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <rect x="9" y="9" width="11" height="11" />
      <path d="M5 15H4V4h11v1" />
    </SvgBase>
  );
}

export function IconTrash({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </SvgBase>
  );
}

export function IconSearch({ size = 15, className = '' }) {
  return (
    <SvgBase size={size} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </SvgBase>
  );
}
