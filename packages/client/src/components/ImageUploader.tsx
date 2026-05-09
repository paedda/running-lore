import { useRef } from 'react';
import type { ReportImage } from '@running-lore/shared';
import './ImageUploader.css';

interface ImageUploaderProps {
  images: ReportImage[];
  onChange: (images: ReportImage[]) => void;
}

const MAX_DIMENSION = 1200;
const ACCEPTED = 'image/jpeg,image/png,image/webp,image/gif';

function resizeAndEncode(file: File): Promise<ReportImage> {
  return new Promise((resolve, reject) => {
    const mediaType = file.type as ReportImage['mediaType'];
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);

      const outputType = mediaType === 'image/png' ? 'image/png' : 'image/jpeg';
      const dataUrl = canvas.toDataURL(outputType, 0.85);
      const data = dataUrl.split(',')[1];
      resolve({ data, mediaType: outputType as ReportImage['mediaType'] });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Could not load ${file.name}`));
    };

    img.src = url;
  });
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    const incoming = Array.from(files);
    const results = await Promise.all(incoming.map(resizeAndEncode));
    onChange([...images, ...results]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const remove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="card">
      <h2 className="card-title">Race Photos</h2>
      <p className="image-hint">
        Add photos from the race. Claude will reference them in the report.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        multiple
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {images.length > 0 && (
        <div className="image-grid">
          {images.map((img, i) => (
            <div key={i} className="image-thumb">
              <img src={`data:${img.mediaType};base64,${img.data}`} alt={`Race photo ${i + 1}`} />
              <button className="image-remove" onClick={() => remove(i)} aria-label="Remove photo">
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className="image-dropzone"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {images.length === 0 ? 'Drop photos here or click to upload' : 'Add more photos'}
      </div>
    </div>
  );
}
