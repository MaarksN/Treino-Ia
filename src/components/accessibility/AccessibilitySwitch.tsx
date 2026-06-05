interface AccessibilitySwitchProps {
  checked: boolean;
  onToggle: () => void;
  ariaLabel: string;
  enabledLabel: string;
  disabledLabel: string;
}

export function AccessibilitySwitch({
  checked,
  onToggle,
  ariaLabel,
  enabledLabel,
  disabledLabel,
}: AccessibilitySwitchProps) {
  return (
    <div className="mt-4 flex items-center gap-4">
      <button
        type="button"
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-neon focus:ring-offset-2 focus:ring-offset-brand-dark ${
          checked ? 'border-brand-neon bg-brand-neon' : 'border-brand-light/30 bg-brand-dark'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-brand-light shadow-lg transition-transform duration-200 ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          } mt-[2px]`}
        />
      </button>
      <span className="font-mono text-sm text-brand-light">
        {checked ? enabledLabel : disabledLabel}
      </span>
    </div>
  );
}
