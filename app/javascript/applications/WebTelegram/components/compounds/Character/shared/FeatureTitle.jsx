import { Show, Switch, Match } from 'solid-js';
import * as i18n from '@solid-primitives/i18n';

import { Button } from '../../../atoms';

import { useAppLocale } from '../../../../context';
import { PlusSmall, Minus, Campfire, LongCampfire } from '../../../../assets';

export const FeatureTitle = (props) => {
  const feature = () => props.feature;
  const character = () => props.character;

  const [, dict] = useAppLocale();

  const t = i18n.translator(dict);

  return (
    <Show when={feature().limit !== undefined} fallback={feature().title}>
      <div class="flex items-center">
        <p class="flex-1">{feature().title}</p>
        <div class="flex items-center">
          <Button default size="small" onClick={(event) => character().energy[feature().slug] !== feature().limit ? props.onSpendEnergy(event, feature()) : event.stopPropagation()}>
            <Minus />
          </Button>
          <p class="flex items-center justify-center mx-2">
            <span class="w-6 text-center">{feature().limit - (character().energy[feature().slug] || 0)}</span>
            <Switch>
              <Match when={feature().limit_refresh === 'short_rest'}>
                <span title={t('character.shortRest')}><Campfire /></span>
              </Match>
              <Match when={feature().limit_refresh === 'long_rest'}>
                <span title={t('character.longRest')}><LongCampfire /></span>
              </Match>
              <Match when={feature().limit_refresh === 'session'}>
                <span title={t('character.longRest')}><LongCampfire /></span>
              </Match>
            </Switch>
          </p>
          <Button default size="small" onClick={(event) => (character().energy[feature().slug] || 0) > 0 ? props.onRestoreEnergy(event, feature()) : event.stopPropagation()}>
            <PlusSmall />
          </Button>
        </div>
      </div>
    </Show>
  );
}
