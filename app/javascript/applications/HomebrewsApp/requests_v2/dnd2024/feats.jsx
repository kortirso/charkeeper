import { apiRequest, options } from '../../helpers';

export const fetchFeatsRequest = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews_v2/dnd2024/feats.json',
    options: options('GET', accessToken)
  });
}

export const fetchFeatRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/feats/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeFeatsRequest = async (accessToken, ids) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/feats/batch_destroy.json`,
    options: options('POST', accessToken, { ids: ids })
  });
}
