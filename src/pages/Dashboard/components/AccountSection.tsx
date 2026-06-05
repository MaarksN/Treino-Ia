import { lazy, Suspense } from 'react';
import { Skeleton } from '../../../components/ui/Skeleton';
import { type PersistenceStatus } from '../../../services/database';
import { CloudPanel } from './CloudPanel';

const MonetizationHub = lazy(() =>
  import('./monetization/MonetizationHub').then((module) => ({ default: module.MonetizationHub })),
);

interface AccountSectionProps {
  persistence: PersistenceStatus | null;
  email: string;
  password: string;
  loading: boolean;
  billingEnabled: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}

export function AccountSection({
  persistence,
  email,
  password,
  loading,
  billingEnabled,
  onEmailChange,
  onPasswordChange,
  onSignIn,
  onSignUp,
  onSignOut,
}: AccountSectionProps) {
  return (
    <section id="dashboard-account" className="mb-8 scroll-mt-24 space-y-6">
      <CloudPanel
        persistence={persistence}
        email={email}
        password={password}
        loading={loading}
        onEmailChange={onEmailChange}
        onPasswordChange={onPasswordChange}
        onSignIn={onSignIn}
        onSignUp={onSignUp}
        onSignOut={onSignOut}
      />

      {billingEnabled && (
        <Suspense fallback={<Skeleton lines={3} />}>
          <MonetizationHub />
        </Suspense>
      )}
    </section>
  );
}
