import { apiRequest, options } from '../helpers';

export const fetchCampaignsRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/campaigns.json',
    options: options('GET', accessToken)
  });
}
