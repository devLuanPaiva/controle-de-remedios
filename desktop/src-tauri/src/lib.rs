// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod google_oauth;

use tauri::Emitter;
use tauri_plugin_deep_link::DeepLinkExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(google_oauth::GoogleOAuthListenerState::default())
        .setup(|app| {
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                let _ = handle.emit("deep-link", event.urls());
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            google_oauth::google_oauth_start_listener,
            google_oauth::google_oauth_wait_for_callback
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
