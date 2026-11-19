import { apiRequest, options } from '../helpers';

export const fetchUnreadNotificationsCountRequest = async (accessToken) => {
  return await apiRequest({
    url: '/frontend/users/notifications/unread.json',
    options: options('GET', accessToken)
  });
}
