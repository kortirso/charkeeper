import { readFromCache } from '../helpers';

const CHARKEEPER_HOST_CACHE_NAME = 'CharKeeperHost';

export const apiRequest = async ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) {
    const { platform } = window.__TAURI__.os;
    const platformData = `platform=${platform()}&version=0.4.7`;

    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    const base_host = cacheValue === null || cacheValue === undefined ? 'charkeeper.org' : cacheValue;

    if (url.endsWith('.json')) url = `https://${base_host}${url}?${platformData}`;
    else url = `https://${base_host}${url}&${platformData}`;
  } else {
    const platformData = `platform=web&version=0.4.7`;

    if (url.endsWith('.json')) url = `${url}?${platformData}`;
    else url = `${url}&${platformData}`;
  }

  return fetch(url, options)
    .then((response) => response.json())
    .then((data) => data)
    .catch(() => { return { errors_list: ['Internal server error, an error report has been sent to the developer!'] } });
}

export const apiBlobRequest = async ({ url, options }) => {
  if (window.__TAURI_INTERNALS__) {
    const cacheValue = await readFromCache(CHARKEEPER_HOST_CACHE_NAME);
    const base_host = cacheValue === null || cacheValue === undefined ? 'charkeeper.org' : cacheValue;

    url = `https://${base_host}${url}`;
  }

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

export const formDataOptions = (method, accessToken, payload) => {
  return { method: method, body: payload, headers: { 'Authorization': `Bearer ${accessToken}` } };
}
