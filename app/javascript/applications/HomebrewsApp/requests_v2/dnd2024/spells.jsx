import { apiRequest, options } from '../../helpers';

export const fetchSpellsRequest = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews_v2/dnd2024/spells.json',
    options: options('GET', accessToken)
  });
}

export const fetchSpellRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/dnd2024/spells/${id}.json`,
    options: options('GET', accessToken)
  });
}
