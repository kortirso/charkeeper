import { createSignal, createEffect, For, Show, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Toggle, Checkbox, GuideWrapper, Languages } from '../../../../components';
import config from '../../../../data/dnd2024.json';
import { useAppLocale, useAppState } from '../../../../context';
import { fetchItemsRequest } from '../../../../requests/fetchItemsRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    weaponMastery: 'Weapon mastery'
  },
  ru: {
    weaponMastery: 'Оружейное мастерство'
  }
}

export const Dnd5Professions = (props) => {
  const character = () => props.character;
  const feats = () => config.feats;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [items, setItems] = createSignal(undefined);
  const [toolsData, setToolsData] = createSignal(character().tools);
  const [musicData, setMusicData] = createSignal(character().music);

  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, character().provider);

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        setItems(itemsData.items.sort((a, b) => a.name > b.name));
      }
    );

    batch(() => {
      setToolsData(character().tools);
      setMusicData(character().music);
      setLastActiveCharacterId(character().id);
    })
  });

  const toggleFeat = async (slug) => {
    const newValue = character().selected_feats.includes(slug) ? character().selected_feats.filter((item) => item !== slug) : character().selected_feats.concat(slug);
    await props.onReloadCharacter({ selected_feats: newValue });
  }

  const toggleTool = async (slug) => {
    const newValue = toolsData().includes(slug) ? toolsData().filter((item) => item !== slug) : toolsData().concat(slug);
    const result = await props.onRefreshCharacter({ tools: newValue });
    if (result.errors_list === undefined) setToolsData(newValue);
  }

  const toggleMusic = async (slug) => {
    const newValue = musicData().includes(slug) ? musicData().filter((item) => item !== slug) : musicData().concat(slug);
    const result = await props.onRefreshCharacter({ music: newValue });
    if (result.errors_list === undefined) setMusicData(newValue);
  }

  const toggleWeaponCoreSkill = async (slug) => {
    const newValue = character().weapon_core_skills.includes(slug) ? character().weapon_core_skills.filter((item) => item !== slug) : character().weapon_core_skills.concat(slug);
    await props.onReloadCharacter({ weapon_core_skills: newValue });
  }

  const toggleArmorCoreSkill = async (slug) => {
    const newValue = character().armor_proficiency.includes(slug) ? character().armor_proficiency.filter((item) => item !== slug) : character().armor_proficiency.concat(slug);
    await props.onReloadCharacter({ armor_proficiency: newValue });
  }

  const toggleWeaponSkill = async (slug) => {
    const newValue = character().weapon_skills.includes(slug) ? character().weapon_skills.filter((item) => item !== slug) : character().weapon_skills.concat(slug);
    await props.onReloadCharacter({ weapon_skills: newValue });
  }

  const toggleWeaponMastery = async (slug) => {
    const newValue = character().weapon_mastery.includes(slug) ? character().weapon_mastery.filter((item) => item !== slug) : character().weapon_mastery.concat(slug);
    await props.onReloadCharacter({ weapon_mastery: newValue });
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Dnd5Professions' }}>
      <GuideWrapper character={character()}>
        <Show when={character().provider === 'dnd2024'}>
          <Toggle title={t('professionsPage.fightingFeats')}>
            <For each={Object.entries(feats().fighting)}>
              {([slug, values]) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={values.name[locale()]}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={character().selected_feats.includes(slug)}
                    onToggle={() => toggleFeat(slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
        </Show>
        <Languages character={character()} defaults={config.languages} />
        <Show when={character().provider === 'dnd2024'}>
          <Toggle title={localize(TRANSLATION, locale())['weaponMastery']}>
            <For each={Object.entries(config.weaponMasteries)}>
              {([slug, names]) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={names.name[locale()]}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={character().weapon_mastery.includes(slug)}
                    onToggle={() => toggleWeaponMastery(slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
        </Show>
        <Show when={items() !== undefined}>
          <Toggle title={t('professionsPage.weaponCoreSkill')}>
            <For each={Object.entries(dict().dnd.coreWeaponSkills)}>
              {([slug, skill]) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={skill}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={character().weapon_core_skills.includes(slug)}
                    onToggle={() => toggleWeaponCoreSkill(slug)}
                  />
                </div>
              }
            </For>
            <For each={Object.entries(dict().dnd.coreArmorSkills)}>
              {([slug, skill]) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={skill}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={character().armor_proficiency.includes(slug)}
                    onToggle={() => toggleArmorCoreSkill(slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
          <Toggle title={t('professionsPage.weaponSkills')}>
            <div class="flex">
              <div class="w-1/2">
                <p class="mb-2">{t('professionsPage.lightWeaponSkills')}</p>
                <For each={items().filter((item) => item.info.weapon_skill === 'light').sort((a, b) => a.name > b.name)}>
                  {(weapon) =>
                    <div class="mb-1">
                      <Checkbox
                        labelText={weapon.name}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={character().weapon_skills.includes(weapon.slug)}
                        onToggle={() => toggleWeaponSkill(weapon.slug)}
                      />
                    </div>
                  }
                </For>
              </div>
              <div class="w-1/2">
                <p class="mb-2">{t('professionsPage.martialWeaponSkills')}</p>
                <For each={items().filter((item) => item.info.weapon_skill === 'martial').sort((a, b) => a.name > b.name)}>
                  {(weapon) =>
                    <div class="mb-1">
                      <Checkbox
                        labelText={weapon.name}
                        labelPosition="right"
                        labelClassList="text-sm ml-4"
                        checked={character().weapon_skills.includes(weapon.slug)}
                        onToggle={() => toggleWeaponSkill(weapon.slug)}
                      />
                    </div>
                  }
                </For>
              </div>
            </div>
          </Toggle>
          <Toggle title={t('professionsPage.tools')}>
            <For each={items().filter((item) => item.kind === 'tools').sort((a, b) => a.name > b.name)}>
              {(tool) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={tool.name}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={toolsData().includes(tool.slug)}
                    onToggle={() => toggleTool(tool.slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
          <Toggle title={t('professionsPage.music')}>
            <For each={items().filter((item) => item.kind === 'music').sort((a, b) => a.name > b.name)}>
              {(music) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={music.name}
                    labelPosition="right"
                    labelClassList="text-sm ml-4"
                    checked={musicData().includes(music.slug)}
                    onToggle={() => toggleMusic(music.slug)}
                  />
                </div>
              }
            </For>
          </Toggle>
        </Show>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
