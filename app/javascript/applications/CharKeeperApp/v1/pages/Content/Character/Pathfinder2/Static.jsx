import { Pathfinder2SharedSenses } from '../../../../pages';
import { ErrorWrapper } from '../../../../components';

export const Pathfinder2Static = (props) => {
  const character = () => props.character;

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Static' }}>
      <Pathfinder2SharedSenses
        armorClass={character().armor_class}
        perception={character().perception}
        speed={character().speed}
        classDc={character().class_dc}
        speeds={character().speeds}
        openD20Test={props.openD20Test}
      />
    </ErrorWrapper>
  );
}
