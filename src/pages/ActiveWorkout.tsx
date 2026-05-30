import { useEffect } from 'react';
import Dashboard from './Dashboard';
import { pushAppRoute } from '../navigation/appRouter';

export default function ActiveWorkout() {
  useEffect(() => {
    pushAppRoute('active-workout');
  }, []);

  return <Dashboard />;
}
