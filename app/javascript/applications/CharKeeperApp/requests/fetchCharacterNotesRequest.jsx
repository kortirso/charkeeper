import { apiRequest, options } from '../helpers';

export const fetchCharacterNotesRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/characters/${id}/notes.json`,
    options: options('GET', accessToken)
  });
}
