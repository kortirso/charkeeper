import { Equipment } from '../../../../components';

import { itemFilters } from './Shared/ItemFilters';

export const Pathfinder2Equipment = (props) => {
  return (
    <Equipment
      withWeight={props.withWeight}
      withPrice={props.withPrice}
      withItemLevel={props.withItemLevel}
      withFormula={props.withFormula}
      withCraft={props.withCraft}
      forCampaign={props.forCampaign}
      upgrades={props.upgrades}
      character={props.character}
      characters={props.characters}
      itemFilters={itemFilters()}
      onReplaceCharacter={props.onReplaceCharacter}
      onReloadCharacter={props.onReloadCharacter}
    >
      {props.children}
    </Equipment>
  );
}
