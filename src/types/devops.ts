export interface OperationalCheck {
  id: string;
  label: string;
  status: 'ok' | 'warning' | 'missing';
  owner: 'app' | 'infra' | 'security' | 'data';
}
