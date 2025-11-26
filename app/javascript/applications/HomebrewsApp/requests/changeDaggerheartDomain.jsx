import { apiRequest, options } from '../helpers';

export const changeDaggerheartDomain = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/domains/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
