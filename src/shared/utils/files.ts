export class ImageReadError extends Error {
  readonly code: "not_image" | "too_large" | "read_failed";

  constructor(message: string, code: "not_image" | "too_large" | "read_failed") {
    super(message);
    this.name = "ImageReadError";
    this.code = code;
  }
}

export function readImageAsDataUrl(
  file: File,
  maxBytes = 5 * 1024 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new ImageReadError("Fichier non image", "not_image"));
      return;
    }
    if (file.size > maxBytes) {
      reject(new ImageReadError("Fichier trop volumineux", "too_large"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") resolve(result);
      else reject(new ImageReadError("Lecture échouée", "read_failed"));
    };
    reader.onerror = () =>
      reject(new ImageReadError("Lecture échouée", "read_failed"));
    reader.readAsDataURL(file);
  });
}
