import { ContentLayout } from './layouts';

export const Content = (props) => {
  return (
    <div
      class="ck-v2"
      data-color-mode={props.colorMode === 'dark' ? 'dark' : 'light'}
      data-color-scheme="crimson"
    >
      <ContentLayout />
    </div>
  );
}
