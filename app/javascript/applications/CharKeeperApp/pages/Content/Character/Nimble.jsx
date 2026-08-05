import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

import {
  NimbleAbilities, NimbleSkills, NimbleBonuses, NimbleInfo, NimbleHealth, NimbleLeveling, NimbleRest, Dc20Conditions,
  NimbleEquipment, NimbleSpells
} from '../../../pages';
import { CharacterNavigation, Notes, Avatar, ContentWrapper, Combat, Feats, createRoll } from '../../../components';
import { useAppLocale } from '../../../context';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    equipmentHelpMessage: 'Here you can select equipment for your character.',
    levelingHelpMessage: 'In the future on this tab you can level up your character.'
  },
  ru: {
    equipmentHelpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.',
    levelingHelpMessage: 'В будущем на этой вкладке вы сможете указывать уровень вашего персонажа.'
  },
  es: {
    equipmentHelpMessage: 'Aquí puedes seleccionar el equipo para tu personaje.',
    levelingHelpMessage: 'En el futuro en esta pestaña podrás subir de nivel a tu personaje.'
  }
}

export const Nimble = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const { Roll, openDC20Test, openNimbleAttack } = createRoll();

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const [locale] = useAppLocale();

  const i18n = createMemo(() => localize(TRANSLATION, locale()));

  const ancestryFilter = (item) => item.origin === 'ancestry';
  const classFilter = (item) => item.origin === 'class';
  const subclassFilter = (item) => item.origin === 'subclass';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'class', callback: classFilter },
      { title: 'subclass', callback: subclassFilter }
    ];
    return result;
  });

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment'];
    if (character().schools && character().schools.length > 0) result.push('spells');
    return result.concat(['classLevels', 'rest', 'bonuses', 'notes', 'avatar']);
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <NimbleInfo character={character()} />
              <div class="mt-4">
                <NimbleAbilities
                  character={character()}
                  openD20Test={openDC20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
              <div class="mt-4">
                <Dc20Conditions character={character()} onReloadCharacter={props.onReloadCharacter} />
              </div>
              <div class="mt-4">
                <NimbleSkills
                  character={character()}
                  openD20Test={openDC20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                  onNextGuideStepClick={() => setActiveMobileTab('equipment')}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <NimbleHealth character={character()} openD20Test={openDC20Test} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat character={character()} openD20Test={openNimbleAttack} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <NimbleEquipment
                character={character()}
                upgrades={['weapon', 'armor', 'shield', 'item']}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={i18n().equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
            </Match>
            <Match when={activeMobileTab() === 'spells'}>
              <NimbleSpells
                character={character()}
                openNimbleAttack={openNimbleAttack}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <NimbleLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                helpMessage={i18n().levelingHelpMessage}
              />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <NimbleRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    )
  });

  const leftView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <NimbleInfo character={character()} />
        <div class="mt-4">
          <NimbleAbilities
            character={character()}
            openD20Test={openDC20Test}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
          />
        </div>
        <div class="mt-4">
          <Dc20Conditions character={character()} onReloadCharacter={props.onReloadCharacter} />
        </div>
        <div class="mt-4">
          <NimbleSkills
            character={character()}
            openD20Test={openDC20Test}
            onReplaceCharacter={props.onReplaceCharacter}
            onReloadCharacter={props.onReloadCharacter}
            onNextGuideStepClick={() => setActiveTab('equipment')}
          />
        </div>
      </>
    );
  });

  const rightView = createMemo(() => {
    if (size.width <= 1151) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={characterTabs()}
          activeTab={activeTab()}
          setActiveTab={setActiveTab}
          currentGuideStep={character().guide_step}
          markedTabs={{ '3': 'equipment', '4': 'classLevels' }}
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <NimbleHealth character={character()} openD20Test={openDC20Test} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Combat character={character()} openD20Test={openNimbleAttack} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <NimbleEquipment
                character={character()}
                upgrades={['weapon', 'armor', 'shield', 'item']}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                guideStep={3}
                helpMessage={i18n().equipmentHelpMessage}
                onNextGuideStepClick={() => setActiveMobileTab('classLevels')}
              />
            </Match>
            <Match when={activeTab() === 'spells'}>
              <NimbleSpells
                character={character()}
                openNimbleAttack={openNimbleAttack}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <NimbleLeveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
                helpMessage={i18n().levelingHelpMessage}
              />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <NimbleRest character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <NimbleBonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'avatar'}>
              <Avatar character={character()} onReplaceCharacter={props.onReplaceCharacter} />
            </Match>
          </Switch>
        </div>
      </>
    );
  });

  return (
    <>
      <ContentWrapper mobileView={mobileView()} leftView={leftView()} rightView={rightView()} />
      <Roll provider="nimble" characterId={character().id} />
    </>
  );
}
