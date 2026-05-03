"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppError } from "@shared/errors/AppError";
import type { Result } from "@shared/types/Result";
import { toastAppError } from "@shared/utils/toastResult";

type Loading = { status: "loading" };
type Success<T> = { status: "success"; data: T };
type Failure<E extends AppError> = { status: "error"; error: E };

export type ServiceQueryState<T, E extends AppError = AppError> =
  | Loading
  | Success<T>
  | Failure<E>;

type Options<T> = {
  showToastOnError?: boolean;
  /** Appelé après chargement réussi (hors effet React). */
  onSuccess?: (_data: T) => void;
};

/**
 * Charge une donnée via un service Result au montage (refetch disponible).
 */
export function useServiceQuery<T, E extends AppError = AppError>(
  loader: () => Promise<Result<T, E>>,
  options?: Options<T>,
): {
  state: ServiceQueryState<T, E>;
  refetch: () => Promise<void>;
} {
  const showToast = options?.showToastOnError ?? true;
  const onSuccess = options?.onSuccess;
  const loaderRef = useRef(loader);
  const onSuccessRef = useRef(onSuccess);

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  const [state, setState] = useState<ServiceQueryState<T, E>>({
    status: "loading",
  });

  const refetch = useCallback(async () => {
    setState({ status: "loading" });
    const result = await loaderRef.current();
    if (!result.success) {
      setState({ status: "error", error: result.error });
      if (showToast) toastAppError(result.error);
      return;
    }
    setState({ status: "success", data: result.data });
    onSuccessRef.current?.(result.data);
  }, [showToast]);

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- chargement initial du hook useServiceQuery */
    void refetch();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [refetch]);

  return { state, refetch };
}
