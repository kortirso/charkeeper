export const apiRequest = ({ url, options }) =>
  fetch(url, options)
    .then((response) => response.json())
    .then((data) => data)
    .catch(() => { return { errors: ['Внутренняя ошибка сервера, отчет отправлен'] } });

export const options = (method, accessToken, payload) => {
  const result = {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  }
  if (payload !== undefined) result.body = JSON.stringify(payload)

  return result;
}
