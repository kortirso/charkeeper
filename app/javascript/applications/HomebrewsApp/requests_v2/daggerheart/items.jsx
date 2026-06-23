import { apiRequest, options } from '../../helpers';

export const fetchItemRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/items/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeItemRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/items/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const copyItemRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/items/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}
