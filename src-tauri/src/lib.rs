use base64::Engine;
use serde::Serialize;
use std::path::Path;

#[derive(Serialize)]
struct FileDocument {
    name: String,
    contents: String,
    binary: bool,
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
            save_binary
        ])
        .run(tauri::generate_context!())
        .expect("error while running Diagram Source Studio");
}

#[cfg(test)]
mod tests {
    use super::*;

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
}
