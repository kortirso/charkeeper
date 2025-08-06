import { apiRequest, options } from '../helpers';

export const removeCampaignRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/frontend/campaigns/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
