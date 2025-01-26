import { apiRequest, options } from '../helpers';

export const fetchSpellsRequest = async (accessToken, provider) => {
  return await apiRequest({
    url: encodeURI(`/web_telegram/${provider}/spells.json`),
    options: options('GET', accessToken)
  });
}
