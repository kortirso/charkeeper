import { apiRequest, options } from '../helpers';

export const fetchCharacterFormulasRequest = async (accessToken, provider, id) => {
  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}/formulas.json`,
    options: options('GET', accessToken)
  });
}
