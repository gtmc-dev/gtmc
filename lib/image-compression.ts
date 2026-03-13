// Vercel serverless function hard payload limit (4.5 MB)
export const VERCEL_PAYLOAD_LIMIT_BYTES = 4.5 * 1024 * 1024;

// Safe upload limit with FormData overhead headroom
export const UPLOAD_SAFE_LIMIT_BYTES = 4.3 * 1024 * 1024;

// Start compressing above this threshold to leave room for compression
export const COMPRESS_TRIGGER_BYTES = 3.5 * 1024 * 1024;

// Target size (MB) for compression — maps to browser-image-compression maxSizeMB
export const COMPRESS_TARGET_MB = 4.0;

export interface CompressionResult {
  file: File;
  compressed: boolean;
  error?: string;
}

export async function compressImageForUpload(
  file: File
): Promise<CompressionResult> {
  throw new Error("Not implemented");
}
