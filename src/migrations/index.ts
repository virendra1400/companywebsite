import * as migration_20260716_120723_init from './20260716_120723_init';
import * as migration_20260716_130814_site_settings from './20260716_130814_site_settings';

export const migrations = [
  {
    up: migration_20260716_120723_init.up,
    down: migration_20260716_120723_init.down,
    name: '20260716_120723_init',
  },
  {
    up: migration_20260716_130814_site_settings.up,
    down: migration_20260716_130814_site_settings.down,
    name: '20260716_130814_site_settings'
  },
];
