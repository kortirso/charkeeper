import { createSignal, createEffect, createMemo, Show, batch } from 'solid-js';

import { Select, ErrorWrapper, GuideWrapper } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { updateCharacterRequest } from '../../../../requests/updateCharacterRequest';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    desc: 'While in Beastform, you cannot use weapons or cast spells from Domain Cards. You can still use class features, abilities, and Beastform-specific actions.',
    examples: 'Examples: ',
    adv: 'Advantages on:',
    legendaryBeast: 'Legendary Beast',
    legendaryHybrid: 'Legendary Hybrid',
    mythicBeast: 'Mythic Beast',
    mythicHybrid: 'Mythic Hybrid',
    naturalForm: 'Natural form',
    transformation: 'Transformation to beast',
    beast: 'Select updating beastform'
  },
  ru: {
    desc: 'Во время трансформации вы не можете использовать оружие или заклинания из карт домена, но вы по-прежнему можете использовать другие функции или способности, к которым у вас есть доступ.',
    examples: 'Примеры:',
    adv: 'Преимущества при:',
    legendaryBeast: 'Легендарный зверь',
    legendaryHybrid: 'Легендарный гибрид',
    mythicBeast: 'Мифический зверь',
    mythicHybrid: 'Мифический гибрид',
    naturalForm: 'Естественная форма',
    transformation: 'Превращение в зверя',
    beast: 'Выберите улучшаемую форму'
  },
  es: {
    desc: 'While in Beastform, you cannot use weapons or cast spells from Domain Cards. You can still use class features, abilities, and Beastform-specific actions.',
    examples: 'Examples: ',
    adv: 'Advantages on:',
    legendaryBeast: 'Legendary Beast',
    legendaryHybrid: 'Legendary Hybrid',
    mythicBeast: 'Mythic Beast',
    mythicHybrid: 'Mythic Hybrid',
    naturalForm: 'Forma natural',
    transformation: 'Transformación a bestia',
    beast: 'Select updating beastform'
  }
}

export const DaggerheartBeastform = (props) => {
  const character = () => props.character;

  const [lastActiveCharacterId, setLastActiveCharacterId] = createSignal(undefined);
  const [beastform, setBeastform] = createSignal(undefined);
  const [beast, setBeast] = createSignal(undefined);

  const [appState] = useAppState();
  const [{ renderAlerts }] = useAppAlert();
  const [locale] = useAppLocale();

  createEffect(() => {
    if (lastActiveCharacterId() === character().id) return;

    batch(() => {
      setBeastform(character().beastform);
      setBeast(character().beast);
      setLastActiveCharacterId(character().id);
    });
  });

  const currentBaseBeast = createMemo(() => {
    if (config.beastforms[beastform()]) return config.beastforms[beastform()];
    if (config.beastforms[beast()]) return config.beastforms[beast()];

    return null
  });

  const beastSelectOptions = createMemo(() => {
    let tier;

    switch (beastform()) {
      case 'legendary_beast':
        tier = 1;
        break;
      case 'mythic_beast':
        tier = 2;
        break;
      default:
        tier = 0;
    }

    return Object.fromEntries(Object.entries(config.beastforms).filter(([, values]) => values.tier <= tier).map(([key, values]) => [key, `${localize(values.name, locale())} T${values.tier}`]));
  })

  const beastformsSelect = createMemo(() => {
    let result = Object.entries(config.beastforms).filter(([, values]) => values.tier <= character().tier).map(([key, values]) => [key, `${localize(values.name, locale())} T${values.tier}`]);

    if (character().tier >= 3) {
      result = [
        ['legendary_beast', localize(TRANSLATION, locale()).legendaryBeast],
        ['legendary_hybrid', localize(TRANSLATION, locale()).legendaryHybrid]
      ].concat(result);
    }
    if (character().tier >= 4) {
      result = [
        ['mythic_beast', localize(TRANSLATION, locale()).mythicBeast],
        ['mythic_hybrid', localize(TRANSLATION, locale()).mythicHybrid]
      ].concat(result);
    }

    return Object.fromEntries([['none', localize(TRANSLATION, locale()).naturalForm]].concat(result));
  });

  const changeBeastform = async (value) => {
    updateCharacter({ beastform: (value === 'none' ? null : value), beast: null });
    batch(() => {
      setBeastform(value === 'none' ? null : value);
      setBeast(value);
    });
  }

  const changeBeast = async (value) => {
    updateCharacter({ beast: value });
    setBeast(value);
  }

  const updateCharacter = async (payload) => {
    const result = await updateCharacterRequest(appState.accessToken, character().provider, character().id, { character: payload });

    if (result.errors_list === undefined) props.onReplaceCharacter(result.character);
    else renderAlerts(result.errors_list);
  }

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'DaggerheartBeastform' }}>
      <GuideWrapper character={character()}>
        <div class="blockable p-4">
          <h2 class="text-lg">{localize(TRANSLATION, locale()).transformation}</h2>
          <Select
            containerClassList="w-full mt-2"
            items={beastformsSelect()}
            selectedValue={beastform() === null ? 'none' : beastform()}
            onSelect={changeBeastform}
          />
          <Show when={beastform()}>
            <Show when={beastform() === 'legendary_beast' || beastform() === 'mythic_beast'}>
              <Select
                containerClassList="w-full mt-2"
                labelText={localize(TRANSLATION, locale()).beast}
                items={beastSelectOptions()}
                selectedValue={beast() === null ? 'none' : beast()}
                onSelect={changeBeast}
              />
            </Show>



            <p class="text-sm mt-2">{localize(TRANSLATION, locale())['desc']}</p>

            <Show when={currentBaseBeast()}>
              <p class="mt-1">{localize(TRANSLATION, locale()).examples} {localize(currentBaseBeast().examples, locale())}</p>
              <p class="mt-1">{localize(TRANSLATION, locale()).adv} {localize(currentBaseBeast().adv, locale())}</p>
            </Show>
          </Show>
        </div>
      </GuideWrapper>
    </ErrorWrapper>
  );
}
