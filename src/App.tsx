import type { Component } from 'solid-js';
import { FreediverGame } from './game/freediver/FreediverGame';
import { css } from '@style/css';

const App: Component = () => {
  return (
    <>
      <img src="/logo.png" class={styles.logo} />
      <FreediverGame />
    </>
  );
};

export default App;

const styles = {
  logo: css({
    m: '1rem auto',
    height: '60px',
  }),
}