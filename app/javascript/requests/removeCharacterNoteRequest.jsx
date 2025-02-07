import { apiRequest, options } from '../helpers';

export const removeCharacterNoteRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/web_telegram/characters/${characterId}/notes/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
