import { apiRequest } from '../helpers';

export const fetchRulesRequest = async (accessToken) => {
  return await apiRequest({
    url: '/api/v1/rules.json',
    options: {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
  });
}
