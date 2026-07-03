import { apiRequest, options } from '../helpers';

export const fetchListRequest = async (accessToken, type) => {
  return await apiRequest({
    url: `/homebrews_v2/homebrews.json?type=${type}`,
    options: options('GET', accessToken)
  });
}

export const batchDestroyRequest = async (accessToken, type, ids) => {
  return await apiRequest({
    url: `/homebrews_v2/homebrews/batch_destroy.json?type=${type}`,
    options: options('POST', accessToken, { ids: ids })
  });
}
