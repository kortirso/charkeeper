import { apiRequest, options } from '../helpers';

export const sendCampaignItemRequest = async (accessToken, provider, characterId, id, payload) => {
  return await apiRequest({
    url: `/frontend/${provider}/campaigns/${characterId}/items/${id}/send_item.json`,
    options: options('POST', accessToken, payload)
  });
}
