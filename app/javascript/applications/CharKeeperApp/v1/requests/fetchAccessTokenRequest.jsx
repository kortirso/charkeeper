import { apiRequest } from '../helpers';

export const fetchAccessTokenRequest = async (checkString, hash) => {
  return await apiRequest({
    url: '/frontend/auth.json',
    options: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ check_string: checkString, hash: hash })
    }
  });
}
