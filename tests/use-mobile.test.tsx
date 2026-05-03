import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsMobile } from "@shared/hooks/useIsMobile";

describe("useIsMobile", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1200,
    });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia;
  });

  it("retourne false pour une largeur bureau", async () => {
    const { result } = renderHook(() => useIsMobile());
    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });
});
