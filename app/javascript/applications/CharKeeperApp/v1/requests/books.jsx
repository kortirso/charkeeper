import { apiRequest, options } from '../helpers';

export const fetchBooksRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/homebrews/books.json',
    options: options('GET', accessToken)
  });
}

export const toggleBooksRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/homebrews/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}
