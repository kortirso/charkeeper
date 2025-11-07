import { Show, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import * as i18n from '@solid-primitives/i18n';

import { Input, Select, Button, TextArea } from '../../../../components';
import { useAppLocale } from '../../../../context';
import config from '../../../../data/daggerheart.json';
import { translate } from '../../../../helpers';

export const NewDaggerheartItemForm = (props) => {
  const [itemForm, setItemForm] = createStore({
    name: '',
    kind: '',
    burden: 1,
    tier: 1,
    trait: 'str',
    range: 'melee',
    damage_type: 'physical',
    damage: 'd6',
    damage_bonus: 0,
    features: '',
    itemable_type: null,
    itemable_id: null,
    description: ''
  });

  const [locale, dict] = useAppLocale();

  const t = i18n.translator(dict);

  const traitsForSelect = createMemo(() => {
    return { ...{ 'null': 'No value' }, ...translate(config.traits, locale()) };
  });

  const generatePayload = () => {
    if (itemForm.kind === 'item' || itemForm.kind === 'consumable') {
      return { name: itemForm.name, kind: itemForm.kind, description: itemForm.description };
    }
    if (itemForm.kind === 'primary weapon' || itemForm.kind === 'secondary weapon') {
      return {
        name: itemForm.name,
        description: itemForm.description,
        kind: itemForm.kind,
        itemable_type: itemForm.itemable_type,
        itemable_id: itemForm.itemable_id,
        info: {
          burden: itemForm.burden,
          tier: itemForm.tier,
          trait: itemForm.trait,
          range: itemForm.range,
          damage_type: itemForm.damage_type,
          damage: itemForm.damage,
          damage_bonus: !isNaN(itemForm.damage_bonus) ? (parseInt(itemForm.damage_bonus) || 0) : 0,
          features: [{ en: itemForm.features, ru: itemForm.features }]
        }
      }
    }
  }

  return (
    <>
      <Input
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.itemName')}
        value={itemForm.name}
        onInput={(value) => setItemForm({ ...itemForm, name: value })}
      />
      <Select
        containerClassList="mb-2"
        labelText={t('pages.homebrewPage.daggerheart.itemKind')}
        items={dict().daggerheart.terms.items.kinds}
        selectedValue={itemForm.kind}
        onSelect={(value) => setItemForm({ ...itemForm, kind: value })}
      />
      <Show when={itemForm.kind === 'primary weapon' || itemForm.kind === 'secondary weapon'}>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.tier')}
            items={{ 1: 1, 2: 2, 3: 3, 4: 4 }}
            selectedValue={itemForm.tier}
            onSelect={(value) => setItemForm({ ...itemForm, tier: parseInt(value) })}
          />
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.trait')}
            items={traitsForSelect()}
            selectedValue={itemForm.trait}
            onSelect={(value) => setItemForm({ ...itemForm, trait: value === 'null' ? null : value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.damageType')}
            items={translate(config.damageTypes, locale())}
            selectedValue={itemForm.damage_type}
            onSelect={(value) => setItemForm({ ...itemForm, damage_type: value })}
          />
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.burden')}
            items={{ 1: 1, 2: 2 }}
            selectedValue={itemForm.burden}
            onSelect={(value) => setItemForm({ ...itemForm, burden: parseInt(value) })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.range')}
            items={translate(config.ranges, locale())}
            selectedValue={itemForm.range}
            onSelect={(value) => setItemForm({ ...itemForm, range: value })}
          />
          <Input
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.damage')}
            value={itemForm.damage}
            onInput={(value) => setItemForm({ ...itemForm, damage: value })}
          />
          <Input
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.damageBonus')}
            value={itemForm.damage_bonus}
            onInput={(value) => setItemForm({ ...itemForm, damage_bonus: value })}
          />
        </div>
        <div class="mb-2 flex gap-4">
          <Select
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.itemOrigin')}
            items={{ 'null': 'No value', 'Feat': 'Feat' }}
            selectedValue={itemForm.itemable_type}
            onSelect={(value) => setItemForm({ ...itemForm, itemable_type: value === 'null' ? null : value })}
          />
          <Select
            disabled={itemForm.itemable_type === null}
            containerClassList="flex-1"
            labelText={t('pages.homebrewPage.daggerheart.itemOriginValue')}
            items={props.homebrews.feats.reduce((acc, item) => { acc[item.id] = item.title['en']; return acc; }, {})}
            selectedValue={itemForm.itemable_id}
            onSelect={(value) => setItemForm({ ...itemForm, itemable_id: value })}
          />
        </div>
        <TextArea
          rows="3"
          labelText={t('pages.homebrewPage.daggerheart.features')}
          value={itemForm.features}
          onChange={(value) => setItemForm({ ...itemForm, features: value })}
        />
      </Show>
      <TextArea
        rows="3"
        containerClassList="mt-2"
        labelText={t('pages.homebrewPage.daggerheart.description')}
        value={itemForm.description}
        onChange={(value) => setItemForm({ ...itemForm, description: value })}
      />
      <div class="flex gap-4 w-full mt-4">
        <Button outlined classList="flex-1" onClick={props.onCancel}>{t('cancel')}</Button>
        <Button default classList="flex-1" onClick={() => props.onSave({ brewery: generatePayload() })}>{t('save')}</Button>
      </div>
    </>
  );
}

