import {
  gzipSync,
  strToU8,
} from 'fflate';

export function compressSyncString(
  raw: string,
): Uint8Array | null {
  try {
    return gzipSync(strToU8(raw));
  } catch {
    return null;
  }
}
