import { apiRequest, options } from '../helpers';

export const changeUserUpvote = async (accessToken, id, type) => {
  return await apiRequest({
    url: `/homebrews_v2/users/upvotes/${id}.json?type=${type}`,
    options: options('PATCH', accessToken)
  });
}
