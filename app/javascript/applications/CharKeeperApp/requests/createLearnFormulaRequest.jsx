import { apiRequest, options } from '../helpers';

export const createLearnFormulaRequest = async (accessToken, provider, characterId, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/formulas.json`,
    options: options('POST', accessToken, payload)
  });
}
