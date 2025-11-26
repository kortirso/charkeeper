import { apiRequest, options } from '../helpers';

export const changeDaggerheartSpeciality = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/specialities/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
