import { Show } from 'solid-js';

import config from '../../../../CharKeeperApp/data/pathfinder2.json';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchListRequest, fetchHomebrewRequest, fetchHomebrewsRequest, batchDestroyRequest } from '../../../requests_v2/list';
import { fetchBackgroundRequest, removeBackgroundRequest } from '../../../requests_v2/pathfinder2/backgrounds';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    selectedAbilities: 'Abilities to boost',
    selectedSkills: 'Skill expertise',
    feat: 'Feat',
    loreSkill: 'Lore skill',
    freeAbilities: 'Free ability boosts'
  },
  ru: {
    selectedAbilities: 'Характеристики для повышения',
    selectedSkills: 'Владение навыками',
    feat: 'Черта',
    loreSkill: 'Навык знания',
    freeAbilities: 'Универсальные повышения'
  },
  es: {
    selectedAbilities: 'Habilidades para mejorar',
    selectedSkills: 'Maestría en habilidades',
    feat: 'Proesa',
    loreSkill: 'Lore skill',
    freeAbilities: 'Free ability boosts'
  }
}

export const Pathfinder2Backgrounds = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchListRequest(appState.accessToken, 'Pathfinder2::Homebrews::Background');
  const fetchHomebrew = async (id) => await fetchHomebrewRequest(appState.accessToken, 'Pathfinder2::Homebrews::Background', id);
  const fetchHomebrews = async (ids) => await fetchHomebrewsRequest(appState.accessToken, 'Pathfinder2::Homebrews::Background', ids);
  const batchDestroy = async (ids) => await batchDestroyRequest(appState.accessToken, 'Pathfinder2::Homebrews::Background', ids);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <Show when={props.info.ability_boosts.length > 0}>
        <p>{localize(TRANSLATION, locale()).selectedAbilities} - {props.info.ability_boosts.map((item) => config.abilities[item].name[locale()]).join(', ')}</p>
      </Show>
      <p>{localize(TRANSLATION, locale()).freeAbilities} - {props.info.ability_free_boosts}</p>
      <Show when={props.info.skill_boosts.length > 0}>
        <p>{localize(TRANSLATION, locale()).selectedSkills} - {props.info.skill_boosts.join(', ')}</p>
      </Show>
      <Show when={props.info.lore_names.length > 0}>
        <p>{localize(TRANSLATION, locale()).loreSkill} - {props.info.lore_names.join(', ')}</p>
      </Show>
      <Show when={props.info.feat}>
        <p>{localize(TRANSLATION, locale()).feat} - {props.info.feat}</p>
      </Show>
    </div>
  );

  return (
    <SharedContent
      provider="pathfinder2"
      parentType="Homebrew"
      publicationType="background"
      onFetchRequest={fetchList}
      onFetchHomebrew={fetchHomebrew}
      onFetchHomebrews={fetchHomebrews}
      onBatchDestroy={batchDestroy}
      onShowRequest={fetchBackgroundRequest}
      onRemoveRequest={removeBackgroundRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
