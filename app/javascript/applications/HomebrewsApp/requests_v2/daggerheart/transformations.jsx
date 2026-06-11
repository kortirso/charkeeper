import { apiRequest, options } from '../../helpers';

export const fetchTransformationRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/transformations/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeTransformationRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/transformations/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const copyTransformationRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/transformations/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}
