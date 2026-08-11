import type { DashboardConfig } from '@canshift/core'
import { DEFAULT_PAGE_PALETTE, CURRENT_SCHEMA_VERSION, DashboardConfigSchema } from '@canshift/core'
import simConfigJson from './default-sim-config.json'

export const DEFAULT_SIM_CONFIG = DashboardConfigSchema.parse({
  ...simConfigJson,
  version: CURRENT_SCHEMA_VERSION,
  pages: simConfigJson.pages.map((page) => ({ ...page, palette: { ...DEFAULT_PAGE_PALETTE } })),
}) as DashboardConfig
