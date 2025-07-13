import { createSignal, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import {
  DaggerheartTraits, DaggerheartStatic, DaggerheartHealth, DaggerheartCombat, DaggerheartBeastform, DaggerheartCompanion,
  DaggerheartDomainCards, DaggerheartRest, DaggerheartLeveling, DaggerheartExperience, DaggerheartGold, DaggerheartFeats
} from '../../../pages';
import { CharacterNavigation, Equipment, Bonuses, Notes, Avatar, ContentWrapper } from '../../../components';
import { useAppLocale } from '../../../context';

export const Daggerheart = (props) => {
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('traits');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const primaryWeaponFilter = (item) => item.kind.includes('primary weapon');
  const secondaryWeaponFilter = (item) => item.kind.includes('secondary weapon');
  const armorFilter = (item) => item.kind.includes('armor');

  return (
    <ContentWrapper
      mobileView={
        <>
          <CharacterNavigation
            tabsList={['traits', 'combat', 'equipment', 'domainCards', 'companion', 'bonuses', 'rest', 'notes', 'classLevels', 'avatar']}
            activeTab={activeMobileTab()}
            setActiveTab={setActiveMobileTab}
          />
          <div class="p-2 flex-1 overflow-y-scroll">
            <Switch>
              <Match when={activeMobileTab() === 'traits'}>
                <DaggerheartTraits character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                <div class="mt-4">
                  <DaggerheartExperience object={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
                <div class="mt-4">
                  <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
                <div class="mt-4">
                  <DaggerheartFeats character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Match>
              <Match when={activeMobileTab() === 'combat'}>
                <DaggerheartStatic character={character()} />
                <div class="mt-4">
                  <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
                <div class="mt-4">
                  <DaggerheartCombat character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </div>
              </Match>
              <Match when={activeMobileTab() === 'equipment'}>
                <Equipment
                  character={character()}
                  itemFilters={[
                    { title: t('equipment.primaryWeapon'), callback: primaryWeaponFilter },
                    { title: t('equipment.secondaryWeapon'), callback: secondaryWeaponFilter },
                    { title: t('equipment.armorList'), callback: armorFilter }
                  ]}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                >
                  <DaggerheartGold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                </Equipment>
              </Match>
              <Match when={activeMobileTab() === 'domainCards'}>
                <DaggerheartDomainCards
                  character={character()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </Match>
              <Match when={activeMobileTab() === 'companion'}>
                <DaggerheartCompanion character={character()} />
              </Match>
              <Match when={activeMobileTab() === 'bonuses'}>
                <Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
              </Match>
              <Match when={activeMobileTab() === 'rest'}>
                <DaggerheartRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Match>
              <Match when={activeMobileTab() === 'notes'}>
                <Notes />
              </Match>
              <Match when={activeMobileTab() === 'classLevels'}>
                <DaggerheartLeveling character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Match>
              <Match when={activeMobileTab() === 'avatar'}>
                <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Match>
            </Switch>
          </div>
        </>
      }
      leftView={
        <>
          <DaggerheartTraits character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          <div class="mt-4">
            <DaggerheartStatic character={character()} />
          </div>
          <div class="mt-4">
            <DaggerheartExperience object={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
          <div class="mt-4">
            <DaggerheartBeastform character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
          <div class="mt-4">
            <DaggerheartFeats character={character()} onReplaceCharacter={props.onReplaceCharacter} />
          </div>
        </>
      }
      rightView={
        <>
          <CharacterNavigation
            tabsList={['combat', 'equipment', 'domainCards', 'companion', 'bonuses', 'rest', 'notes', 'classLevels', 'avatar']}
            activeTab={activeTab()}
            setActiveTab={setActiveTab}
          />
          <div class="p-2 flex-1 overflow-y-scroll emd:overflow-y-hidden">
            <Switch>
              <Match when={activeTab() === 'combat'}>
                <DaggerheartHealth character={character()} onReplaceCharacter={props.onReplaceCharacter} />
                <div class="mt-4">
                  <DaggerheartCombat character={character()} />
                </div>
              </Match>
              <Match when={activeTab() === 'equipment'}>
                <Equipment
                  character={character()}
                  itemFilters={[
                    { title: t('equipment.primaryWeapon'), callback: primaryWeaponFilter },
                    { title: t('equipment.secondaryWeapon'), callback: secondaryWeaponFilter },
                    { title: t('equipment.armorList'), callback: armorFilter }
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
              <Match when={activeTab() === 'companion'}>
                <DaggerheartCompanion character={character()} />
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
                <DaggerheartLeveling character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Match>
              <Match when={activeTab() === 'avatar'}>
                <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Match>
            </Switch>
          </div>
        </>
      }
    />
  );
}
