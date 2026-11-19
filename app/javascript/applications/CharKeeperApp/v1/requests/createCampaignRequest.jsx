import { apiRequest, options } from '../helpers';

export const createCampaignRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: '/frontend/campaigns.json',
    options: options('POST', accessToken, payload)
  });
}
