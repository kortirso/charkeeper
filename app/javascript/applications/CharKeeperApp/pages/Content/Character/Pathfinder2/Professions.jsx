import { createSignal, createEffect, For, batch } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { ErrorWrapper, Toggle, Levelbox, Button, TextArea } from '../../../../components';
import config from '../../../../data/pathfinder2.json';
import { useAppLocale, useAppState, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';

export const Pathfinder2Professions = (props) => {
  const character = () => props.character;

  // changeable data
  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [languagesData, setLanguagesData] = createSignal(character().languages);

  const [appState] = useAppState();
  const [{ renderAlerts, renderNotice }] = useAppAlert();
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setLanguagesData(character().languages);
      setLastActiveCharacterId(character().id);
    });
  });

  const updateLanguages = async () => {
    const result = await updateCharacterRequest(
      appState.accessToken,
      character().provider,
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
      character().provider,
      character().id,
      { character: { [skills_name]: newSkillValue }, only_head: true }
    );

    if (result.errors === undefined) props.onReplaceCharacter({ [skills_name]: newSkillValue });
    else renderAlerts(result.errors);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Professions' }}>
      <Toggle title={t('professionsPage.languages')}>
        <TextArea
          rows="2"
          labelText={t('professionsPage.languages')}
          value={languagesData()}
          onChange={(value) => setLanguagesData(value)}
        />
        <Button default textable size="small" classList="mt-2" onClick={updateLanguages}>{t('save')}</Button>
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
                    labelClassList="text-sm ml-4"
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
                    labelClassList="text-sm ml-4"
                    value={character().armor_skills[slug]}
                    onToggle={() => updateSkills('armor_skills', slug)}
                  />
                </div>
              }
            </For>
          </div>
        </div>
      </Toggle>
    </ErrorWrapper>
  );
}
