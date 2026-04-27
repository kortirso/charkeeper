import { createSignal, createMemo, Switch, Match } from 'solid-js';
import { createWindowSize } from '@solid-primitives/resize-observer';

const TRANSLATION = {
  en: {
    simpleM: 'Simple melee weapon',
    martialM: 'Martial melee weapon',
    advancedM: 'Advanced melee weapon',
    simpleR: 'Simple range weapon',
    martialR: 'Martial range weapon',
    unarmored: 'Clothes',
    lightArmor: 'Light armor',
    mediumArmor: 'Medium armor',
    heavyArmor: 'Heavy armor',
    shields: 'Shields'
  },
  ru: {
    simpleM: 'Простое оружие ближнего боя',
    martialM: 'Особое оружие ближнего боя',
    advancedM: 'Экзотическое оружие ближнего боя',
    simpleR: 'Простое дистанционное оружие ',
    martialR: 'Особое дистанционное оружие',
    unarmored: 'Одежда',
    lightArmor: 'Лёгкая броня',
    mediumArmor: 'Средняя броня',
    heavyArmor: 'Тяжёлая броня',
    shields: 'Щиты'
  },
  es: {
    simpleM: 'Arma cuerpo a cuerpo simple',
    martialM: 'Arma cuerpo a cuerpo marcial',
    advancedM: 'Arma cuerpo a cuerpo avanzada',
    simpleR: 'Arma a distancia simple',
    martialR: 'Arma a distancia marcial',
    unarmored: 'Ropa',
    lightArmor: 'Armadura ligera',
    mediumArmor: 'Armadura media',
    heavyArmor: 'Armadura pesada',
    shields: 'Escudos'
  }
}

import {
  Pathfinder2Abilities, Pathfinder2Health, Pathfinder2Professions, Pathfinder2Static, Pathfinder2Skills, Pathfinder2Companion,
  Pathfinder2SavingThrows, Pathfinder2Leveling, Pathfinder2ArchetypeSpells, Pathfinder2Rest, Pathfinder2Bonuses, Pathfinder2Info,
  Pathfinder2Damages
} from '../../../pages';
import {
  CharacterNavigation, Equipment, Notes, Avatar, ContentWrapper, Conditions, Gold, createRoll, Combat, Feats
} from '../../../components';
import config from '../../../data/pathfinder2.json';
import { useAppLocale } from '../../../context';
import { translate, localize } from '../../../helpers';

export const Pathfinder2 = (props) => {
  const size = createWindowSize();
  const character = () => props.character;

  const [activeMobileTab, setActiveMobileTab] = createSignal('abilities');
  const [activeTab, setActiveTab] = createSignal('combat');

  const { Roll, openD20Test, openD20Attack } = createRoll();
  const [locale] = useAppLocale();

  const simpleMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'simple';
  const martialMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'martial';
  const advancedMFilter = (item) => item.kind === 'weapon' && item.info.type === 'melee' && item.info.weapon_skill === 'advanced';
  const simpleRFilter = (item) => item.kind === 'weapon' && item.info.type === 'range' && item.info.weapon_skill === 'simple';
  const martialRFilter = (item) => item.kind === 'weapon' && item.info.type === 'range' && item.info.weapon_skill === 'martial';
  const unarmoredFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'unarmored';
  const lightFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'light';
  const mediumFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'medium';
  const heavyFilter = (item) => item.kind === 'armor' && item.info.armor_skill === 'heavy';
  const shieldFilter = (item) => item.kind === 'shield';

  const ancestryFilter = (item) => item.origin === 'ancestry' || item.origin === 'static_race' || item.origin === 'static_subrace';
  const classFilter = (item) => item.origin === 'class' || item.origin === 'static_class' || item.origin === 'static_subclass';
  const generalFilter = (item) => item.origin === 'general';
  const skillFilter = (item) => item.origin === 'skill';
  const companionFilter = (item) => item.origin === 'pet' || item.origin === 'familiar';
  const archetypeFilter = (item) => item.origin === 'archetype';

  const featFilters = createMemo(() => {
    const result = [
      { title: 'ancestry', callback: ancestryFilter },
      { title: 'class', callback: classFilter },
      { title: 'general', callback: generalFilter },
      { title: 'skill', callback: skillFilter }
    ];
    if (Object.keys(character().archetypes).length > 0) result.push({ title: 'archetype', callback: archetypeFilter });
    if (character().can_have_pet || character().can_have_familiar) result.push({ title: 'companion', callback: companionFilter });
    return result;
  });

  const configSkills = createMemo(() => {
    const defaultSkills = translate(config.skills, locale());

    return { ...defaultSkills, ...character().lores };
  });

  const characterTabs = createMemo(() => {
    const result = ['combat', 'equipment', 'spells', 'classLevels'];
    if (character().can_have_animal) result.push('animalCompanion');
    if (character().can_have_pet || character().can_have_familiar) result.push('companion');
    return result.concat('professions', 'rest', 'bonuses', 'notes', 'avatar');
  });

  const mobileView = createMemo(() => {
    if (size.width >= 1152) return <></>;

    return (
      <>
        <CharacterNavigation
          tabsList={['abilities'].concat(characterTabs())}
          activeTab={activeMobileTab()}
          setActiveTab={setActiveMobileTab}
        />
        <div class="p-2 pb-16 flex-1 overflow-y-auto">
          <Switch>
            <Match when={activeMobileTab() === 'abilities'}>
              <Pathfinder2Info character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              <div class="mt-4">
                <Pathfinder2Abilities
                  character={character()}
                  openD20Test={openD20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Pathfinder2SavingThrows
                  character={character()}
                  openD20Test={openD20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Pathfinder2Skills
                  character={character()}
                  openD20Test={openD20Test}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Conditions character={character()} />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'combat'}>
              <Pathfinder2Static character={character()} openD20Test={openD20Test} />
              <div class="mt-4">
                <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Pathfinder2Damages character={character()} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openD20Test}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  config={config}
                  skills={configSkills()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeMobileTab() === 'spells'}>
              <Pathfinder2ArchetypeSpells
                character={character()}
                openD20Test={openD20Test}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).simpleM, callback: simpleMFilter },
                  { title: localize(TRANSLATION, locale()).martialM, callback: martialMFilter },
                  { title: localize(TRANSLATION, locale()).advancedM, callback: advancedMFilter },
                  { title: localize(TRANSLATION, locale()).simpleR, callback: simpleRFilter },
                  { title: localize(TRANSLATION, locale()).martialR, callback: martialRFilter },
                  { title: localize(TRANSLATION, locale()).unarmored, callback: unarmoredFilter },
                  { title: localize(TRANSLATION, locale()).lightArmor, callback: lightFilter },
                  { title: localize(TRANSLATION, locale()).mediumArmor, callback: mediumFilter },
                  { title: localize(TRANSLATION, locale()).heavyArmor, callback: heavyFilter },
                  { title: localize(TRANSLATION, locale()).shields, callback: shieldFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeMobileTab() === 'classLevels'}>
              <Pathfinder2Leveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeMobileTab() === 'animalCompanion'}>
              <Pathfinder2Companion
                type="animal"
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                openD20Test={openD20Test}
                openD20Attack={openD20Attack}
              />
            </Match>
            <Match when={activeMobileTab() === 'companion'}>
              <Pathfinder2Companion
                type="pet"
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                openD20Test={openD20Test}
              />
            </Match>
            <Match when={activeMobileTab() === 'rest'}>
              <Pathfinder2Rest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'bonuses'}>
              <Pathfinder2Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeMobileTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeMobileTab() === 'professions'}>
              <Pathfinder2Professions character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
        <Pathfinder2Info character={character()} onReplaceCharacter={props.onReplaceCharacter} />
        <div class="mt-4">
          <Pathfinder2Abilities
            character={character()}
            openD20Test={openD20Test}
            onReplaceCharacter={props.onReplaceCharacter}
          />
        </div>
        <div class="mt-4">
          <Pathfinder2SavingThrows
            character={character()}
            openD20Test={openD20Test}
            onReplaceCharacter={props.onReplaceCharacter}
          />
        </div>
        <div class="mt-4">
          <Pathfinder2Skills
            character={character()}
            openD20Test={openD20Test}
            onReplaceCharacter={props.onReplaceCharacter}
          />
        </div>
        <div class="mt-4">
          <Conditions character={character()} />
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
        />
        <div class="p-2 pb-16 flex-1">
          <Switch>
            <Match when={activeTab() === 'combat'}>
              <Pathfinder2Static character={character()} openD20Test={openD20Test} />
              <div class="mt-4">
                <Pathfinder2Health character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </div>
              <div class="mt-4">
                <Pathfinder2Damages character={character()} />
              </div>
              <div class="mt-4">
                <Combat
                  character={character()}
                  openD20Test={openD20Test}
                  openD20Attack={openD20Attack}
                  onReplaceCharacter={props.onReplaceCharacter}
                />
              </div>
              <div class="mt-4">
                <Feats
                  character={character()}
                  filters={featFilters()}
                  config={config}
                  skills={configSkills()}
                  onReplaceCharacter={props.onReplaceCharacter}
                  onReloadCharacter={props.onReloadCharacter}
                />
              </div>
            </Match>
            <Match when={activeTab() === 'spells'}>
              <Pathfinder2ArchetypeSpells
                character={character()}
                openD20Test={openD20Test}
                onReplaceCharacter={props.onReplaceCharacter}
              />
            </Match>
            <Match when={activeTab() === 'equipment'}>
              <Equipment
                withWeight
                withPrice
                character={character()}
                itemFilters={[
                  { title: localize(TRANSLATION, locale()).simpleM, callback: simpleMFilter },
                  { title: localize(TRANSLATION, locale()).martialM, callback: martialMFilter },
                  { title: localize(TRANSLATION, locale()).advancedM, callback: advancedMFilter },
                  { title: localize(TRANSLATION, locale()).simpleR, callback: simpleRFilter },
                  { title: localize(TRANSLATION, locale()).martialR, callback: martialRFilter },
                  { title: localize(TRANSLATION, locale()).unarmored, callback: unarmoredFilter },
                  { title: localize(TRANSLATION, locale()).lightArmor, callback: lightFilter },
                  { title: localize(TRANSLATION, locale()).mediumArmor, callback: mediumFilter },
                  { title: localize(TRANSLATION, locale()).heavyArmor, callback: heavyFilter },
                  { title: localize(TRANSLATION, locale()).shields, callback: shieldFilter }
                ]}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              >
                <Gold character={character()} onReplaceCharacter={props.onReplaceCharacter} />
              </Equipment>
            </Match>
            <Match when={activeTab() === 'classLevels'}>
              <Pathfinder2Leveling
                character={character()}
                onReplaceCharacter={props.onReplaceCharacter}
                onReloadCharacter={props.onReloadCharacter}
              />
            </Match>
            <Match when={activeTab() === 'animalCompanion'}>
              <Pathfinder2Companion
                type="animal"
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                openD20Test={openD20Test}
                openD20Attack={openD20Attack}
              />
            </Match>
            <Match when={activeTab() === 'companion'}>
              <Pathfinder2Companion
                type="pet"
                character={character()}
                onReloadCharacter={props.onReloadCharacter}
                openD20Test={openD20Test}
              />
            </Match>
            <Match when={activeTab() === 'rest'}>
              <Pathfinder2Rest character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'bonuses'}>
              <Pathfinder2Bonuses character={character()} onReloadCharacter={props.onReloadCharacter} />
            </Match>
            <Match when={activeTab() === 'notes'}>
              <Notes />
            </Match>
            <Match when={activeTab() === 'professions'}>
              <Pathfinder2Professions character={character()} onReplaceCharacter={props.onReplaceCharacter} />
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
      <Roll provider="pathfinder" characterId={character().id} />
    </>
  );
}
