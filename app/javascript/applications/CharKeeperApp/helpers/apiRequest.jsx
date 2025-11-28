export const apiRequest = ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) {
    const { platform } = window.__TAURI__.os;
    const platformData = `platform=${platform()}&version=0.3.19`;

    if (url.endsWith('.json')) url = `https://charkeeper.org${url}?${platformData}`;
    else url = `https://charkeeper.org${url}&${platformData}`;
  } else {
    const platformData = `platform=web&version=0.3.19`;

    if (url.endsWith('.json')) url = `${url}?${platformData}`;
    else url = `${url}&${platformData}`;
  }

  return fetch(url, options)
    .then((response) => response.json())
    .then((data) => data)
    .catch(() => { return { errors_list: ['Internal server error, an error report has been sent to the developer!'] } });
}

export const apiBlobRequest = ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) url = `https://charkeeper.org${url}`;

  return fetch(url, options)
    .then((response) => response.blob())
    .then(blob => URL.createObjectURL(blob))
    .catch(() => { return { errors_list: ['Internal server error, an error report has been sent to the developer!'] } });
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


