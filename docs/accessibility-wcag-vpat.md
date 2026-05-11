# Accessibility WCAG / VPAT Snapshot

Status: partial production coverage, reviewed for blocks 16 and 20.

## Supported controls

- Skip link is present in the advanced platform area.
- ARIA labels are used on platform block navigation.
- Keyboard navigation uses native buttons, inputs, selects, and links.
- Adjustable font scale: `s`, `m`, `l`, `xl`.
- High contrast mode is available through `applyHighContrast`.
- Reduced motion is respected through `prefers-reduced-motion` utility and should be applied to new animated components.
- PT-BR, EN-US, and ES string catalogs exist for core platform labels.

## WCAG mapping

| Criterion | Status | Evidence |
|---|---|---|
| 1.1.1 Non-text Content | Partial | New media must include alt text; current app shell has icon-only controls with text labels nearby. |
| 1.4.3 Contrast | Partial | High contrast mode exists; full-page audit still required. |
| 2.1.1 Keyboard | Partial | Native controls are keyboard accessible; drag/swipe gestures need keyboard alternatives. |
| 2.4.1 Bypass Blocks | Supported | Skip link exists in platform hub. |
| 2.4.7 Focus Visible | Partial | Browser focus is preserved; custom components need visual regression audit. |
| 2.5.1 Pointer Gestures | Partial | Swipe features must keep button alternatives. |
| 3.1.1 Language of Page | Supported | `index.html` declares `pt-BR`. |
| 3.2.3 Consistent Navigation | Supported | Platform tabs and app sections keep consistent order. |
| 4.1.2 Name, Role, Value | Partial | Native controls pass; custom generated controls need manual screen-reader test. |

## Remaining VPAT gaps

- Full VoiceOver and TalkBack device pass.
- Video captions inventory for future educational videos.
- Color-blind palette verification for deuteranopia and protanopia.
- Modal focus trap and first-field autofocus audit across every modal.
- RTL implementation remains a roadmap item, not production.
