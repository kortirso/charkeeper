import { apiRequest, options } from '../helpers';

export const fetchUserNotificationsRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/users/notifications.json',
    options: options('GET', accessToken)
  });
}
