import { apiRequest, options } from '../../helpers';

export const fetchBooksRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/books.json`,
    options: options('GET', accessToken)
  });
}
