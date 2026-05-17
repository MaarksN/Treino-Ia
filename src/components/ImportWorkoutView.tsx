import { useMemo, useRef, useState, type DragEvent } from 'react';
import { Activity, Crop, FileImage, FileText, UploadCloud } from 'lucide-react';
import {
  buildWorkoutImportDraft,
  cropImageDataUrl,
  DEFAULT_WORKOUT_IMPORT_CROP,
  getWorkoutImportGuard,
  normalizeCropRect,
  type CropRectPercent,
  type WorkoutImportFileDraft,
} from '../services/workoutImportPipeline';

interface Props {
  onImport: (draft: WorkoutImportFileDraft) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

const cropFields: Array<{ key: keyof CropRectPercent; label: string }> = [
  { key: 'x', label: 'X' },
  { key: 'y', label: 'Y' },
  { key: 'width', label: 'Largura' },
  { key: 'height', label: 'Altura' },
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024 * 1024) return `${Math.round(sizeBytes / 1024)} KB`;
  return `${(sizeBytes / 1024 / 1024).toFixed(1)} MB`;
}

export function ImportWorkoutView({ onImport, onCancel, isLoading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRectPercent>(DEFAULT_WORKOUT_IMPORT_CROP);
  const [localError, setLocalError] = useState('');

  const guard = useMemo(() => (
    selectedFile ? getWorkoutImportGuard(selectedFile.type, selectedFile.size) : null
  ), [selectedFile]);

  const updateCrop = (key: keyof CropRectPercent, value: string) => {
    setCrop(current => normalizeCropRect({ ...current, [key]: Number(value) }));
  };

  const handleFile = async (file: File) => {
    setLocalError('');
    setSelectedFile(file);
    setCrop(DEFAULT_WORKOUT_IMPORT_CROP);

    if (file.type.startsWith('image/')) {
      setPreviewDataUrl(await readFileAsDataUrl(file));
      return;
    }

    setPreviewDataUrl(null);
  };

  const handleDrag = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      void handleFile(file);
    }
  };

  const handlePrepareImport = async () => {
    if (!selectedFile) {
      setLocalError('Selecione uma imagem ou PDF antes de preparar.');
      return;
    }

    const dataUrl = await readFileAsDataUrl(selectedFile);
    const base64 = dataUrl.split(',')[1] ?? '';
    const croppedImage = selectedFile.type.startsWith('image/')
      ? await cropImageDataUrl(dataUrl, crop)
      : null;
    const draft = buildWorkoutImportDraft({
      fileName: selectedFile.name,
      mimeType: selectedFile.type,
      sizeBytes: selectedFile.size,
      base64,
      crop,
      croppedImageDataUrl: croppedImage,
    });

    if (draft.status === 'blocked') {
      setLocalError(draft.warnings[0] ?? 'Arquivo bloqueado para importação.');
    }

    await onImport(draft);
  };

  return (
    <section className="mb-8 rounded-[28px] border-4 border-brand-magenta bg-brand-gray p-6 shadow-brutal-magenta md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-brand-magenta">
            Importação segura
          </p>
          <h2 className="font-display text-5xl uppercase text-brand-light">Imagem ou PDF</h2>
          <p className="mt-2 max-w-3xl font-mono text-sm leading-6 text-brand-light/70">
            Prepare arquivo e crop local. OCR e leitura automatizada ficam bloqueados até existir uma integração real.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border-2 border-brand-light/20 px-5 py-3 font-mono text-xs uppercase tracking-widest text-brand-light transition-colors hover:border-brand-magenta hover:text-brand-magenta"
        >
          Fechar
        </button>
      </div>

      <div
        className={`relative rounded-[24px] border-2 p-8 text-center transition-all ${
          dragActive
            ? 'border-brand-neon bg-brand-neon/10 shadow-brutal-neon'
            : 'border-dashed border-brand-light/20 bg-brand-dark/40 hover:border-brand-magenta'
        } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={event => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Activity className="mb-5 h-12 w-12 animate-spin text-brand-neon" />
            <p className="font-mono text-xs uppercase tracking-widest text-brand-neon">
              Preparando arquivo
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <UploadCloud className="mb-4 h-12 w-12 text-brand-neon" />
            <p className="font-display text-4xl uppercase leading-none text-brand-light">
              Arraste a ficha aqui
            </p>
            <p className="mt-2 font-mono text-xs uppercase tracking-widest text-brand-muted">
              JPG, PNG, WebP ou PDF até 12 MB
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 rounded-[18px] border-2 border-brand-light bg-brand-light px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark transition-colors hover:bg-brand-neon"
            >
              Selecionar arquivo
            </button>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-[22px] border border-brand-light/15 bg-brand-dark p-4">
            <div className="mb-4 flex items-center gap-3">
              {selectedFile.type === 'application/pdf' ? (
                <FileText className="h-6 w-6 text-brand-magenta" />
              ) : (
                <FileImage className="h-6 w-6 text-brand-neon" />
              )}
              <div className="min-w-0">
                <p className="truncate font-mono text-sm text-brand-light">{selectedFile.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                  {selectedFile.type || 'tipo desconhecido'} | {formatBytes(selectedFile.size)}
                </p>
              </div>
            </div>
            {guard && (
              <p className={`rounded-[14px] border px-3 py-2 font-mono text-xs leading-5 ${
                guard.status === 'ready'
                  ? 'border-brand-neon/40 text-brand-neon'
                  : 'border-brand-magenta/50 text-brand-magenta'
              }`}>
                {guard.reason}
              </p>
            )}
            {previewDataUrl && (
              <div className="mt-4 overflow-hidden rounded-[18px] border border-brand-light/10 bg-brand-gray">
                <img src={previewDataUrl} alt="Prévia da ficha importada" className="max-h-72 w-full object-contain" />
              </div>
            )}
          </div>

          <div className="rounded-[22px] border border-brand-light/15 bg-brand-dark p-4">
            <div className="mb-4 flex items-center gap-2">
              <Crop className="h-5 w-5 text-brand-neon" />
              <p className="font-mono text-xs uppercase tracking-widest text-brand-light">
                Crop local
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {cropFields.map(field => (
                <label key={field.key} className="block">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-muted">
                    {field.label}: {crop[field.key]}%
                  </span>
                  <input
                    type="range"
                    min={field.key === 'width' || field.key === 'height' ? 1 : 0}
                    max={100}
                    value={crop[field.key]}
                    onChange={event => updateCrop(field.key, event.target.value)}
                    className="mt-2 w-full accent-brand-neon"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={handlePrepareImport}
              disabled={isLoading}
              className="mt-5 w-full rounded-[18px] border-2 border-brand-neon bg-brand-neon px-6 py-3 font-mono text-xs uppercase tracking-widest text-brand-dark transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              Preparar arquivo
            </button>
            {(localError || guard?.status === 'blocked') && (
              <p className="mt-3 rounded-[14px] border border-brand-magenta/50 bg-brand-magenta/10 px-3 py-2 font-mono text-xs leading-5 text-brand-light">
                {localError || guard?.reason}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
