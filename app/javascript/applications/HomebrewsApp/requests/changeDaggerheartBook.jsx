import { apiRequest, options } from '../helpers';

export const changeDaggerheartBook = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/books/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
