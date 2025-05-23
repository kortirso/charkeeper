import { createSignal, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Checkbox } from '../../../atoms';

import { useAppLocale } from '../../../../context';

export const Dnd5Professions = (props) => {
  const character = () => props.character;

  // changeable data
  const [languagesData, setLanguagesData] = createSignal(character().languages);
  const [toolsData, setToolsData] = createSignal(character().tools);
  const [musicData, setMusicData] = createSignal(character().music);

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

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
            <For each={props.items.filter((item) => item.kind === 'light weapon').sort((a, b) => a.name > b.name)}>
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
            <For each={props.items.filter((item) => item.kind === 'martial weapon').sort((a, b) => a.name > b.name)}>
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
        <For each={props.items.filter((item) => item.kind === 'tools').sort((a, b) => a.name > b.name)}>
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
        <For each={props.items.filter((item) => item.kind === 'music').sort((a, b) => a.name > b.name)}>
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
