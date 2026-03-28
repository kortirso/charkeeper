import { apiRequest, options } from '../helpers';

export const fetchFeaturesRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/feats.json`,
    options: options('GET', accessToken)
  });
}
