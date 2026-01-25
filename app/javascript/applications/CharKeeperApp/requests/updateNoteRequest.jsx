import { apiRequest, options } from '../helpers';

export const updateNoteRequest = async (accessToken, type, noteableId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${type}/${noteableId}/notes/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
