import { apiRequest, options } from '../helpers';

export const createBookItemRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews_v2/books/${id}/items.json`,
    options: options('POST', accessToken, payload)
  });
}
