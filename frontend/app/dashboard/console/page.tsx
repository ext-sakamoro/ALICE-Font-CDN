"use client";

import { useState } from "react";
import { useFontStore } from "@/lib/hooks/use-store";
import { FontClient } from "@/lib/api/client";

const client = new FontClient();

export default function FontConsolePage() {
  const {
    fontName,
    setFontName,
    characters,
    setCharacters,
    format,
    setFormat,
    result,
    setResult,
    loading,
    setLoading,
  } = useFontStore();

  const [error, setError] = useState<string | null>(null);

  async function handleCompress() {
    if (!fontName.trim()) {
      setError("Please enter a font name.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await client.compress({ font_name: fontName, format, quality: 85 });
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubset() {
    if (!fontName.trim()) {
      setError("Please enter a font name.");
      return;
    }
    if (!characters.trim()) {
      setError("Please enter a character range for subsetting.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await client.subset({
        font_name: fontName,
        characters,
        format,
      });
      setResult(JSON.stringify(res, null, 2));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Subsetting failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-5">
        <h1 className="text-2xl font-bold tracking-tight text-violet-400">
          Font Console
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Compress and subset fonts for optimal delivery
        </p>
      </header>

      <div className="mx-auto max-w-5xl px-8 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Controls */}
          <section className="flex flex-col gap-6">
            {/* Font name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Font Name
              </label>
              <input
                type="text"
                value={fontName}
                onChange={(e) => setFontName(e.target.value)}
                placeholder="e.g. Inter, Noto Sans JP, Fira Code"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Character range */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Character Range{" "}
                <span className="font-normal text-gray-500">
                  (for subsetting)
                </span>
              </label>
              <textarea
                value={characters}
                onChange={(e) => setCharacters(e.target.value)}
                rows={4}
                placeholder="Enter characters directly, e.g.:&#10;ABCDEFGabcdefg0123456789&#10;or Unicode range: U+0020-007E"
                className="w-full resize-none rounded-lg border border-white/15 bg-white/5 p-3 font-mono text-sm text-gray-100 placeholder-gray-600 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Output format selector */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-gray-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              >
                <option value="woff2">WOFF2 — Best compression (recommended)</option>
                <option value="woff">WOFF — Wide compatibility</option>
                <option value="otf">OTF — OpenType</option>
                <option value="ttf">TTF — TrueType</option>
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCompress}
                disabled={loading}
                className="flex-1 rounded-lg bg-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-400 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Compress"}
              </button>
              <button
                onClick={handleSubset}
                disabled={loading}
                className="flex-1 rounded-lg border border-violet-500/50 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Subset"}
              </button>
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </p>
            )}
          </section>

          {/* Result panel */}
          <section>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Result
            </label>
            <div className="min-h-[24rem] rounded-lg border border-white/10 bg-black/40 p-4">
              {result ? (
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-green-300">
                  {result}
                </pre>
              ) : (
                <p className="mt-16 text-center text-sm text-gray-600">
                  Results will appear here after compression or subsetting.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
