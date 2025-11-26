import { apiRequest, options } from '../helpers';

export const removeDaggerheartSpeciality = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/specialities/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
