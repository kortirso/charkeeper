import { apiRequest, options } from '../helpers';

export const fetchCampaignJoinRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/campaigns/${id}/join.json`,
    options: options('GET', accessToken)
  });
}
