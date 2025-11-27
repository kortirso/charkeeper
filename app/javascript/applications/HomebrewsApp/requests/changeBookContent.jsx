import { apiRequest, options } from '../helpers';

export const changeBookContent = async (accessToken, id, payload, type) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/books/${id}/content.json?type=${type}`,
    options: options('POST', accessToken, payload)
  });
}
