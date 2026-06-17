import { apiRequest, options } from '../../helpers';

export const fetchCommunityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/communities/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeCommunityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/communities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}

export const copyCommunityRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/communities/${id}/copy.json`,
    options: options('POST', accessToken)
  });
}
