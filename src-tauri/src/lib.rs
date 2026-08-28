use base64::Engine;
use serde::Serialize;

#[derive(Serialize)]
struct FileDocument {
    name: String,
    contents: String,
    binary: bool,
}

#[tauri::command]
fn open_document() -> Option<FileDocument> {
    let path = rfd::FileDialog::new()
        .add_filter(
            "Diagram source or export",
            &["mmd", "mermaid", "d2", "svg", "png"],
        )
        .pick_file()?;
    let bytes = std::fs::read(&path).ok()?;
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
    std::fs::write(path, contents.as_bytes()).is_ok()
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
    let Ok(bytes) = base64::engine::general_purpose::STANDARD.decode(base64) else {
        return false;
    };
    std::fs::write(path, bytes).is_ok()
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
