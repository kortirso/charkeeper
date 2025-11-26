import { apiRequest, options } from '../helpers';

export const fetchDaggerheartBooks = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/books.json',
    options: options('GET', accessToken)
  });
}
