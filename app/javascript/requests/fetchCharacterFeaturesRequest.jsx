import { apiRequest, options } from '../helpers';

export const fetchCharacterFeaturesRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/web_telegram/${provider}/characters/${id}/features.json`,
    options: options('GET', accessToken)
  });
}
