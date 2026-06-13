import { createSignal, createEffect, Show, batch } from 'solid-js';

import { StatsBlock, ErrorWrapper, Input, GuideWrapper, EditWrapper, Dice, Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, PlusSmall } from '../../../../assets';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    check: 'Check',
    sanity: 'Sanity',
    luck: 'Luck',
    speed: 'Speed',
    health: 'Health',
    magic: 'Magic'
  },
  ru: {
    check: 'Check',
    sanity: 'Рассудок',
    luck: 'Удача',
    speed: 'Скорость',
    health: 'Здоровье',
    magic: 'Магия'
  },
  es: {
    check: 'Check',
    sanity: 'Sanity',
    luck: 'Luck',
    speed: 'Speed',
    health: 'Health',
    magic: 'Magic'
  }
}

export const Cthulhu7Combat = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [editMode, setEditMode] = createSignal(false);
  const [resourcesData, setResourcesData] = createSignal({ luck_max: character().luck_max });

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setResourcesData({ luck_max: character().luck_max });
    });

    setLastActiveCharacterId(character().id);
  });

  const cancelEditing = () => {
    batch(() => {
      setResourcesData({ luck_max: character().luck_max });
      setEditMode(false);
    });
  }

  const updateResource = (attribute, value) => {
    if (character()[attribute] === 0 && value === -1) return;
    if (character()[attribute] === character()[`${attribute}_max`] && value === 1) return;

    const payload = { [attribute]: character()[attribute] + value };
    updateCharacter(payload);
  }

  const submit = () => {
    updateCharacter(resourcesData());
    setEditMode(false);
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(
      appState.accessToken, character().provider, character().id, { character: payload, only_head: true }
    );

    if (result.errors_list === undefined) props.onReplaceCharacter({ ...payload });
    else renderAlerts(result.errors_list);
  }

  const renderAttribute = (current, max, slug, withTitle = true) => (
    <div class="flex items-center gap-8">
      <Show when={withTitle}><p class="text-sm/4">{localize(TRANSLATION, locale())[slug]}</p></Show>
      <div class="flex items-center gap-4">
        <Button default size="small" onClick={() => updateResource(slug, -1)}><Minus /></Button>
        <p>{current} / {max}</p>
        <Button default size="small" onClick={() => updateResource(slug, 1)}><PlusSmall /></Button>
      </div>
    </div>
  );

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Cthulhu7Combat' }}>
      <EditWrapper position="right" editMode={editMode()} onSetEditMode={setEditMode} onCancelEditing={cancelEditing} onSaveChanges={submit}>
        <GuideWrapper character={character()}>
          <Show
            when={!editMode()}
            fallback={
              <div class="blockable blockable-padding">
                <div class="cthulhu-abilities-box">
                  <div>
                    <p class="ability-title">{localize(TRANSLATION, locale()).luck}</p>
                      <div class="ability-value-box">
                        <p class="ability-value">
                          <Input
                            value={resourcesData().luck_max}
                            onInput={(value) => setResourcesData({ ...resourcesData(), luck_max: value, luck: value })}
                          />
                        </p>
                      </div>
                  </div>
                </div>
              </div>
            }
          >
            <StatsBlock
              items={[
                {
                  title: localize(TRANSLATION, locale()).sanity,
                  value:
                    <Dice
                      width="40"
                      height="40"
                      text={character().sanity}
                      textClassList="text-2xl"
                      onClick={() => props.openCthulhuTest('/check attr sanity', `${localize(TRANSLATION, locale()).check}, ${localize(TRANSLATION, locale()).sanity}`, character().sanity)}
                    />,
                  footer: renderAttribute(character().sanity, character().sanity_max, 'sanity', false)
                },
                {
                  title: localize(TRANSLATION, locale()).luck,
                  value:
                    <Dice
                      width="40"
                      height="40"
                      text={character().luck}
                      textClassList="text-2xl"
                      onClick={() => props.openCthulhuTest('/check attr luck', `${localize(TRANSLATION, locale()).check}, ${localize(TRANSLATION, locale()).luck}`, character().luck)}
                    />,
                  footer: renderAttribute(character().luck, character().luck_max, 'luck', false)
                },
                { title: localize(TRANSLATION, locale()).speed, value: character().speed }
              ]}
            >
              <div class="p-4 flex flex-col gap-2">
                {renderAttribute(character().health, character().health_max, 'health')}
                {renderAttribute(character().magic, character().magic_max, 'magic')}
              </div>
            </StatsBlock>
          </Show>
        </GuideWrapper>
      </EditWrapper>
    </ErrorWrapper>
  );
}
