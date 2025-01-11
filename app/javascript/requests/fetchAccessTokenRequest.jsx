import { apiRequest } from '../helpers';

export const fetchAccessTokenRequest = async (checkString, hash) => {
  return await apiRequest({
    url: '/api/v1/auth/web_telegram.json',
    options: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ check_string: checkString, hash: hash })
    }
  });
}
