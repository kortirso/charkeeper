import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, DaggerheartCombat, DaggerheartEquipment, Dnd5Notes
} from '../../../components';

import { useAppLocale } from '../../../context';

export const Daggerheart = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('traits');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <>
      <div id="character-navigation">
        <p
          classList={{ 'active': activeTab() === 'traits' }}
          onClick={() => setActiveTab('traits')}
        >
          {t('character.abilities')}
        </p>
        <p
          classList={{ 'active': activeTab() === 'combat' }}
          onClick={() => setActiveTab('combat')}
        >
          {t('character.combat')}
        </p>
        <p
          classList={{ 'active': activeTab() === 'equipment' }}
          onClick={() => setActiveTab('equipment')}
        >
          {t('character.equipment')}
        </p>
        <p
          classList={{ 'active': activeTab() === 'notes' }}
          onClick={() => setActiveTab('notes')}
        >
          {t('character.notes')}
        </p>
      </div>
      <div class="p-4 flex-1 overflow-y-scroll">
        <Switch>
          <Match when={activeTab() === 'traits'}>
            <DaggerheartTraits
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'combat'}>
            <DaggerheartCombat
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'equipment'}>
            <DaggerheartEquipment
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Dnd5Notes />
          </Match>
        </Switch>
      </div>
    </>
  );
}
