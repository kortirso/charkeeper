import { apiRequest, options } from '../helpers';

export const fetchSpellsRequest = async (accessToken, provider, payload) => {
  let url = `/frontend/${provider}/spells.json`;
  if (payload !== undefined) {
    const urlParams = new URLSearchParams(payload);
    url = `${url}?${urlParams}`;
  }

  return await apiRequest({
    url: url,
    options: options('GET', accessToken)
  });
}
