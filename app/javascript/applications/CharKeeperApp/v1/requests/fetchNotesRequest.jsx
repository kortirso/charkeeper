import { apiRequest, options } from '../helpers';

export const fetchNotesRequest = async (accessToken, type, id) => {
  return await apiRequest({
    url: `/frontend/${type}/${id}/notes.json`,
    options: options('GET', accessToken)
  });
}
