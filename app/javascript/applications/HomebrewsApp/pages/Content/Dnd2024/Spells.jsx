import { Show } from 'solid-js';

import config from '../../../../CharKeeperApp/data/dnd2024.json';

import { useAppState, useAppLocale } from '../../../context';
import { SharedContent } from '../../../pages';
import { fetchSpellsRequest, fetchSpellRequest, copySpellRequest } from '../../../requests_v2/dnd2024/spells';
import { localize } from '../../../helpers';

const TRANSLATION = {
  en: {
    classes: 'Available classes',
    schools: {
      abjuration: 'Abjuration',
      conjuration: 'Conjuration',
      divination: 'Divination',
      enchantment: 'Enchantment',
      evocation: 'Evocation',
      illusion: 'Illusion',
      necromancy: 'Necromancy',
      transmutation: 'Transmutation'
    },
    school: 'School of magic',
    time: 'Time',
    range: 'Range',
    duration: 'Duration',
    component: 'Components',
    components: {
      v: 'Verbal',
      s: 'Somatic',
      m: 'Material'
    },
    dc: 'Saving throw',
    area: 'Area',
    hit: 'Hit',
    concentration: 'Concentration',
    ritual: 'Ritual'
  },
  ru: {
    classes: 'Доступность для классов',
    schools: {
      abjuration: 'Ограждение',
      conjuration: 'Вызов',
      divination: 'Прорицание',
      enchantment: 'Очарование',
      evocation: 'Воплощение',
      illusion: 'Иллюзия',
      necromancy: 'Некромантия',
      transmutation: 'Преобразование'
    },
    school: 'Школа магии',
    time: 'Время',
    range: 'Дальность',
    duration: 'Длительность',
    component: 'Компоненты',
    components: {
      v: 'Вербальный',
      s: 'Соматический',
      m: 'Материальный'
    },
    dc: 'Спасбросок',
    area: 'Область',
    hit: 'Необходимо попадание',
    concentration: 'Концентрация',
    ritual: 'Ритуал'
  },
  es: {
    classes: 'Clases disponibles',
    schools: {
      abjuration: 'Abjuración',
      conjuration: 'Conjuración',
      divination: 'Adivinación',
      enchantment: 'Encantamiento',
      evocation: 'Evocación',
      illusion: 'Ilusión',
      necromancy: 'Nigromancia',
      transmutation: 'Transmutación'
    },
    school: 'Escuela de magia',
    time: 'Tiempo',
    range: 'Alcance',
    duration: 'Duración',
    component: 'Componentes',
    components: {
      v: 'Verbal',
      s: 'Somatico',
      m: 'Material'
    },
    dc: 'Tirada de salvación',
    area: 'Area',
    hit: 'Hit',
    concentration: 'Concentration',
    ritual: 'Ritual'
  }
}

export const Dnd2024Spells = () => {
  const [locale] = useAppLocale();
  const [appState] = useAppState();

  const fetchList = async () => await fetchSpellsRequest(appState.accessToken);

  const ChildrenComponent = (props) => (
    <div class="flex flex-col gap-2">
      <p>{localize(TRANSLATION, locale()).classes} - {props.info.origin_values.map((item) => localize(config.classes[item].name, locale())).join(', ')}</p>
      <p>{localize(TRANSLATION, locale()).time} - {props.info.info.time}</p>
      <p>{localize(TRANSLATION, locale()).school} - {localize(TRANSLATION, locale()).schools[props.info.info.school]}</p>
      <p>{localize(TRANSLATION, locale()).range} - {props.info.info.range}</p>
      <Show when={props.info.info.area}><p>{localize(TRANSLATION, locale()).area} - {props.info.info.area}</p></Show>
      <Show when={props.info.info.duration}><p>{localize(TRANSLATION, locale()).duration} - {props.info.info.duration}</p></Show>
      <Show when={props.info.info.components}><p>{localize(TRANSLATION, locale()).component} - {props.info.info.components.split(',').map((item) => localize(TRANSLATION, locale()).components[item]).join(', ')}</p></Show>
      <Show when={props.info.info.dc}><p>{localize(TRANSLATION, locale()).dc} - {localize(config.abilities[props.info.info.dc].name, locale())}</p></Show>
      <Show when={props.info.info.hit}><p>{localize(TRANSLATION, locale()).hit}</p></Show>
      <Show when={props.info.info.concentration}><p>{localize(TRANSLATION, locale()).concentration}</p></Show>
      <Show when={props.info.info.ritual}><p>{localize(TRANSLATION, locale()).ritual}</p></Show>
      <p
        class="feat-markdown"
        innerHTML={props.info.description} // eslint-disable-line solid/no-innerhtml
      />
    </div>
  );

  return (
    <SharedContent
      provider="dnd2024"
      parentType="Feat"
      publicationType="spell"
      onFetchRequest={fetchList}
      onShowRequest={fetchSpellRequest}
      onCopyRequest={copySpellRequest}
      childrenComponent={ChildrenComponent}
    />
  );
}
