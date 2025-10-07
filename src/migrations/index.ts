import * as migration_20261110_150135_initial from './20261110_150135_initial';

export const migrations = [
  {
    up: migration_20261110_150135_initial.up,
    down: migration_20261110_150135_initial.down,
    name: '20261110_150135_initial'
  },
];
