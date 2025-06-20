import { apiRequest, options } from '../helpers';

export const removeCharacterNoteRequest = async (accessToken, characterId, id) => {
  return await apiRequest({
    url: `/frontend/characters/${characterId}/notes/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
