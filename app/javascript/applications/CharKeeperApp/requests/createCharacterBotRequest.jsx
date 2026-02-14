import { apiRequest, options } from '../helpers';

export const createCharacterBotRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/frontend/bots/characters/${id}.json`,
    options: options('POST', accessToken, payload)
  });
}
