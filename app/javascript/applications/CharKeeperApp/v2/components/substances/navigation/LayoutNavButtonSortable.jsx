import { useSortable } from '@dnd-kit/solid/sortable';

import { LayoutNavButton } from '../../../components';

export const LayoutNavButtonSortable = (props) => {
  const { ref, handleRef, isDragSource } = useSortable({
    get id() { return props.id; },
    get index() { return props.index; },
    get disabled() { return !props.draggable; }
  });

  return (
    <LayoutNavButton {...props} sortableRef={ref} dragHandleRef={handleRef} isDragging={isDragSource()} />
  );
}
