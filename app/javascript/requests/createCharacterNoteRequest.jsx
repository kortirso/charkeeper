import { apiRequest, options } from '../helpers';

export const createCharacterNoteRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/web_telegram/characters/${id}/notes.json`,
    options: options('POST', accessToken, payload)
  });
}
