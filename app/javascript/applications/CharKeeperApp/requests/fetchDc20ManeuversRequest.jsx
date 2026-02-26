import { apiRequest, options } from '../helpers';

export const fetchDc20ManeuversRequest = async (accessToken) => {
  return await apiRequest({
    url: `/frontend/dc20/maneuvers.json`,
    options: options('GET', accessToken)
  });
}
