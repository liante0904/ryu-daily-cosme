export const adjustHeight = (el: HTMLTextAreaElement | null) => {
  if (el) {
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ssh-oci.duckdns.org';
