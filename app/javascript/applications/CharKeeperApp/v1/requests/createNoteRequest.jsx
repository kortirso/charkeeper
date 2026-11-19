import { apiRequest, options } from '../helpers';

export const createNoteRequest = async (accessToken, type, id, payload) => {
  return await apiRequest({
    url: `/frontend/${type}/${id}/notes.json`,
    options: options('POST', accessToken, payload)
  });
}
