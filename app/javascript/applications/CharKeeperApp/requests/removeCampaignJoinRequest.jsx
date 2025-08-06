import { apiRequest, options } from '../helpers';

export const removeCampaignJoinRequest = async (accessToken, id, characterId) => {
  return await apiRequest({
    url: `/frontend/campaigns/${id}/join.json?character_id=${characterId}`,
    options: options('DELETE', accessToken)
  });
}
