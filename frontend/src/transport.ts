import { API_BASE_URL } from "./constants";

export async function get(route, auth?) {
  return makeRequest(route, "GET", auth);
}

export async function post(route, auth?, body?) {
  return makeRequest(route, "POST", auth, body);
}

export async function makeRequest(route, method, auth?, body?) {
  const headers = new Headers({ "Content-Type": "application/json" });
  headers.append("ngrok-skip-browser-warning", "true");
  if (auth) {
    headers.append("Authorization", `Bearer ${auth}`);
  }
  const request = new Request(API_BASE_URL + "/" + route, {
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
