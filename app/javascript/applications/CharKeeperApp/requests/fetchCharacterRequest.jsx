import { apiRequest, options } from '../helpers';

export const fetchCharacterRequest = async (accessToken, id, payload) => {
  let url = `/frontend/characters/${id}.json`;
  if (payload !== undefined) {
    const urlParams = new URLSearchParams(payload);
    url = `${url}?${urlParams}`;
  }

  return await apiRequest({
    url: url,
    options: options('GET', accessToken)
  });
}
