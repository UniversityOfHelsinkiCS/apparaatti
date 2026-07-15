/**
 * Seed data for the filters table.
 *
 * Filter definitions are loaded from ../../../data/filter-config.json, a checked-in export
 * of the production filter configuration (produced by the admin panel's "Export Configuration"
 * button / GET /api/admin/filter-config/export). This keeps dev/e2e filters in sync with what's
 * actually configured in production instead of drifting from a hand-maintained copy.
 *
 * Run as part of seedDatabase() in development/e2e, or as a standalone one-off script
 * in production when first deploying the filters table.
 */

import { readFileSync } from 'fs'
import path from 'path'

import type { FilterConfig } from '../../common/types.ts'
import { FilterConfigImportSchema } from '../../common/validators.ts'
import logger from '../util/logger.ts'
import Filter from './models/filter.ts'

type FilterSeed = Omit<FilterConfig, 'enabled'> & { enabled: boolean }

const loadFilterSeeds = (): FilterSeed[] => {
  const filePath = path.resolve(import.meta.dirname, '../../../data/filter-config.json')
  const raw = JSON.parse(readFileSync(filePath, 'utf-8'))
  const parsed = FilterConfigImportSchema.parse(raw)

  return parsed.filters.map(filter => ({
    ...filter,
    explanation: filter.explanation ?? undefined,
    extraInfo: filter.extraInfo ?? undefined,
    parentFilterId: filter.parentFilterId ?? null,
    displayType: filter.displayType ?? null,
    coordinateKey: filter.coordinateKey ?? null,
  }))
}

const FILTER_SEEDS: FilterSeed[] = loadFilterSeeds()

export function seedFilterWithId(id: string): FilterSeed | null {
  const seed = FILTER_SEEDS.find(filter => filter.id === id)
  return seed ? structuredClone(seed) : null
}

export async function seedFilters() {
  logger.info('Seeding filters...')
  const existing = await Filter.count()
  if (existing > 0) {
    logger.info(`Filters table already has ${existing} rows, skipping seed`)
    return
  }

  const parents = FILTER_SEEDS.filter(f => !f.parentFilterId)
  const children = FILTER_SEEDS.filter(f => f.parentFilterId)

  for (const filter of [...parents, ...children]) {
    await Filter.create(filter as any)
  }

  logger.info(`Seeded ${FILTER_SEEDS.length} filters`)
}
