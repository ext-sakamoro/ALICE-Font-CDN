# ALICE Font CDN

Smart font delivery powered by ALICE-Font. Compress, subset, and analyze
typefaces at the edge — deliver only the glyphs your users need, in the format
their browser demands.

## License

AGPL-3.0

## Architecture

```
Frontend :3000  -->  API Gateway :8080  -->  Font Engine :8082
```

| Layer | Port | Technology |
|-------|------|-----------|
| Frontend | 3000 | Next.js 14, Tailwind CSS, Zustand |
| API Gateway | 8080 | Nginx / custom proxy |
| Font Engine | 8082 | Rust, Axum, Tokio |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/font/compress` | Compress font to woff2/woff/otf/ttf |
| `POST` | `/api/v1/font/subset` | Generate Unicode character subset |
| `GET` | `/api/v1/font/catalog` | List available fonts with metadata |
| `POST` | `/api/v1/font/analyze` | Analyze font: glyphs, format, features |
| `GET` | `/health` | Health check |

### POST /api/v1/font/compress

```json
{
  "font_name": "Inter",
  "format": "woff2",
  "quality": 85
}
```

Response:
```json
{
  "font_name": "Inter",
  "format": "woff2",
  "quality": 85,
  "original_size_kb": 280.0,
  "compressed_size_kb": 98.0,
  "ratio": 2.86,
  "download_url": "/cdn/fonts/inter/inter.woff2"
}
```

### POST /api/v1/font/subset

```json
{
  "font_name": "Noto Sans JP",
  "characters": "ABCDEFabcdef0123456789",
  "format": "woff2"
}
```

Response:
```json
{
  "font_name": "Noto Sans JP",
  "format": "woff2",
  "character_count": 22,
  "original_glyph_count": 22080,
  "subset_glyph_count": 22,
  "original_size_kb": 4200.0,
  "subset_size_kb": 1.47,
  "download_url": "/cdn/fonts/noto-sans-jp/subset.woff2"
}
```

### POST /api/v1/font/analyze

```json
{
  "font_name": "Fira Code"
}
```

Response:
```json
{
  "font_name": "Fira Code",
  "glyph_count": 1617,
  "format": "ttf",
  "size_kb": 132.0,
  "unicode_ranges": ["U+0000-00FF", "U+0100-024F"],
  "has_variable_axes": false,
  "color_palettes": 0,
  "opentype_features": ["kern", "liga", "dlig", "calt"]
}
```

## Getting Started

### Font Engine (Rust)

```bash
cd services/core-engine
cargo build --release
FONT_ADDR=0.0.0.0:8082 ./target/release/font-engine
```

### Frontend (Next.js)

```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

## Features

- **Font Compression** — Convert to WOFF2, WOFF, OTF, TTF with quality control (0-100)
- **Unicode Subsetting** — Serve only the glyphs each page needs; dramatic size reduction for CJK fonts
- **Font Analytics** — Inspect glyph count, OpenType features, variable axes, Unicode ranges

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `FONT_ADDR` | `0.0.0.0:8082` | Font engine bind address |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080` | API gateway URL |

## Catalog

Pre-loaded fonts:

| Family | Glyphs | Best Format | License |
|--------|--------|-------------|---------|
| Inter | 3,990 | woff2 | OFL-1.1 |
| Noto Sans JP | 22,080 | woff2 | OFL-1.1 |
| Roboto Bold | 1,294 | woff2 | Apache-2.0 |
| Fira Code | 1,617 | woff2 | OFL-1.1 |
