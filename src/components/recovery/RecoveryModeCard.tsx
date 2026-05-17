export function RecoveryModeCard({ tips }: { tips: string[] }) {
  return <article className="rounded-2xl border-2 border-brand-light/20 bg-brand-gray p-4"><h3 className="font-display text-2xl">Modo recuperação</h3><ul className="mt-2 list-disc pl-5 text-sm">{tips.map(tip => <li key={tip}>{tip}</li>)}</ul></article>;
}
