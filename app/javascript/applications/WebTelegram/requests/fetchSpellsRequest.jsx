import { apiRequest, options } from '../../../helpers';

export const fetchSpellsRequest = async (accessToken, provider, maxLevel) => {
  return await apiRequest({
    url: encodeURI(`/web_telegram/${provider}/spells.json?max_level=${maxLevel}`),
    options: options('GET', accessToken)
  });
}
