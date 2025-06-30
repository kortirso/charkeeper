import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, DaggerheartCombat, DaggerheartGold, DaggerheartLeveling, DaggerheartDomainCards, DaggerheartRest,
  Notes, Avatar, CharacterNavigation, Bonuses, Equipment
} from '../../../components';
import { useAppLocale } from '../../../context';

export const Daggerheart = (props) => {
  const character = () => props.character;

  const [activeTab, setActiveTab] = createSignal('traits');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const primaryWeaponFilter = (item) => item.kind.includes('primary weapon');
  const secondaryWeaponFilter = (item) => item.kind.includes('secondary weapon');
  const armorFilter = (item) => item.kind.includes('armor');

  return (
    <>
      <CharacterNavigation
        tabsList={['traits', 'combat', 'equipment', 'domainCards', 'bonuses', 'rest', 'notes', 'classLevels', 'avatar']}
        activeTab={activeTab()}
        setActiveTab={setActiveTab}
      />
      <div class="p-2 flex-1 overflow-y-scroll">
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
            <Equipment
              character={character()}
              itemFilters={[
                { title: t('character.primaryWeapon'), callback: primaryWeaponFilter },
                { title: t('character.secondaryWeapon'), callback: secondaryWeaponFilter },
                { title: t('character.armorList'), callback: armorFilter }
              ]}
              onReplaceCharacter={props.onReplaceCharacter}
              onReloadCharacter={props.onReloadCharacter}
            >
              <DaggerheartGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Equipment>
          </Match>
          <Match when={activeTab() === 'domainCards'}>
            <DaggerheartDomainCards
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
              onReloadCharacter={props.onReloadCharacter}
            />
          </Match>
          <Match when={activeTab() === 'bonuses'}>
            <Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
          </Match>
          <Match when={activeTab() === 'rest'}>
            <DaggerheartRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </Match>
          <Match when={activeTab() === 'notes'}>
            <Notes />
          </Match>
          <Match when={activeTab() === 'classLevels'}>
            <DaggerheartLeveling
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
          <Match when={activeTab() === 'avatar'}>
            <Avatar
              character={character()}
              onReplaceCharacter={props.onReplaceCharacter}
            />
          </Match>
        </Switch>
      </div>
    </>
  );
}
