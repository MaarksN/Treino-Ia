import { describe, expect, it } from 'vitest';
import { extractFileMetadata, IMPORT_DISCLAIMER, OCR_STATUS_MESSAGE, validateImportFile } from './workoutImportService';

describe('workoutImportService', () => {
  it('extracts metadata from a valid image file', () => {
    const meta = extractFileMetadata({ name: 'treino.jpg', type: 'image/jpeg', size: 1024 * 500 });
    expect(meta.isImage).toBe(true);
    expect(meta.isPdf).toBe(false);
    expect(meta.isSupported).toBe(true);
    expect(meta.sizeFormatted).toBe('500 KB');
    expect(meta.guard.status).toBe('ready');
  });

  it('extracts metadata from a PDF file', () => {
    const meta = extractFileMetadata({ name: 'ficha.pdf', type: 'application/pdf', size: 2 * 1024 * 1024 });
    expect(meta.isImage).toBe(false);
    expect(meta.isPdf).toBe(true);
    expect(meta.isSupported).toBe(true);
    expect(meta.sizeFormatted).toBe('2.0 MB');
  });

  it('marks unsupported formats', () => {
    const meta = extractFileMetadata({ name: 'doc.docx', type: 'application/vnd.openxmlformats', size: 100 });
    expect(meta.isSupported).toBe(false);
    expect(meta.guard.status).toBe('blocked');
  });

  it('validates valid file', () => {
    const result = validateImportFile({ name: 'treino.png', type: 'image/png', size: 1024 });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects empty name', () => {
    const result = validateImportFile({ name: '', type: 'image/png', size: 1024 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('vazio'))).toBe(true);
  });

  it('rejects oversized file', () => {
    const result = validateImportFile({ name: 'big.jpg', type: 'image/jpeg', size: 13 * 1024 * 1024 });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('12 MB'))).toBe(true);
  });

  it('rejects empty file', () => {
    const result = validateImportFile({ name: 'empty.jpg', type: 'image/jpeg', size: 0 });
    expect(result.valid).toBe(false);
  });

  it('has OCR status and disclaimer messages', () => {
    expect(OCR_STATUS_MESSAGE).toContain('OCR');
    expect(IMPORT_DISCLAIMER).toContain('leitura automática');
  });
});
