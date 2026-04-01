import type { Core } from '@strapi/strapi';
import { seed } from './seed';

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      await seed({ strapi });
    } catch (err) {
      console.error('[seed] Seed failed (non-fatal):', err);
    }
  },
};
