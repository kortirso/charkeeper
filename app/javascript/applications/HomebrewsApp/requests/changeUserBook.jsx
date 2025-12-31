import { apiRequest, options } from '../helpers';

export const changeUserBook = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/users/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}
