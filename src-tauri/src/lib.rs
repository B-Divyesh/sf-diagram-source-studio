use base64::Engine;
use serde::Serialize;
use std::path::Path;
use std::time::Duration;

const BILLING_API_BASE: &str = "https://api.sociobot.in/api/v1";

#[derive(Serialize)]
struct FileDocument {
    name: String,
    contents: String,
    binary: bool,
}

#[derive(Serialize)]
struct BillingResponse {
    status: u16,
    body: String,
}

fn billing_url(
    api_base: &str,
    request: &str,
    license: Option<&str>,
) -> Result<reqwest::Url, String> {
    let base = api_base.trim_end_matches('/');
    match request {
        "catalog" if license.is_none() => reqwest::Url::parse(&format!("{base}/products"))
            .map_err(|_| "billing endpoint is invalid".to_string()),
        "verify" => {
            let token = license
                .filter(|value| !value.trim().is_empty() && value.len() <= 4096)
                .ok_or_else(|| "a license token is required".to_string())?;
            let mut url =
                reqwest::Url::parse(&format!("{base}/products/diagram-source-studio/verify"))
                    .map_err(|_| "billing endpoint is invalid".to_string())?;
            url.query_pairs_mut().append_pair("license", token);
            Ok(url)
        }
        _ => Err("unsupported billing request".to_string()),
    }
}

async fn fetch_billing(
    api_base: &str,
    request: &str,
    license: Option<&str>,
) -> Result<BillingResponse, String> {
    let url = billing_url(api_base, request, license)?;
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(10))
        .user_agent("Diagram Source Studio")
        .build()
        .map_err(|_| "billing request could not start".to_string())?;
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|_| "billing request is unavailable".to_string())?;
    let status = response.status().as_u16();
    let body = response
        .text()
        .await
        .map_err(|_| "billing response could not be read".to_string())?;
    Ok(BillingResponse { status, body })
}

// This command deliberately exposes only the public catalog and this
// product's verify endpoint. It never receives diagram source or arbitrary
// URLs, so installed Tauri webviews do not need a broad CORS exception.
#[tauri::command]
async fn billing_request(
    request: String,
    license: Option<String>,
) -> Result<BillingResponse, String> {
    fetch_billing(BILLING_API_BASE, &request, license.as_deref()).await
}

fn document_from_path(path: &Path) -> Option<FileDocument> {
    let bytes = std::fs::read(path).ok()?;
    let binary = path.extension().is_some_and(|extension| extension == "png");
    let contents = if binary {
        base64::engine::general_purpose::STANDARD.encode(bytes)
    } else {
        String::from_utf8(bytes).ok()?
    };
    Some(FileDocument {
        name: path.file_name()?.to_string_lossy().to_string(),
        contents,
        binary,
    })
}

fn write_text_document(path: &Path, contents: &str) -> bool {
    std::fs::write(path, contents.as_bytes()).is_ok()
}

fn write_binary_document(path: &Path, encoded: &str) -> bool {
    let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(encoded) else {
        return false;
    };
    std::fs::write(path, bytes).is_ok()
}

#[tauri::command]
fn open_document() -> Option<FileDocument> {
    let path = rfd::FileDialog::new()
        .add_filter(
            "Diagram source or export",
            &["mmd", "mermaid", "d2", "svg", "png"],
        )
        .pick_file()?;
    document_from_path(&path)
}

#[tauri::command]
fn save_document(name: String, contents: String) -> bool {
    let extension = name.rsplit('.').next().unwrap_or("txt");
    let Some(path) = rfd::FileDialog::new()
        .set_file_name(&name)
        .add_filter("Document", &[extension])
        .save_file()
    else {
        return false;
    };
    write_text_document(&path, &contents)
}

#[tauri::command]
fn save_binary(name: String, base64: String) -> bool {
    let Some(path) = rfd::FileDialog::new()
        .set_file_name(&name)
        .add_filter("PNG image", &["png"])
        .save_file()
    else {
        return false;
    };
    write_binary_document(&path, &base64)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            open_document,
            save_document,
            save_binary,
            billing_request
        ])
        .run(tauri::generate_context!())
        .expect("error while running Diagram Source Studio");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;
    use std::thread;

    fn one_response_server(
        expected_path: &'static str,
        body: &'static str,
    ) -> (String, thread::JoinHandle<()>) {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let handle = thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut request = [0_u8; 4096];
            let count = stream.read(&mut request).unwrap();
            let request = String::from_utf8_lossy(&request[..count]);
            assert!(request.starts_with(&format!("GET {expected_path} HTTP/1.1")));
            assert!(!request.contains("Diagram source"));
            let response = format!(
                "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
                body.len(),
                body
            );
            stream.write_all(response.as_bytes()).unwrap();
        });
        (format!("http://{address}/api/v1"), handle)
    }

    #[test]
    fn native_file_round_trip_preserves_utf8_bom_and_crlf_bytes() {
        let directory = std::env::temp_dir().join(format!(
            "diagram-source-studio-native-{}",
            std::process::id()
        ));
        std::fs::create_dir_all(&directory).unwrap();
        let source_path = directory.join("native.mmd");
        let source = "\u{feff}flowchart LR\r\n  café[Native ☕] --> saved[Saved]\r\n";
        assert!(write_text_document(&source_path, source));
        let opened = document_from_path(&source_path).expect("native source should open");
        assert!(!opened.binary);
        assert_eq!(opened.name, "native.mmd");
        assert_eq!(opened.contents, source);

        let png_path = directory.join("roundtrip.png");
        let bytes = [137, 80, 78, 71, 13, 10, 26, 10, 0, 255];
        let encoded = base64::engine::general_purpose::STANDARD.encode(bytes);
        assert!(write_binary_document(&png_path, &encoded));
        let png = document_from_path(&png_path).expect("native PNG should open");
        assert!(png.binary);
        assert_eq!(
            base64::engine::general_purpose::STANDARD
                .decode(png.contents)
                .unwrap(),
            bytes
        );
        std::fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn native_billing_bridge_returns_catalog_and_license_verdict_without_cors() {
        let (catalog_base, catalog_server) = one_response_server(
            "/api/v1/products",
            r#"{"data":[{"slug":"diagram-source-studio","price_minor":3900,"currency":"USD"}]}"#,
        );
        let catalog =
            tauri::async_runtime::block_on(fetch_billing(&catalog_base, "catalog", None)).unwrap();
        assert_eq!(catalog.status, 200);
        assert!(catalog.body.contains("diagram-source-studio"));
        catalog_server.join().unwrap();

        let (verify_base, verify_server) = one_response_server(
            "/api/v1/products/diagram-source-studio/verify?license=installed-license",
            r#"{"valid":true,"reason":"ok"}"#,
        );
        let verdict = tauri::async_runtime::block_on(fetch_billing(
            &verify_base,
            "verify",
            Some("installed-license"),
        ))
        .unwrap();
        assert_eq!(verdict.status, 200);
        assert!(verdict.body.contains("\"valid\":true"));
        verify_server.join().unwrap();

        assert!(billing_url(&verify_base, "catalog", Some("unexpected")).is_err());
        assert!(billing_url(&verify_base, "verify", None).is_err());
        assert!(billing_url(&verify_base, "arbitrary", None).is_err());
    }
}
