import { apiRequest, options } from '../helpers';

export const removeNoteRequest = async (accessToken, type, noteableId, id) => {
  return await apiRequest({
    url: `/frontend/${type}/${noteableId}/notes/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
