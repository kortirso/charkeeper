import { apiRequest, options } from '../helpers';

export const createDaggerheartSpeciality = async (accessToken, payload) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/specialities.json',
    options: options('POST', accessToken, payload)
  });
}
