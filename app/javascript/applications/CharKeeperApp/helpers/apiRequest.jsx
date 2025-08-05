export const apiRequest = ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) url = `https://charkeeper.org${url}`;

  return fetch(url, options)
    .then((response) => response.json())
    .then((data) => data)
    .catch(() => { return { errors: ['Internal server error, an error report has been sent to the developer!'] } });
}

export const apiBlobRequest = ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) url = `https://charkeeper.org${url}`;

  return fetch(url, options)
    .then((response) => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .catch(() => { return { errors: ['Internal server error, an error report has been sent to the developer!'] } });
}

export const options = (method, accessToken, payload) => {
  const result = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }
  if (method !== 'GET' && payload !== undefined) result.body = JSON.stringify(payload)

  return result;
}


