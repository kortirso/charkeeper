import { Switch, Match } from 'solid-js';

export const LevelChevron = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <Switch>
      <Match when={props.size === 0}>
        <path d="M 25 46 L 75 46 L 75 54 L 25 54 Z" fill="currentColor" />
      </Match>
      <Match when={props.size === 1}>
        <path d="M 50 25 L 85 45 L 85 55 L 50 35 L 15 55 L 15 45 Z" fill="currentColor" />
      </Match>
      <Match when={props.size === 2}>
        <path d="M 50 20 L 85 40 L 85 50 L 50 30 L 15 50 L 15 40 Z" fill="currentColor" />
        <path d="M 50 35 L 85 55 L 85 65 L 50 45 L 15 65 L 15 55 Z" fill="currentColor" />
      </Match>
      <Match when={props.size === 3}>
        <path d="M 50 15 L 85 35 L 85 45 L 50 25 L 15 45 L 15 35 Z" fill="currentColor" />
        <path d="M 50 30 L 85 50 L 85 60 L 50 40 L 15 60 L 15 50 Z" fill="currentColor" />
        <path d="M 50 45 L 85 65 L 85 75 L 50 55 L 15 75 L 15 65 Z" fill="currentColor" />
      </Match>
      <Match when={props.size === 4}>
        <path d="M 50 10 L 85 30 L 85 40 L 50 20 L 15 40 L 15 30 Z" fill="currentColor" />
        <path d="M 50 25 L 85 45 L 85 55 L 50 35 L 15 55 L 15 45 Z" fill="currentColor" />
        <path d="M 50 40 L 85 60 L 85 70 L 50 50 L 15 70 L 15 60 Z" fill="currentColor" />
        <path d="M 50 55 L 85 75 L 85 85 L 50 65 L 15 85 L 15 75 Z" fill="currentColor" />
      </Match>
    </Switch>
  </svg>
);
