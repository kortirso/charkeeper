import { apiRequest, options } from '../helpers';

export const findCharacterFormulaRequest = async (accessToken, provider, characterId, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/formulas/find_by_item.json?item_id=${id}`,
    options: options('GET', accessToken)
  });
}
