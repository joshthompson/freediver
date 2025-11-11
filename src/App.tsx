import type { Component } from 'solid-js';
import { FreediverGame } from './game/freediver/FreediverGame';
import { css } from '@style/css';
import logo from '@public/logo.png'

const App: Component = () => {
  return (
    <>
      <img src={logo} class={styles.logo} />
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