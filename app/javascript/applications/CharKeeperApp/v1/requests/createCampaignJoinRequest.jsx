import { apiRequest, options } from '../helpers';

export const createCampaignJoinRequest = async (accessToken, id, payload) => {
  return await apiRequest({
    url: `/frontend/campaigns/${id}/join.json`,
    options: options('POST', accessToken, payload)
  });
}
