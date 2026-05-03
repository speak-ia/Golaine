import { useCallback, useRef } from "react";
import { readImageAsDataUrl, ImageReadError } from "@shared/utils/files";
import { logger } from "@shared/utils/logger";
import { getUnknownErrorMessage } from "@shared/utils/unknownError";

export function useImageUpload(opts: {
  onLoaded: (_dataUrl: string) => void;
  onError?: (_err: ImageReadError | Error) => void;
  maxBytes?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const url = await readImageAsDataUrl(file, opts.maxBytes);
        opts.onLoaded(url);
      } catch (error: unknown) {
        if (error instanceof ImageReadError) {
          opts.onError?.(error);
          return;
        }
        logger.error("Lecture image : erreur inattendue", {
          error:
            error instanceof Error
              ? { name: error.name, message: error.message }
              : { raw: String(error) },
        });
        opts.onError?.(new Error(getUnknownErrorMessage(error)));
      }
      e.target.value = "";
    },
    [opts]
  );

  return { inputRef, open, onChange };
}
