import { apiRequest, options } from '../helpers';

export const removeCharacterFormulaRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/formulas/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
