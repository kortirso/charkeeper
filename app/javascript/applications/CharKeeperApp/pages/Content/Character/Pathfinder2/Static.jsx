import { ErrorWrapper, StatsBlock, Dice } from '../../../../components';
import { useAppLocale } from '../../../../context';
import { modifier } from '../../../../helpers';

const TRANSLATION = {
  en: {
    armorClass: 'Armor Class',
    perception: 'Perception',
    speed: 'Speed'
  },
  ru: {
    armorClass: 'Класс брони',
    perception: 'Восприятие',
    speed: 'Скорость'
  }
}

export const Pathfinder2Static = (props) => {
  const character = () => props.character;

  const [locale] = useAppLocale();

  return (
    <ErrorWrapper payload={{ character_id: character().id, key: 'Pathfinder2Static' }}>
      <StatsBlock
        items={[
          { title: TRANSLATION[locale()].armorClass, value: character().armor_class },
          {
            title: TRANSLATION[locale()].perception,
            value:
              <Dice
                width="36"
                height="36"
                text={modifier(character().perception)}
                onClick={() => props.openDiceRoll('/check initiative empty', character().perception)}
              />
          },
          { title: TRANSLATION[locale()].speed, value: character().speed }
        ]}
      />
    </ErrorWrapper>
  );
}
