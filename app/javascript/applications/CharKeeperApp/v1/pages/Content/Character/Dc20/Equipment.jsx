import * as i18n from '@solid-primitives/i18n';

import { Equipment } from '../../../../components';
import { useAppLocale } from '../../../../context';

export const Dc20Equipment = (props) => {
  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const weaponFilter = (item) => item.kind.includes('weapon');
  const armorFilter = (item) => item.kind.includes('armor');
  const shieldFilter = (item) => item.kind.includes('shield');
  const focusFilter = (item) => item.kind.includes('focus');

  return (
    <Equipment
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
      characters={props.characters}
      itemFilters={[
        { title: t('equipment.weaponsList'), callback: weaponFilter },
        { title: t('equipment.armorList'), callback: armorFilter },
        { title: t('equipment.shieldList'), callback: shieldFilter },
        { title: t('equipment.focusList'), callback: focusFilter }
      ]}
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
      currentGuideStep={props.character.guide_step}
      guideStep={props.guideStep}
      helpMessage={props.guideStep ? props.helpMessage : null}
    />
  );
}
