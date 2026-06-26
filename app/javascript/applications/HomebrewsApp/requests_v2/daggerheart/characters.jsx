import { apiRequest, options } from '../../helpers';

export const fetchCharactersRequest = async (accessToken) => {
  return await apiRequest({
    url: '/homebrews_v2/daggerheart/characters.json',
    options: options('GET', accessToken)
  });
}

export const fetchCharacterRequest = async (accessToken, id) => {
  return await apiRequest({
    url: `/homebrews_v2/daggerheart/characters/${id}.json`,
    options: options('GET', accessToken)
  });
}
