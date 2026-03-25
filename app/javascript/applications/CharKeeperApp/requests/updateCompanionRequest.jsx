import { apiRequest, formDataOptions, options } from '../helpers';

export const updateCompanionRequest = async (accessToken, provider, characterId, payload, asFormData=false) => {
  const requestOptions = asFormData ? formDataOptions('PATCH', accessToken, payload) : options('PATCH', accessToken, payload);

  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/companions.json`,
    options: requestOptions
  });
}
