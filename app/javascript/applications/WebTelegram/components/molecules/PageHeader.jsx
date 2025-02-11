import { Show, children } from 'solid-js';

export const PageHeader = (props) => {
  const safeChildren = children(() => props.children);

  return (
    <div class="w-full flex justify-between items-center p-4 bg-white border-b border-gray-200">
      <Show when={props.leftContent || props.rightContent}>
        <div class="w-12">
          {props.leftContent}
        </div>
      </Show>
      <div class="flex-1 flex flex-col items-center">
        {safeChildren()}
      </div>
      <Show when={props.leftContent || props.rightContent}>
        <div class="w-12 flex justify-end">
          {props.rightContent}
        </div>
      </Show>
    </div>
  );
}
