import { apiRequest, options } from '../helpers';

export const createDaggerheartLootRequest = async (accessToken, provider, type, dices) => {
  return await apiRequest({
    url: `/frontend/${provider}/loots.json?type=${type}&dices=${dices}`,
    options: options('POST', accessToken, {})
  });
}
