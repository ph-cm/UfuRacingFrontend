"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/services/api";

interface Props {
  value: string;
  onChange: (url: string) => void;
  aspectHint?: "square" | "wide";
}

export default function ImageUpload({ value, onChange, aspectHint = "wide" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadImage(file);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Erro ao fazer upload");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewH = aspectHint === "square" ? "h-24 w-24" : "h-16 w-full";

  return (
    <div className="space-y-2">
      {value && (
        <div className={`${previewH} border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden`}>
          <img
            src={value}
            alt="preview"
            className="max-h-full max-w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Cole uma URL ou clique em Upload"
          className="flex-1 bg-gray-50 border border-gray-100 focus:border-navy/30 focus:bg-white px-3 py-2.5 text-sm text-navy outline-none transition-all"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 bg-navy text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 hover:bg-navy/80 transition-colors disabled:opacity-50"
        >
          {uploading ? "…" : "↑ Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 border border-gray-200 text-gray-400 hover:text-crimson hover:border-crimson/40 text-[10px] font-black px-2 py-2 transition-colors"
            title="Remover imagem"
          >
            ✕
          </button>
        )}
      </div>

      {error && <p className="text-crimson text-[11px] font-bold">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
