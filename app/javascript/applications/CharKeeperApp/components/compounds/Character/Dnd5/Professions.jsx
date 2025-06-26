import { createSignal, createEffect, For, Show } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Checkbox } from '../../../atoms';

import config from '../../../../data/dnd2024.json';
import { useAppLocale, useAppState } from '../../../../context';

import { fetchItemsRequest } from '../../../../requests/fetchItemsRequest';

export const Dnd5Professions = (props) => {
  const character = () => props.character;
  const feats = () => config.feats;

  // changeable data
  const [items, setItems] = createSignal(undefined);
  const [languagesData, setLanguagesData] = createSignal(character().languages);
  const [toolsData, setToolsData] = createSignal(character().tools);
  const [musicData, setMusicData] = createSignal(character().music);

  const [appState] = useAppState();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (items() !== undefined) return;

    const fetchItems = async () => await fetchItemsRequest(appState.accessToken, character().provider);

    Promise.all([fetchItems()]).then(
      ([itemsData]) => {
        setItems(itemsData.items.sort((a, b) => a.name > b.name));
      }
    );
  });

  const toggleFeat = async (slug) => {
    const newValue = character().selected_feats.includes(slug) ? character().selected_feats.filter((item) => item !== slug) : character().selected_feats.concat(slug);
    await props.onReloadCharacter({ selected_feats: newValue });
  }

  const toggleLanguage = async (slug) => {
    const newValue = languagesData().includes(slug) ? languagesData().filter((item) => item !== slug) : languagesData().concat(slug);
    const result = await props.onRefreshCharacter({ languages: newValue });
    if (result.errors === undefined) setLanguagesData(newValue);
  }

  const toggleTool = async (slug) => {
    const newValue = toolsData().includes(slug) ? toolsData().filter((item) => item !== slug) : toolsData().concat(slug);
    const result = await props.onRefreshCharacter({ tools: newValue });
    if (result.errors === undefined) setToolsData(newValue);
  }

  const toggleMusic = async (slug) => {
    const newValue = musicData().includes(slug) ? musicData().filter((item) => item !== slug) : musicData().concat(slug);
    const result = await props.onRefreshCharacter({ music: newValue });
    if (result.errors === undefined) setMusicData(newValue);
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

  return (
    <>
      <Show when={character().provider === 'dnd2024'}>
        <Toggle title={t('professionsPage.feats')}>
          <div class="flex flex-wrap">
            <div class="w-1/2 mb-4">
              <p class="mb-2">{t('professionsPage.originFeats')}</p>
              <For each={Object.entries(feats().origin)}>
                {([slug, values]) =>
                  <div class="mb-1">
                    <Checkbox
                      labelText={values.name[locale()]}
                      labelPosition="right"
                      labelClassList="text-sm ml-4 font-cascadia-light"
                      checked={character().selected_feats.includes(slug)}
                      onToggle={() => toggleFeat(slug)}
                    />
                  </div>
                }
              </For>
            </div>
            <div class="w-1/2 mb-4">
              <p class="mb-2">{t('professionsPage.generalFeats')}</p>
              <For each={Object.entries(feats().general)}>
                {([slug, values]) =>
                  <div class="mb-1">
                    <Checkbox
                      labelText={values.name[locale()]}
                      labelPosition="right"
                      labelClassList="text-sm ml-4 font-cascadia-light"
                      checked={character().selected_feats.includes(slug)}
                      onToggle={() => toggleFeat(slug)}
                    />
                  </div>
                }
              </For>
            </div>
            <div class="w-1/2">
              <p class="mb-2">{t('professionsPage.fightingFeats')}</p>
              <For each={Object.entries(feats().fighting)}>
                {([slug, values]) =>
                  <div class="mb-1">
                    <Checkbox
                      labelText={values.name[locale()]}
                      labelPosition="right"
                      labelClassList="text-sm ml-4 font-cascadia-light"
                      checked={character().selected_feats.includes(slug)}
                      onToggle={() => toggleFeat(slug)}
                    />
                  </div>
                }
              </For>
            </div>
          </div>
        </Toggle>
      </Show>
      <Toggle title={t('professionsPage.languages')}>
        <For each={Object.entries(dict().dnd.languages)}>
          {([slug, language]) =>
            <div class="mb-1">
              <Checkbox
                labelText={language}
                labelPosition="right"
                labelClassList="text-sm ml-4 font-cascadia-light"
                checked={languagesData().includes(slug)}
                onToggle={() => toggleLanguage(slug)}
              />
            </div>
          }
        </For>
      </Toggle>
      <Toggle title={t('professionsPage.weaponCoreSkill')}>
        <For each={Object.entries(dict().dnd.coreWeaponSkills)}>
          {([slug, skill]) =>
            <div class="mb-1">
              <Checkbox
                labelText={skill}
                labelPosition="right"
                labelClassList="text-sm ml-4 font-cascadia-light"
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
                labelClassList="text-sm ml-4 font-cascadia-light"
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
            <For each={items().filter((item) => item.kind === 'light weapon').sort((a, b) => a.name > b.name)}>
              {(weapon) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={weapon.name}
                    labelPosition="right"
                    labelClassList="text-sm ml-4 font-cascadia-light"
                    checked={character().weapon_skills.includes(weapon.slug)}
                    onToggle={() => toggleWeaponSkill(weapon.slug)}
                  />
                </div>
              }
            </For>
          </div>
          <div class="w-1/2">
            <p class="mb-2">{t('professionsPage.martialWeaponSkills')}</p>
            <For each={items().filter((item) => item.kind === 'martial weapon').sort((a, b) => a.name > b.name)}>
              {(weapon) =>
                <div class="mb-1">
                  <Checkbox
                    labelText={weapon.name}
                    labelPosition="right"
                    labelClassList="text-sm ml-4 font-cascadia-light"
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
                labelClassList="text-sm ml-4 font-cascadia-light"
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
                labelClassList="text-sm ml-4 font-cascadia-light"
                checked={musicData().includes(music.slug)}
                onToggle={() => toggleMusic(music.slug)}
              />
            </div>
          }
        </For>
      </Toggle>
    </>
  );
}
