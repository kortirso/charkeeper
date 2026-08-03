import * as i18n from '@solid-primitives/i18n';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { localize } from '../../../../helpers';

const TRANSLATION = {
  en: {
    helpMessage: 'Here you can select equipment for your character.'
  },
  ru: {
    helpMessage: 'На этой вкладке вы можете выбрать снаряжение для вашего персонажа.'
  },
  es: {
    helpMessage: 'Aquí puedes seleccionar el equipo para tu personaje.'
  }
}

export const Dnd5Equipment = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const itemFilter = (item) => item.kind === 'item';
  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor') || item.kind.includes('shield');
  const ammoFilter = (item) => item.kind === 'ammo';
  const focusFilter = (item) => item.kind === 'focus';
  const toolsFilter = (item) => item.kind === 'tools';
  const musicFilter = (item) => item.kind === 'music';
  const potionFilter = (item) => item.kind === 'potion';

  return (
    <Equipment
      withWeight={props.withWeight}
      withPrice={props.withPrice}
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
      characters={props.characters}
      itemFilters={[
        { title: t('equipment.itemsList'), callback: itemFilter },
        { title: t('equipment.weaponsList'), callback: weaponFilter },
        { title: t('equipment.armorList'), callback: armorFilter },
        { title: t('equipment.consumables'), callback: potionFilter},
        { title: t('equipment.ammoList'), callback: ammoFilter },
        { title: t('equipment.focusList'), callback: focusFilter },
        { title: t('equipment.toolsList'), callback: toolsFilter },
        { title: t('equipment.musicList'), callback: musicFilter}
      ]}
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
      currentGuideStep={props.character.guide_step}
      guideStep={props.guideStep}
      helpMessage={props.guideStep ? localize(TRANSLATION, locale()).helpMessage : null}
      onNextGuideStepClick={props.onNextGuideStepClick}
    >
      {props.children}
    </Equipment>
  );
}
