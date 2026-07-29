import * as migration_20260716_120723_init from './20260716_120723_init';
import * as migration_20260716_130814_site_settings from './20260716_130814_site_settings';
import * as migration_20260716_135113_contact_settings from './20260716_135113_contact_settings';
import * as migration_20260716_143757_media_no_sizes from './20260716_143757_media_no_sizes';
import * as migration_20260723_092747_phase5_seo_insights from './20260723_092747_phase5_seo_insights';
import * as migration_20260724_093617_phase7_homepage_narrative_blocks from './20260724_093617_phase7_homepage_narrative_blocks';
import * as migration_20260729_002548_phase8_faq_block from './20260729_002548_phase8_faq_block';

export const migrations = [
  {
    up: migration_20260716_120723_init.up,
    down: migration_20260716_120723_init.down,
    name: '20260716_120723_init',
  },
  {
    up: migration_20260716_130814_site_settings.up,
    down: migration_20260716_130814_site_settings.down,
    name: '20260716_130814_site_settings',
  },
  {
    up: migration_20260716_135113_contact_settings.up,
    down: migration_20260716_135113_contact_settings.down,
    name: '20260716_135113_contact_settings',
  },
  {
    up: migration_20260716_143757_media_no_sizes.up,
    down: migration_20260716_143757_media_no_sizes.down,
    name: '20260716_143757_media_no_sizes',
  },
  {
    up: migration_20260723_092747_phase5_seo_insights.up,
    down: migration_20260723_092747_phase5_seo_insights.down,
    name: '20260723_092747_phase5_seo_insights',
  },
  {
    up: migration_20260724_093617_phase7_homepage_narrative_blocks.up,
    down: migration_20260724_093617_phase7_homepage_narrative_blocks.down,
    name: '20260724_093617_phase7_homepage_narrative_blocks',
  },
  {
    up: migration_20260729_002548_phase8_faq_block.up,
    down: migration_20260729_002548_phase8_faq_block.down,
    name: '20260729_002548_phase8_faq_block'
  },
];
