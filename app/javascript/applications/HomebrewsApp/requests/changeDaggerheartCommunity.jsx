import { apiRequest, options } from '../helpers';

export const changeDaggerheartCommunity = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/homebrews/daggerheart/communities/${id}.json`,
    options: options('PATCH', accessToken, payload)
  });
}
