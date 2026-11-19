import { createEffect, createMemo, createSignal, Show, batch } from 'solid-js';

import { Button } from '../../../../components';
import { useAppState, useAppLocale, useAppAlert } from '../../../../context';
import { Minus, Plus } from '../../../../assets';
import { localize } from '../../../../helpers';
import { createCharacterItemRequest } from '../../../../requests/createCharacterItemRequest';
import { findCharacterFormulaRequest } from '../../../../requests/findCharacterFormulaRequest';

const TRANSLATION = {
  en: {
    title: 'Craft calculator',
    dc: 'Difficult class',
    prepareTime: 'Craft time (days)',
    items: 'Items output',
    days: 'Additional days',
    resultGrade: 'Craft result',
    results: ['Crit failure', 'Failure', 'Success', 'Crit success'],
    craftPrice: 'Craft price (gc)',
    craftCompleted: 'Craft is completed',
    save: 'Add crafted items'
  },
  ru: {
    title: 'Калькулятор крафта',
    dc: 'Сложность',
    prepareTime: 'Время крафта (дни)',
    items: 'Получаемые предметы',
    days: 'Доп дни',
    resultGrade: 'Результат броска',
    results: ['Крит провал', 'Провал', 'Успех', 'Крит успех'],
    craftPrice: 'Цена крафта (зм)',
    craftCompleted: 'Крафт завершён',
    save: 'Добавить предметы'
  },
  es: {
    title: 'Calculadora de creación',
    dc: 'Clase difícil',
    prepareTime: 'Tiempo de creación (días)',
    items: 'Producción de objetos',
    days: 'Días adicionales',
    resultGrade: 'Resultado de la creación',
    results: ['Fallo crítico', 'Fallo', 'Éxito', 'Éxito crítico'],
    craftPrice: 'Precio de creación (gc)',
    craftCompleted: 'La artesanía está terminada',
    save: 'Agregar artículos elaborados'
  }
}

const LEVELS = {
  0: { 1: 5, 2: 5, 3: 5, 4: 5 },
  1: { 1: 20, 2: 20, 3: 20, 4: 20 },
  2: { 1: 30, 2: 30, 3: 30, 4: 30 },
  3: { 1: 50, 2: 50, 3: 50, 4: 50 },
  4: { 1: 70, 2: 80, 3: 80, 4: 80 },
  5: { 1: 90, 2: 100, 3: 100, 4: 100 },
  6: { 1: 150, 2: 200, 3: 200, 4: 200 },
  7: { 1: 200, 2: 250, 3: 250, 4: 250 },
  8: { 1: 250, 2: 300, 3: 300, 4: 300 },
  9: { 1: 300, 2: 400, 3: 400, 4: 400 },
  10: { 1: 400, 2: 500, 3: 600, 4: 600 },
  11: { 1: 500, 2: 600, 3: 800, 4: 800 },
  12: { 1: 600, 2: 800, 3: 1000, 4: 1000 },
  13: { 1: 700, 2: 1000, 3: 1500, 4: 1500 },
  14: { 1: 800, 2: 1500, 3: 2000, 4: 2000 },
  15: { 1: 1000, 2: 2000, 3: 2800, 4: 2800 },
  16: { 1: 1300, 2: 2500, 3: 3600, 4: 4000 },
  17: { 1: 1500, 2: 3000, 3: 4500, 4: 5500 },
  18: { 1: 2000, 2: 4500, 3: 7000, 4: 9000 },
  19: { 1: 3000, 2: 6000, 3: 10000, 4: 13000 },
  20: { 1: 4000, 2: 7500, 3: 15000, 4: 20000 }
}

export const Pathfinder2CraftPlace = (props) => {
  const craft = () => props.craft;

  const [lastId, setLastId] = createSignal(undefined);

  const [amount, setAmount] = createSignal(1);
  const [days, setDays] = createSignal(0);
  const [resultGrade, setResultGrade] = createSignal(2);
  const [formula, setFormula] = createSignal(undefined);

  const [appState] = useAppState();
  const [locale] = useAppLocale();
  const [{ renderAlerts, renderNotice }] = useAppAlert();

  const checkFormula = async () => {
    const result = await findCharacterFormulaRequest(appState.accessToken, 'pathfinder2', props.characterId, craft().id);
    batch(() => {
      setFormula(result.errors_list === undefined);
      setLastId(craft().id);
    })
  }

  createEffect(() => {
    if (props.formula || !craft()) return;
    if (lastId() === craft().id) return;

    checkFormula();
  });

  const i18n = createMemo(() => localize(TRANSLATION, locale()));
  const dc = createMemo(() => craft()?.data?.level ? (Math.floor(craft().data.level / 3) + 14) : 14);

  const prepTime = createMemo(() => {
    const baseTime = props.formula || formula() ? 1 : 2;
    if (!craft()) return baseTime + days();

    if (craft().kind === 'consumables') {
      return baseTime * (Math.floor((amount() - 1) / 4) + 1) + days();
    } else {
      return baseTime * amount() + days();
    }
  });

  const craftPrice = createMemo(() => {
    if (!craft()) return 0;
    if (resultGrade() === 0) return -(amount() * craft().data.price) / 20;
    if (resultGrade() === 1) return 0;

    const level = resultGrade() === 2 ? LEVELS[props.level][props.skill] : LEVELS[props.level + 1][props.skill];
    return amount() * Math.max(craft().data.price - Math.max(level, 20) * days(), craft().data.price / 2);
  })

  const saveCraft = async () => {
    const result = await createCharacterItemRequest(
      appState.accessToken,
      'pathfinder2',
      props.characterId,
      { item_id: craft().id, amount: amount() },
     'characters'
    );

    if (result.errors_list === undefined) {
      if (props.reloadCharacterItems) props.reloadCharacterItems();
      renderNotice(i18n().craftCompleted);
      props.completeCraft();
    } else renderAlerts(result.errors_list);
  }

  return (
    <Show when={craft()}>
      <div class="flex flex-col gap-2">
        <h2 class="text-lg mb-2">{i18n().title}</h2>
        <p>{craft().name}</p>
        <p>{i18n().dc} - {dc()}</p>
        <div class="flex gap-4 mt-4">
          {i18n().items}
          <Button default size="small" disabled={amount() === 1} onClick={() => setAmount(amount() - 1)}><Minus /></Button>
          {amount()}
          <Button default size="small" onClick={() => setAmount(amount() + 1)} ><Plus /></Button>
        </div>
        <div class="flex gap-4">
          {i18n().days}
          <Button default size="small" disabled={days() === 0} onClick={() => setDays(days() - 1)}><Minus /></Button>
          {days()}
          <Button default size="small" onClick={() => setDays(days() + 1)} ><Plus /></Button>
        </div>
        <div class="flex gap-4">
          {i18n().resultGrade}
          <Button default size="small" disabled={resultGrade() === 0} onClick={() => setResultGrade(resultGrade() - 1)}><Minus /></Button>
          {i18n().results[resultGrade()]}
          <Button default size="small" disabled={resultGrade() === 3} onClick={() => setResultGrade(resultGrade() + 1)} ><Plus /></Button>
        </div>
        <p class="mt-4">{i18n().craftPrice} - {craftPrice() / 100}</p>
        <p>{i18n().prepareTime} - {prepTime()}</p>
        <Button textabel default classList="mt-2" onClick={saveCraft}><span>{i18n().save}</span></Button>
      </div>
    </Show>
  );
}
