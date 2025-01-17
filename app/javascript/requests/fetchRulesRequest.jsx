import { apiRequest } from '../helpers';

export const fetchRulesRequest = async (accessToken) => {
  return await apiRequest({
    url: '/web_telegram/rules.json',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}
