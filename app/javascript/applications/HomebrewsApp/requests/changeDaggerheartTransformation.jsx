import { apiRequest, options } from '../helpers';

export const changeDaggerheartTransformation = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/transformations/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
