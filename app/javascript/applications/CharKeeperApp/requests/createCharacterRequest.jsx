import { apiRequest, formDataOptions } from '../helpers';

export const createCharacterRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters.json`,
    options: formDataOptions('POST', accessToken, payload)
  });
}
