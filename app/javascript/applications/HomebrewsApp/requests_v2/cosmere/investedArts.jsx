import { apiRequest, options } from '../../helpers';

export const fetchInvestedArtRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/invested_arts/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeInvestedArtRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/invested_arts/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
