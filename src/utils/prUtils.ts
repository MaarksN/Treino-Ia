import { PersonalRecord, WorkoutPlan } from '../types';

const PR_KEY = '@TreinoApp:prs';

export function loadPRs(): PersonalRecord[] {
  try {
    return JSON.parse(localStorage.getItem(PR_KEY) || '[]');
  } catch {
    return [];
  }
}

export function savePR(pr: PersonalRecord) {
  const prs = loadPRs();
  const existing = prs.findIndex(record => record.exerciseName === pr.exerciseName);

  if (existing === -1) {
    localStorage.setItem(PR_KEY, JSON.stringify([...prs, pr]));
    return true;
  }

  if (pr.weight > prs[existing].weight || (pr.weight === prs[existing].weight && pr.reps > prs[existing].reps)) {
    prs[existing] = pr;
    localStorage.setItem(PR_KEY, JSON.stringify(prs));
    return true;
  }

  return false;
}

export function getPRForExercise(exerciseName: string) {
  return loadPRs().find(record => record.exerciseName === exerciseName) || null;
}

function parseFirstReps(actualReps?: string) {
  if (!actualReps) return 0;
  const match = actualReps.match(/\d+/);
  return match ? Number(match[0]) : 0;
}

export function extractAndSavePRsFromPlan(plan: WorkoutPlan) {
  const newPRs: string[] = [];

  plan.days.forEach(day => {
    day.exercises.forEach(exercise => {
      const bestSet = exercise.setLogs
        ?.filter(log => log.weight && log.reps)
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))[0];

      const weight = bestSet?.weight || exercise.actualWeight;
      const reps = bestSet?.reps || parseFirstReps(exercise.actualReps);

      if (weight && reps) {
        const pr: PersonalRecord = {
          exerciseName: exercise.name,
          weight,
          reps,
          date: Date.now(),
          planId: plan.id,
        };
        if (savePR(pr)) newPRs.push(exercise.name);
      }
    });
  });

  return newPRs;
}
