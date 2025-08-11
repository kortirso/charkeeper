import { apiRequest, options } from '../helpers';

export const updateCharacterNoteRequest = async (accessToken, id, noteId, payload) => {
  return await apiRequest({
    url: `/frontend/characters/${id}/notes/${noteId}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
