import { apiRequest, options } from '../helpers';

export const fetchBackgroundTalentsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/homebrews/${provider}/backgrounds/origin_feats.json`,
    options: options('GET', accessToken)
  });
}
