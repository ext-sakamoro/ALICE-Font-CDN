const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── Request / Response types ───────────────────────────────────────────────

export interface CompressRequest {
  font_name: string;
  format: string;
  quality: number;
}

export interface CompressResponse {
  font_name: string;
  format: string;
  quality: number;
  original_size_kb: number;
  compressed_size_kb: number;
  ratio: number;
  download_url: string;
}

export interface SubsetRequest {
  font_name: string;
  characters: string;
  format: string;
}

export interface SubsetResponse {
  font_name: string;
  format: string;
  character_count: number;
  original_glyph_count: number;
  subset_glyph_count: number;
  original_size_kb: number;
  subset_size_kb: number;
  download_url: string;
}

export interface FontCatalogEntry {
  id: string;
  family: string;
  variant: string;
  formats: string[];
  size_kb: number;
  glyph_count: number;
  unicode_ranges: string[];
  license: string;
}

export interface AnalyzeRequest {
  font_name: string;
}

export interface AnalyzeResponse {
  font_name: string;
  glyph_count: number;
  format: string;
  size_kb: number;
  unicode_ranges: string[];
  has_variable_axes: boolean;
  color_palettes: number;
  opentype_features: string[];
}

// ── FontClient ─────────────────────────────────────────────────────────────

export class FontClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async post<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`POST ${path} failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<TRes>;
  }

  private async get<TRes>(path: string): Promise<TRes> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`GET ${path} failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<TRes>;
  }

  /** Compress a font to the specified format at the given quality. */
  compress(req: CompressRequest): Promise<CompressResponse> {
    return this.post<CompressRequest, CompressResponse>(
      "/api/v1/font/compress",
      req,
    );
  }

  /** Generate a Unicode subset of a font. */
  subset(req: SubsetRequest): Promise<SubsetResponse> {
    return this.post<SubsetRequest, SubsetResponse>(
      "/api/v1/font/subset",
      req,
    );
  }

  /** List all fonts available in the CDN catalog. */
  catalog(): Promise<FontCatalogEntry[]> {
    return this.get<FontCatalogEntry[]>("/api/v1/font/catalog");
  }

  /** Analyze a font: glyph count, format, size, OpenType features. */
  analyze(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.post<AnalyzeRequest, AnalyzeResponse>(
      "/api/v1/font/analyze",
      req,
    );
  }
}
