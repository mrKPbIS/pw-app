import { API_BASE_URL } from "./constants";

export async function get(route, auth?, params?) {
  return makeRequest(route, "GET", auth, null, params);
}

export async function post(route, auth?, body?) {
  return makeRequest(route, "POST", auth, body);
}

export async function makeRequest(
  route,
  method,
  auth?,
  body?,
  params?: Array<[string, string]>,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  const url = new URL(API_BASE_URL + "/api/" + route);
  headers.append("ngrok-skip-browser-warning", "true");
  if (auth) {
    headers.append("Authorization", `Bearer ${auth}`);
  }
  if (params && params.length) {
    for (const it of params) {
      url.searchParams.append(...it);
    }
  }
  const request = new Request(url, {
    method,
    headers,
    body,
  });
  try {
    return await fetch(request);
  } catch (err) {
    throw err;
  }
}
