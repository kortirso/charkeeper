import { apiRequest, formDataOptions, options } from '../helpers';

export const updateCompanionRequest = async (
  accessToken, provider, characterId, payload, asFormData=false, type='companions'
) => {
  const requestOptions = asFormData ? formDataOptions('PATCH', accessToken, payload) : options('PATCH', accessToken, payload);

  return await apiRequest({
    url: `/frontend/${provider}/characters/${characterId}/${type}.json`,
    options: requestOptions
  });
}
