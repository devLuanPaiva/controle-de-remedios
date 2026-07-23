//! Loopback HTTP listener used to capture Google's OAuth 2.0 (Authorization
//! Code + PKCE) redirect. Google's "Desktop app" OAuth client type only
//! accepts loopback redirect URIs (http://127.0.0.1:<port>), not custom URL
//! schemes, so the frontend opens the system browser pointed at a locally
//! bound port and this module waits for the single incoming redirect.

use std::sync::Mutex;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use tauri::State;

const CALLBACK_TIMEOUT_SECS: u64 = 300;

const CALLBACK_PAGE_HTML: &str = "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>ChegaMed</title></head><body style=\"font-family: sans-serif; text-align: center; padding-top: 4rem;\"><h2>Login concluído</h2><p>Você já pode fechar esta janela e voltar para o ChegaMed.</p></body></html>";

#[derive(Default)]
pub struct GoogleOAuthListenerState(Mutex<Option<tiny_http::Server>>);

#[derive(Serialize, Clone)]
pub struct GoogleOAuthCallback {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
}

#[derive(Deserialize, Default)]
struct CallbackQuery {
    code: Option<String>,
    state: Option<String>,
    error: Option<String>,
}

/// Binds an ephemeral loopback port and returns it. The bound listener is
/// kept in managed state until `google_oauth_wait_for_callback` consumes it.
#[tauri::command]
pub fn google_oauth_start_listener(state: State<GoogleOAuthListenerState>) -> Result<u16, String> {
    let server = tiny_http::Server::http("127.0.0.1:0").map_err(|err| err.to_string())?;

    let port = server
        .server_addr()
        .to_ip()
        .ok_or_else(|| "Não foi possível determinar a porta do listener local".to_string())?
        .port();

    let mut guard = state
        .0
        .lock()
        .map_err(|_| "Listener em estado inconsistente".to_string())?;
    *guard = Some(server);

    Ok(port)
}

/// Blocks (off the async executor) until Google redirects back to the
/// loopback listener, then replies with a small confirmation page and
/// returns the parsed `code`/`state`/`error` query parameters.
#[tauri::command]
pub async fn google_oauth_wait_for_callback(
    state: State<'_, GoogleOAuthListenerState>,
) -> Result<GoogleOAuthCallback, String> {
    let server = state
        .0
        .lock()
        .map_err(|_| "Listener em estado inconsistente".to_string())?
        .take()
        .ok_or_else(|| "O listener de login com Google não foi iniciado".to_string())?;

    let received = tauri::async_runtime::spawn_blocking(move || {
        server
            .recv_timeout(Duration::from_secs(CALLBACK_TIMEOUT_SECS))
            .map_err(|err| err.to_string())
    })
    .await
    .map_err(|err| err.to_string())??;

    let request = received.ok_or_else(|| "Tempo esgotado aguardando o retorno do Google".to_string())?;

    let query = parse_query(request.url());

    let response = tiny_http::Response::from_string(CALLBACK_PAGE_HTML).with_header(
        "Content-Type: text/html; charset=utf-8"
            .parse::<tiny_http::Header>()
            .expect("static header is valid"),
    );
    let _ = request.respond(response);

    Ok(GoogleOAuthCallback {
        code: query.code,
        state: query.state,
        error: query.error,
    })
}

fn parse_query(url: &str) -> CallbackQuery {
    match url.split_once('?') {
        Some((_, query)) => serde_urlencoded::from_str(query).unwrap_or_default(),
        None => CallbackQuery::default(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_code_and_state_from_a_successful_callback() {
        let query = parse_query("/?code=auth-code&state=xyz");

        assert_eq!(query.code, Some("auth-code".to_string()));
        assert_eq!(query.state, Some("xyz".to_string()));
        assert_eq!(query.error, None);
    }

    #[test]
    fn parses_the_error_param_when_the_user_denies_consent() {
        let query = parse_query("/?error=access_denied&state=xyz");

        assert_eq!(query.error, Some("access_denied".to_string()));
        assert_eq!(query.code, None);
    }

    #[test]
    fn percent_decodes_query_values() {
        let query = parse_query("/?code=auth%2Fcode&state=a%20b");

        assert_eq!(query.code, Some("auth/code".to_string()));
        assert_eq!(query.state, Some("a b".to_string()));
    }

    #[test]
    fn returns_all_none_when_there_is_no_query_string() {
        let query = parse_query("/");

        assert_eq!(query.code, None);
        assert_eq!(query.state, None);
        assert_eq!(query.error, None);
    }
}
