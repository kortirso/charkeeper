import { apiRequest, options } from '../helpers';

export const removeDaggerheartBook = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/books/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
