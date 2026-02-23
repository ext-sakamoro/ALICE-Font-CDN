//! ALICE Font CDN — Core Engine
//!
//! Axum-based HTTP engine for smart font delivery: compression,
//! Unicode subsetting, catalog management, and font analytics.

use axum::{
    extract::State,
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::{
    net::SocketAddr,
    sync::Arc,
    time::Instant,
};
use tracing::info;
use tracing_subscriber::EnvFilter;

// ── State ──────────────────────────────────────────────────────────────────

#[derive(Clone)]
struct AppState {
    start_time: Instant,
}

// ── Request / Response types ───────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct CompressRequest {
    font_name: String,
    format: String,
    quality: u8,
}

#[derive(Debug, Serialize)]
struct CompressResponse {
    font_name: String,
    format: String,
    quality: u8,
    original_size_kb: f64,
    compressed_size_kb: f64,
    ratio: f64,
    download_url: String,
}

#[derive(Debug, Deserialize)]
struct SubsetRequest {
    font_name: String,
    characters: String,
    format: String,
}

#[derive(Debug, Serialize)]
struct SubsetResponse {
    font_name: String,
    format: String,
    character_count: usize,
    original_glyph_count: usize,
    subset_glyph_count: usize,
    original_size_kb: f64,
    subset_size_kb: f64,
    download_url: String,
}

#[derive(Debug, Serialize)]
struct FontCatalogEntry {
    id: String,
    family: String,
    variant: String,
    formats: Vec<String>,
    size_kb: f64,
    glyph_count: usize,
    unicode_ranges: Vec<String>,
    license: String,
}

#[derive(Debug, Deserialize)]
struct AnalyzeRequest {
    font_name: String,
}

#[derive(Debug, Serialize)]
struct AnalyzeResponse {
    font_name: String,
    glyph_count: usize,
    format: String,
    size_kb: f64,
    unicode_ranges: Vec<String>,
    has_variable_axes: bool,
    color_palettes: usize,
    opentype_features: Vec<String>,
}

#[derive(Debug, Serialize)]
struct HealthResponse {
    status: String,
    uptime_secs: u64,
    version: String,
}

// ── Handlers ───────────────────────────────────────────────────────────────

async fn health(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok".to_string(),
        uptime_secs: state.start_time.elapsed().as_secs(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn compress(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<CompressRequest>,
) -> Result<Json<CompressResponse>, (StatusCode, String)> {
    let valid_formats = ["woff2", "woff", "otf", "ttf"];
    if !valid_formats.contains(&req.format.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            format!(
                "unsupported format '{}'; valid: woff2, woff, otf, ttf",
                req.format
            ),
        ));
    }
    if req.quality > 100 {
        return Err((
            StatusCode::BAD_REQUEST,
            "quality must be 0-100".to_string(),
        ));
    }
    if req.font_name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "font_name is required".to_string()));
    }

    // Simulated sizes based on format and quality
    let original_size_kb = 280.0_f64;
    let ratio_base = match req.format.as_str() {
        "woff2" => 0.35,
        "woff" => 0.55,
        "otf" | "ttf" => 0.90,
        _ => 0.80,
    };
    let quality_factor = 0.5 + (req.quality as f64 / 100.0) * 0.5;
    let compressed_size_kb = original_size_kb * ratio_base * quality_factor;
    let ratio = original_size_kb / compressed_size_kb;

    info!(
        font = %req.font_name,
        format = %req.format,
        quality = req.quality,
        "font compress request"
    );

    Ok(Json(CompressResponse {
        font_name: req.font_name.clone(),
        format: req.format.clone(),
        quality: req.quality,
        original_size_kb,
        compressed_size_kb,
        ratio,
        download_url: format!(
            "/cdn/fonts/{}/{}.{}",
            req.font_name.to_lowercase().replace(' ', "-"),
            req.font_name.to_lowercase().replace(' ', "-"),
            req.format
        ),
    }))
}

async fn subset(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<SubsetRequest>,
) -> Result<Json<SubsetResponse>, (StatusCode, String)> {
    let valid_formats = ["woff2", "woff", "otf", "ttf"];
    if !valid_formats.contains(&req.format.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            format!(
                "unsupported format '{}'; valid: woff2, woff, otf, ttf",
                req.format
            ),
        ));
    }
    if req.font_name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "font_name is required".to_string()));
    }

    let character_count = req.characters.chars().count().max(1);
    let original_glyph_count = 8_500_usize;
    let subset_glyph_count = character_count.min(original_glyph_count);
    let original_size_kb = 280.0_f64;
    let subset_ratio = subset_glyph_count as f64 / original_glyph_count as f64;
    let format_ratio = if req.format == "woff2" { 0.35 } else { 0.55 };
    let subset_size_kb = original_size_kb * subset_ratio * format_ratio;

    info!(
        font = %req.font_name,
        characters = character_count,
        format = %req.format,
        "font subset request"
    );

    Ok(Json(SubsetResponse {
        font_name: req.font_name.clone(),
        format: req.format.clone(),
        character_count,
        original_glyph_count,
        subset_glyph_count,
        original_size_kb,
        subset_size_kb,
        download_url: format!(
            "/cdn/fonts/{}/subset.{}",
            req.font_name.to_lowercase().replace(' ', "-"),
            req.format
        ),
    }))
}

async fn catalog(_state: State<Arc<AppState>>) -> Json<Vec<FontCatalogEntry>> {
    Json(vec![
        FontCatalogEntry {
            id: "inter".to_string(),
            family: "Inter".to_string(),
            variant: "Regular".to_string(),
            formats: vec!["woff2".to_string(), "woff".to_string(), "ttf".to_string()],
            size_kb: 94.0,
            glyph_count: 3_990,
            unicode_ranges: vec!["U+0000-00FF".to_string(), "U+0100-024F".to_string()],
            license: "OFL-1.1".to_string(),
        },
        FontCatalogEntry {
            id: "noto-sans-jp".to_string(),
            family: "Noto Sans JP".to_string(),
            variant: "Regular".to_string(),
            formats: vec!["woff2".to_string(), "otf".to_string()],
            size_kb: 4_200.0,
            glyph_count: 22_080,
            unicode_ranges: vec!["U+0020-007E".to_string(), "U+3000-9FFF".to_string()],
            license: "OFL-1.1".to_string(),
        },
        FontCatalogEntry {
            id: "roboto".to_string(),
            family: "Roboto".to_string(),
            variant: "Bold".to_string(),
            formats: vec!["woff2".to_string(), "woff".to_string(), "ttf".to_string()],
            size_kb: 68.0,
            glyph_count: 1_294,
            unicode_ranges: vec!["U+0000-00FF".to_string()],
            license: "Apache-2.0".to_string(),
        },
        FontCatalogEntry {
            id: "fira-code".to_string(),
            family: "Fira Code".to_string(),
            variant: "Regular".to_string(),
            formats: vec!["woff2".to_string(), "ttf".to_string()],
            size_kb: 132.0,
            glyph_count: 1_617,
            unicode_ranges: vec!["U+0020-007E".to_string(), "U+FB00-FB06".to_string()],
            license: "OFL-1.1".to_string(),
        },
    ])
}

async fn analyze(
    State(_state): State<Arc<AppState>>,
    Json(req): Json<AnalyzeRequest>,
) -> Result<Json<AnalyzeResponse>, (StatusCode, String)> {
    if req.font_name.trim().is_empty() {
        return Err((StatusCode::BAD_REQUEST, "font_name is required".to_string()));
    }

    // Deterministic mock analysis keyed on font name
    let (glyph_count, format, size_kb, variable, palettes, features) =
        match req.font_name.to_lowercase().as_str() {
            name if name.contains("noto") => (
                22_080,
                "otf",
                4_200.0,
                false,
                0,
                vec!["kern".to_string(), "liga".to_string(), "calt".to_string()],
            ),
            name if name.contains("fira") => (
                1_617,
                "ttf",
                132.0,
                false,
                0,
                vec!["kern".to_string(), "liga".to_string(), "dlig".to_string(), "calt".to_string()],
            ),
            name if name.contains("inter") => (
                3_990,
                "otf",
                94.0,
                true,
                0,
                vec!["kern".to_string(), "ss01".to_string(), "cv01".to_string()],
            ),
            _ => (
                1_200,
                "ttf",
                80.0,
                false,
                0,
                vec!["kern".to_string()],
            ),
        };

    info!(font = %req.font_name, "font analyze request");

    Ok(Json(AnalyzeResponse {
        font_name: req.font_name,
        glyph_count,
        format: format.to_string(),
        size_kb,
        unicode_ranges: vec!["U+0000-00FF".to_string(), "U+0100-024F".to_string()],
        has_variable_axes: variable,
        color_palettes: palettes,
        opentype_features: features,
    }))
}

// ── Main ───────────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| EnvFilter::new("font_engine=info")),
        )
        .init();

    let state = Arc::new(AppState {
        start_time: Instant::now(),
    });

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/v1/font/compress", post(compress))
        .route("/api/v1/font/subset", post(subset))
        .route("/api/v1/font/catalog", get(catalog))
        .route("/api/v1/font/analyze", post(analyze))
        .with_state(state);

    let addr: SocketAddr = std::env::var("FONT_ADDR")
        .unwrap_or_else(|_| "0.0.0.0:8082".to_string())
        .parse()
        .expect("invalid FONT_ADDR");

    info!("ALICE Font Engine listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .expect("failed to bind");
    axum::serve(listener, app).await.expect("server error");
}
