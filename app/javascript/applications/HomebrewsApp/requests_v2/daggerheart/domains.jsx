import { apiRequest, options } from '../../helpers';

export const fetchDomainRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/domains/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeDomainRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/domains/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
