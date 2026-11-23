export const adjustHeight = (el: HTMLTextAreaElement | null) => {
  if (el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ssh-oci.duckdns.org';

/** Format non-negative seconds as "M분 SS초". */
export const formatDuration = (seconds: number): string => {
  const safeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safeSeconds / 60)}분 ${String(safeSeconds % 60).padStart(2, '0')}초`;
};

/** Trigger a browser download for a fetched Blob. */
export const triggerBrowserDownload = (blob: Blob, filename: string) => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
};
