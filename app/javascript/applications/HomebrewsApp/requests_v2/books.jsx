import { apiRequest, options } from '../helpers';

export const fetchBooksRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/books.json`,
    options: options('GET', accessToken)
  });
}

export const createBookRequest = async (accessToken, provider, payload) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/books.json`,
    options: options('POST', accessToken, payload)
  });
}

export const changeBookRequest = async (accessToken, provider, id, payload) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/books/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}

export const changeUserBook = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/users/books/${id}.json`,
    options: options('PATCH', accessToken)
  });
}

export const fetchBooksForItemsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews_v2/${provider}/books/for_items.json`,
    options: options('GET', accessToken)
  });
}
