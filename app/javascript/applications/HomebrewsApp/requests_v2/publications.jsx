import { apiRequest, options, formDataOptions } from '../helpers';

export const fetchPublicationsRequest = async (accessToken, type) => {
  return await apiRequest({
    url: `/homebrews_v2/publications.json?type=${type}`,
    options: options('GET', accessToken)
  });
}

export const createPublicationRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews_v2/publications.json',
    options: formDataOptions('POST', accessToken, payload)
  });
}
