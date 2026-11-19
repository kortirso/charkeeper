import { apiRequest, options } from '../helpers';

export const createUserFeedbackRequest = async (accessToken, payload) => {
  return await apiRequest({
    url: `/frontend/users/feedbacks.json`,
    options: options('POST', accessToken, payload)
  });
}
