import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, Dnd5Notes
} from '../../../components';

import { useAppLocale } from '../../../context';

export const Daggerheart = (props) => {
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
              id={props.character.id}
              initialTraits={props.character.traits}
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
