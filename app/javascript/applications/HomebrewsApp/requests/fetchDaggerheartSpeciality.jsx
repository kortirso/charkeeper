import { apiRequest, options } from '../helpers';

export const fetchDaggerheartSpeciality = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/specialities/${id}.json`,
    options: options('GET', accessToken)
  });
}
