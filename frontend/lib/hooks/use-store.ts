"use client";

import { create } from "zustand";

interface FontStore {
  // Font identity
  fontName: string;
  setFontName: (fontName: string) => void;

  // Subsetting
  characters: string;
  setCharacters: (characters: string) => void;

  // Output format
  format: string;
  setFormat: (format: string) => void;

  // Results
  result: string | null;
  setResult: (result: string | null) => void;

  // UI state
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Reset
  reset: () => void;
}

const DEFAULT_FORMAT = "woff2";

export const useFontStore = create<FontStore>((set) => ({
  fontName: "",
  setFontName: (fontName) => set({ fontName }),

  characters: "",
  setCharacters: (characters) => set({ characters }),

  format: DEFAULT_FORMAT,
  setFormat: (format) => set({ format }),

  result: null,
  setResult: (result) => set({ result }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  reset: () =>
    set({
      fontName: "",
      characters: "",
      format: DEFAULT_FORMAT,
      result: null,
      loading: false,
    }),
}));
