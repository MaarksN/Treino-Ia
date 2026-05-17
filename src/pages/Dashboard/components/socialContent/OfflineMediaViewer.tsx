import { memo } from 'react';
import { getOfflineMediaForExercise } from '../../services/socialContent/offlineMediaService';

interface OfflineMediaViewerProps {
  exerciseName: string;
}

export const OfflineMediaViewer = memo(function OfflineMediaViewer({ exerciseName }: OfflineMediaViewerProps) {
  const svgContent = getOfflineMediaForExercise(exerciseName);

  if (!svgContent) return null;

  return (
    <div className="mt-4 mb-2 flex justify-center">
      <div
        className="h-24 w-24 md:h-32 md:w-32 rounded-[16px] bg-brand-dark border-2 border-brand-light/10 p-4 shadow-inner"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        aria-label={`Demonstração visual local para ${exerciseName}`}
      />
    </div>
  );
});
