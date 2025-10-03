import { apiRequest, options } from '../helpers';

export const updateUserBookRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/users/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}
