import { apiRequest, options } from '../helpers';

export const changeDaggerheartBook = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}
