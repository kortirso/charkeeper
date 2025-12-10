import { apiRequest, options } from '../helpers';

export const fetchTalentFeaturesRequest = async (accessToken, provider, id, level) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/talents/features.json?multiclass_level=${level}`,
    options: options('GET', accessToken)
  });
}
