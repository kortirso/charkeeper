import { apiBlobRequest } from '../helpers';

export const fetchCharacterViewRequest = async (accessToken, id) => {
  return await apiBlobRequest({
    url: `/characters/${id}.pdf`,
    options: {
      method: 'GET'
    }
  });
}
