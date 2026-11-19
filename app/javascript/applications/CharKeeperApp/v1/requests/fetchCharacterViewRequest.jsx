import { apiBlobRequest } from '../helpers';

export const fetchCharacterViewRequest = async (accessToken, id, locale) => {
  return await apiBlobRequest({
    url: `/${locale}/characters/${id}.pdf`,
    options: {
      method: 'GET'
    }
  });
}
