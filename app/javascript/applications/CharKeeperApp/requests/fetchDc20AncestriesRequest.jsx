import { apiRequest, options } from '../helpers';

export const fetchDc20AncestriesRequest = async (accessToken) => {
  return await apiRequest({
    url: `/frontend/dc20/ancestries.json`,
    options: options('GET', accessToken)
  });
}
