import { Show } from 'solid-js';

import { Button, DndFeatForm, createModal } from '../../../components';
import { useAppLocale } from '../../../context';
import { Trash, Edit, Stroke } from '../../../assets';

const TRANSLATION = {
  en: {
    level: 'Level',
    staticSpells: 'Static spells'
  },
  ru: {
    level: 'Уровень',
    staticSpells: 'Врождённые заклинания'
  },
  es: {
    level: 'Nivel',
    staticSpells: 'Hechizos estáticos'
  }
}

export const DndFeat = (props) => {
  const [locale] = useAppLocale();
  const { Modal, openModal, closeModal } = createModal();

  return (
    <>
      <div class="grid grid-cols-12 p-2" classList={{ 'bg-gray-100': props.index && props.index % 2 === 1 }}>
        <div class="col-span-11">
          <p class="font-medium!">{props.feature.title.en}</p>
          <p class="mt-1">{TRANSLATION[locale()].level} {props.feature.conditions.level}</p>
          <Show when={props.spells && props.feature.info.static_spells && Object.keys(props.feature.info.static_spells).length > 0}>
            <p class="mt-1 text-sm">{TRANSLATION[locale()].staticSpells}: {Object.keys(props.feature.info.static_spells).map((item) => props.spells[item]).join(', ')}</p>
          </Show>
          <p
            class="feat-markdown mt-1"
            innerHTML={props.feature.markdown_description.en} // eslint-disable-line solid/no-innerhtml
          />
        </div>
        <div class="col-span-1 flex items-start justify-end gap-2">
          <Show when={props.open !== undefined && !props.open}>
            <Show when={props.showBookSelect}>
              <Button default classList="p-2" onClick={props.onSelect}>
                <span classList={{ 'opacity-25': !props.selected }}>
                  <Stroke width="16" height="12" />
                </span>
              </Button>
            </Show>
            <Button default classList="p-1" onClick={openModal}>
              <Edit width="16" height="16" />
            </Button>
            <Button default classList="p-1" onClick={() => props.onRemoveFeature(props.feature)}>
              <Trash width="16" height="16" />
            </Button>
          </Show>
        </div>
      </div>
      <Modal>
        <DndFeatForm
          feature={props.feature}
          spells={props.spells}
          onSave={(payload) => props.updateFeature(props.feature.id, props.originId, payload)}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
