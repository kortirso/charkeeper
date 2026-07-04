import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest } from '../../../requests_v2/list';
import { fetchBackgroundRequest, removeBackgroundRequest, copyBackgroundRequest } from '../../../requests_v2/dnd2024/backgrounds';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    selectedAbilities: 'Abilities to boost',
    selectedSkills: 'Skill expertise',
    feats: 'Feat'
  },
  ru: {
    selectedAbilities: 'Характеристики для повышения',
    selectedSkills: 'Владение навыками',
    feats: 'Черта'
  },
  es: {
    selectedAbilities: 'Habilidades para mejorar',
    selectedSkills: 'Maestría en habilidades',
    feats: 'Proesa'
  }
}

export const Dnd2024Backgrounds = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Dnd2024::Homebrews::Background');

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>{localize(TRANSLATION, locale()).selectedAbilities} - {props.info.ability_boosts.map((item) => config.abilities[item].name[locale()]).join(', ')}</p>
      <p>{localize(TRANSLATION, locale()).selectedSkills} - {Object.keys(props.info.selected_skills).map((item) => config.skills[item].name[locale()]).join(', ')}</p>
      <p>{localize(TRANSLATION, locale()).feats} - {props.info.selected_feat}</p>
    </div>
  );

  return (
    <SharedContent
      provider="dnd2024"
      parentType="Homebrew"
      publicationType="background"
      onFetchRequest={fetchList}
      onShowRequest={fetchBackgroundRequest}
      onRemoveRequest={removeBackgroundRequest}
      onCopyRequest={copyBackgroundRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
