import { useAppLocale } from '../../../../context';

export const DaggerheartItem = (props) => {
  const [, dict] = useAppLocale();

  return (
    <>
      <p>{dict().daggerheart.terms.items.kinds[props.item.kind]}</p>
    </>
  );
}
