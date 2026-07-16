import * as migration_20260716_120723_init from './20260716_120723_init';

export const migrations = [
  {
    up: migration_20260716_120723_init.up,
    down: migration_20260716_120723_init.down,
    name: '20260716_120723_init'
  },
];
