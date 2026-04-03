import { apiRequest, options } from '../helpers';

export const fetchPetFeatsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: `/frontend/${provider}/pet_feats.json`,
    options: options('GET', accessToken)
  });
}
