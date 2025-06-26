import { createSignal, For } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Toggle, Levelbox, Button } from '../../../atoms';

import config from '../../../../data/pathfinder2.json';
import { useAppLocale, useAppState, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const Pathfinder2Professions = (props) => {
  const character = () => props.character;

  // changeable data
  const [languagesData, setLanguagesData] = createSignal(character().languages);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateLanguages = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      'pathfinder2',
      character().id,
      { character: { languages: languagesData() }, only_head: true }
    );

    if (result.errors === undefined) {
      props.onReplaceCharacter({ languages: languagesData() });
      renderNotice(t('alerts.characterIsUpdated'));
    } else renderAlerts(result.errors);
  }

  const updateSkills = async (skills_name, slug) => {
    const newSkillValue = Object.fromEntries(Object.entries(character()[skills_name]).slice().map(([skill, level]) => {
      if (skill !== slug) return [skill, level];

      const newValue = level === 4 ? 0 : (level + 1);
      return [skill, newValue];
    }));

    const result = await updateCharacterRequest(
      appState.accessToken,
      'pathfinder2',
      character().id,
      { character: { [skills_name]: newSkillValue }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [skills_name]: newSkillValue });
    else renderAlerts(result.errors);
  }

  return (
    <>
      <Toggle title={t('professionsPage.languages')}>
        <label class="text-sm/4 font-cascadia-light text-gray-400">{t('professionsPage.languages')}</label>
        <textarea
          rows="2"
          class="w-full border border-gray-200 rounded p-1 text-sm mb-2"
          onInput={(e) => setLanguagesData(e.target.value)}
          value={languagesData()}
        />
        <Button default textable size="small" onClick={updateLanguages}>{t('save')}</Button>
      </Toggle>
      <Toggle title={t('professionsPage.weaponCoreSkill')}>
        <div class="flex">
          <div class="flex-1">
            <For each={Object.entries(config.weaponSkills)}>
              {([slug, skill]) =>
                <div class="mb-1">
                  <Levelbox
                    labelText={skill.name[locale()]}
                    labelPosition="right"
                    labelClassList="text-sm ml-4 font-cascadia-light"
                    value={character().weapon_skills[slug]}
                    onToggle={() => updateSkills('weapon_skills', slug)}
                  />
                </div>
              }
            </For>
          </div>
          <div class="flex-1">
            <For each={Object.entries(config.armorSkills)}>
              {([slug, skill]) =>
                <div class="mb-1">
                  <Levelbox
                    labelText={skill.name[locale()]}
                    labelPosition="right"
                    labelClassList="text-sm ml-4 font-cascadia-light"
                    value={character().armor_skills[slug]}
                    onToggle={() => updateSkills('armor_skills', slug)}
                  />
                </div>
              }
            </For>
          </div>
        </div>
      </Toggle>
    </>
  );
}
