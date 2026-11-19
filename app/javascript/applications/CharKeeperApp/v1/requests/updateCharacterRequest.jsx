import { apiRequest, options, formDataOptions } from '../helpers';

export const updateCharacterRequest = async (accessToken, provider, id, payload, asFormData=false) => {
  const requestOptions = asFormData ? formDataOptions('PATCH', accessToken, payload) : options('PATCH', accessToken, payload);

  return await apiRequest({
    url: `/frontend/${provider}/characters/${id}.json`,
    options: requestOptions
  });
}
