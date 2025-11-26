import { apiRequest, options } from '../helpers';

export const fetchDaggerheartSpecialities = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews/daggerheart/specialities.json',
    options: options('GET', accessToken)
  });
}
