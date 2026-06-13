import { apiRequest, options } from '../../helpers';

export const fetchAncestryRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/ancestries/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeAncestryRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/ancestries/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const copyAncestryRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/ancestries/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}
