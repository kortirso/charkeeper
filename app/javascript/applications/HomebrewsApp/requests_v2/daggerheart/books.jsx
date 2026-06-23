import { apiRequest, options } from '../../helpers';

export const fetchBookRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/books/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeBookRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/books/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
