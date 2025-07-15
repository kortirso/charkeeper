// import { createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

// import { Input, Select, Button } from '../../../../components';
// import config from '../../../../data/daggerheart.json';
import { useAppLocale } from '../../../../context';

export const DaggerheartRace = (props) => {
  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <></>
  );
}
