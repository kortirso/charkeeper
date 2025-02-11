import { apiRequest, options } from '../../../helpers';

export const createCharacterItemRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters/${id}/items.json`,
    options: options('POST', accessToken, payload)
  });
}
