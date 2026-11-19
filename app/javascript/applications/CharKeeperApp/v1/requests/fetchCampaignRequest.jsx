import { apiRequest, options } from '../helpers';

export const fetchCampaignRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/campaigns/${id}.json`,
    options: options('GET', accessToken)
  });
}
