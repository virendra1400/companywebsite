import * as migration_20260716_120723_init from './20260716_120723_init';
import * as migration_20260716_130814_site_settings from './20260716_130814_site_settings';
import * as migration_20260716_135113_contact_settings from './20260716_135113_contact_settings';
import * as migration_20260716_143757_media_no_sizes from './20260716_143757_media_no_sizes';
import * as migration_20260723_092747_phase5_seo_insights from './20260723_092747_phase5_seo_insights';
import * as migration_20260724_093617_phase7_homepage_narrative_blocks from './20260724_093617_phase7_homepage_narrative_blocks';
import * as migration_20260729_002548_phase8_faq_block from './20260729_002548_phase8_faq_block';
import * as migration_20260730_135645_favicon_field from './20260730_135645_favicon_field';
import * as migration_20260730_161400_users_api_key from './20260730_161400_users_api_key';
import * as migration_20260730_170943_site_settings_hero_factory from './20260730_170943_site_settings_hero_factory';
import * as migration_20260801_121552_site_settings_legal_identity from './20260801_121552_site_settings_legal_identity';
import * as migration_20260801_145559_t103_cms_content_model from './20260801_145559_t103_cms_content_model';
import * as migration_20260801_154416_t104_export_map_intro from './20260801_154416_t104_export_map_intro';
import * as migration_20260802_030931_t106_cert_logo_optional from './20260802_030931_t106_cert_logo_optional';

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
    name: '20260729_002548_phase8_faq_block',
  },
  {
    up: migration_20260730_135645_favicon_field.up,
    down: migration_20260730_135645_favicon_field.down,
    name: '20260730_135645_favicon_field',
  },
  {
    up: migration_20260730_161400_users_api_key.up,
    down: migration_20260730_161400_users_api_key.down,
    name: '20260730_161400_users_api_key',
  },
  {
    up: migration_20260730_170943_site_settings_hero_factory.up,
    down: migration_20260730_170943_site_settings_hero_factory.down,
    name: '20260730_170943_site_settings_hero_factory',
  },
  {
    up: migration_20260801_121552_site_settings_legal_identity.up,
    down: migration_20260801_121552_site_settings_legal_identity.down,
    name: '20260801_121552_site_settings_legal_identity',
  },
  {
    up: migration_20260801_145559_t103_cms_content_model.up,
    down: migration_20260801_145559_t103_cms_content_model.down,
    name: '20260801_145559_t103_cms_content_model',
  },
  {
    up: migration_20260801_154416_t104_export_map_intro.up,
    down: migration_20260801_154416_t104_export_map_intro.down,
    name: '20260801_154416_t104_export_map_intro',
  },
  {
    up: migration_20260802_030931_t106_cert_logo_optional.up,
    down: migration_20260802_030931_t106_cert_logo_optional.down,
    name: '20260802_030931_t106_cert_logo_optional'
  },
];
