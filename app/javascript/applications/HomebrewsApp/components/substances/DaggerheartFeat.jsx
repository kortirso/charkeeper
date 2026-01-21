import { Show, For, Switch, Match } from 'solid-js';

import config from '../../../CharKeeperApp/data/daggerheart.json';

import { Button, DaggerheartFeatForm, createModal } from '../../components';
import { useAppLocale } from '../../context';
import { Trash, Edit } from '../../assets';
import { modifier } from '../../helpers';

const TRANSLATION = {
  en: {
    'str': 'Strength',
    'agi': 'Agility',
    'fin': 'Finesse',
    'ins': 'Instinct',
    'pre': 'Presence',
    'know': 'Knowledge',
    'health': 'Health',
    'stress': 'Stress',
    'hope': 'Hope',
    'evasion': 'Evasion',
    'armor_score': 'Armor score',
    'major': 'Major threshold',
    'severe': 'Severe threshold',
    'attack': 'Attacks',
    'proficiency': 'Proficiency',
    'level': 'Level',
    'tier': 'Tier'
  },
  ru: {
    'str': 'Сила',
    'agi': 'Проворность',
    'fin': 'Искусность',
    'ins': 'Инстинкт',
    'pre': 'Влияние',
    'know': 'Знание',
    'health': 'Здоровье',
    'stress': 'Стресс',
    'hope': 'Надежда',
    'evasion': 'Уклонение',
    'armor_score': 'Слоты Доспеха',
    'major': 'Ощутимый урон',
    'severe': 'Тяжёлый урон',
    'attack': 'Атаки',
    'proficiency': 'Мастерство',
    'level': 'Уровень',
    'tier': 'Ранг'
  }
}

export const DaggerheartFeat = (props) => {
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  return (
    <>
      <div class="grid grid-cols-12 p-2" classList={{ 'bg-gray-100': props.index && props.index % 2 === 1 }}>
        <div class="col-span-11">
          <div class="flex items-center justify-between">
            <p class="font-medium!">{props.feature.title.en}</p>
            <Show when={props.feature.origin === 'domain_card'}>
              <p class="mt-1">{TRANSLATION[locale()].level} {props.feature.conditions.level}</p>
            </Show>
          </div>
          <p
            class="feat-markdown mt-1"
            innerHTML={props.feature.markdown_description.en} // eslint-disable-line solid/no-innerhtml
          />
          <Show when={props.feature.bonuses.length > 0}>
            <div class="flex flex-wrap gap-x-2 mt-1">
              <For each={props.feature.bonuses}>
                {(bonus) =>
                  <Switch
                    fallback={
                      <For each={['health', 'stress', 'hope', 'evasion', 'armor_score', 'attack', 'proficiency']}>
                        {(slug) =>
                          <Show when={bonus.value[slug] || bonus.dynamic_value[slug]}>
                            <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                              {bonus.value[slug] ? modifier(bonus.value[slug]) : `+[${TRANSLATION[locale()][bonus.dynamic_value[slug]]}]`} {TRANSLATION[locale()][slug]}
                            </p>
                          </Show>
                        }
                      </For>
                    }
                  >
                    <Match when={bonus.value.traits}>
                      <For each={Object.entries(bonus.value.traits)}>
                        {([slug, value]) =>
                          <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                            {modifier(value)} {config.traits[slug].name[locale()]}
                          </p>
                        }
                      </For>
                    </Match>
                    <Match when={bonus.dynamic_value.traits}>
                      <For each={Object.entries(bonus.dynamic_value.traits)}>
                        {([slug, value]) =>
                          <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                            {`+[${TRANSLATION[locale()][value]}]`} {config.traits[slug].name[locale()]}
                          </p>
                        }
                      </For>
                    </Match>
                    <Match when={bonus.value.thresholds}>
                      <For each={['major', 'severe']}>
                        {(slug) =>
                          <Show when={bonus.value.thresholds[slug]}>
                            <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                              {modifier(bonus.value.thresholds[slug])} {TRANSLATION[locale()][slug]}
                            </p>
                          </Show>
                        }
                      </For>
                    </Match>
                    <Match when={bonus.dynamic_value.thresholds}>
                      <For each={['major', 'severe']}>
                        {(slug) =>
                          <Show when={bonus.dynamic_value.thresholds[slug]}>
                            <p class="mb-1 bg-gray-200 p-1 rounded text-sm">
                              {`+[${TRANSLATION[locale()][bonus.dynamic_value.thresholds[slug]]}]`} {TRANSLATION[locale()][slug]}
                            </p>
                          </Show>
                        }
                      </For>
                    </Match>
                  </Switch>
                }
              </For>
            </div>
          </Show>
        </div>
        <div class="col-span-1 flex items-start justify-end gap-2">
          <Show when={props.open !== undefined && !props.open}>
            <Button default classList="p-1" onClick={openModal}>
              <Edit width="16" height="16" />
            </Button>
            <Button default classList="p-1" onClick={() => props.onRemoveFeature(props.feature)}>
              <Trash width="16" height="16" />
            </Button>
          </Show>
        </div>
      </div>
      <Modal>
        <DaggerheartFeatForm
          feature={props.feature}
          onSave={(payload) => props.updateFeature(props.feature.id, props.originId, payload)}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
