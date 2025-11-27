import { apiRequest, options } from '../helpers';

export const createDaggerheartBook = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/books.json',
    options: options('POST', accessToken, payload)
  });
}
