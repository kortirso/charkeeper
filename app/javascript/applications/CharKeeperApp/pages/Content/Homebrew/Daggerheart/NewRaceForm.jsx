import { createSignal } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Input, Select, Button } from '../../../../components';
import config from '../../../../data/daggerheart.json';
import { useAppLocale } from '../../../../context';

export const NewDaggerheartRaceForm = (props) => {
  const [name, setName] = createSignal('');
  const [domains, setDomains] = createSignal([]);

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const updateDomains = (value) => {
    if (domains().includes(value)) setDomains(domains().filter((item) => item !== value));
    else setDomains(domains().concat(value));
  }

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.raceName')}
        value={name()}
        onInput={(value) => setName(value)}
      />
      <Select
        multi
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.domains')}
        items={Object.fromEntries(Object.entries(config.domains).map(([key, values]) => [key, values.name[locale()]]))}
        selectedValues={domains()}
        onSelect={updateDomains}
      />
      <Button default onClick={() => props.onSave({ brewery: { name: name(), domains: domains() } })}>{t('save')}</Button>
    </>
  );
}
