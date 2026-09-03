import { apiRequest, options } from '../../helpers';

export const fetchSettingRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/settings/${id}.json`,
    options: options('GET', accessToken)
  });
}

export const removeSettingRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/cosmere/settings/${id}.json`,
    options: options('DELETE', accessToken)
  });
}
