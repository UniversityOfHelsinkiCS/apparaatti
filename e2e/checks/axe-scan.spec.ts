import AxeBuilder from '@axe-core/playwright'
import type { Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'

import { expect, test } from '../fixtures'

type Finding = { state: string; rule: string; impact: string; help: string; target: string; html: string }

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']
const NAMED_ROLE_SELECTOR =
  'button, a[href], input:not([type="hidden"]), select, textarea, summary, [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="tab"], [role="option"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="combobox"], [role="slider"], [role="spinbutton"], [role="textbox"], [role="searchbox"]'
const OUTPUT_DIR = 'gitignored'
const OUTPUT_FILE = `${OUTPUT_DIR}/axe-findings.json`

// The npm script pins --workers=1 so every state accumulates into this one array and
// afterAll can write a single report. Running the project multi-worker would split it.
const findings: Finding[] = []

const toFindings = (violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'], state: string) => {
  const rows: Finding[] = []
  for (const violation of violations) {
    for (const node of violation.nodes) {
      rows.push({
        state,
        rule: violation.id,
        impact: violation.impact ?? 'unknown',
        help: violation.help,
        target: node.target.join(' '),
        html: node.html.replace(/\s+/g, ' ').slice(0, 200),
      })
    }
  }
  return rows
}

async function scan(page: Page, state: string) {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  const stateFindings = [...toFindings(violations, state), ...(await findNamelessElements(page, state))]
  findings.push(...stateFindings)

  expect.soft(stateFindings, report(stateFindings)).toEqual([])
}

// Admin pages are exempt from the full WCAG sweep, but colour contrast still has to hold:
// unreadable text is unreadable regardless of who the page is for. No nameless-element pass
// here, and no other rules.
async function scanContrast(page: Page, state: string) {
  const { violations } = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze()

  const stateFindings = toFindings(violations, state)
  findings.push(...stateFindings)

  expect.soft(stateFindings, report(stateFindings)).toEqual([])
}

// axe drops nodes it considers hidden from screen readers, so a zero-size or empty
// interactive element is never reported by button-name and friends. This pass walks the
// DOM directly and does not care whether the element renders.
async function findNamelessElements(page: Page, state: string): Promise<Finding[]> {
  return page.evaluate(
    ({ selector, state }) => {
      const visibleText = (el: Element): string => {
        if (el.getAttribute('aria-hidden') === 'true') return ''
        let text = ''
        for (const node of Array.from(el.childNodes)) {
          if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? ''
          if (node.nodeType === Node.ELEMENT_NODE) text += visibleText(node as Element)
        }
        return text
      }

      const named = (el: Element): boolean => {
        if (el.getAttribute('aria-label')?.trim()) return true

        const labelledby = (el.getAttribute('aria-labelledby') ?? '').split(/\s+/).filter(Boolean)
        if (labelledby.some(id => visibleText(document.getElementById(id) ?? document.createElement('span')).trim()))
          return true

        if (visibleText(el).trim()) return true
        if (el.getAttribute('title')?.trim()) return true
        if (Array.from(el.querySelectorAll('img[alt], area[alt]')).some(img => img.getAttribute('alt')?.trim()))
          return true
        if (el.querySelector('svg > title')?.textContent?.trim()) return true
        if ((el as HTMLInputElement).labels?.length) return true
        if (el.closest('label') && visibleText(el.closest('label') as Element).trim()) return true
        if (el.tagName === 'INPUT' && ['submit', 'reset'].includes((el as HTMLInputElement).type)) return true
        if (el.tagName === 'INPUT' && (el as HTMLInputElement).value.trim()) return true

        return false
      }

      const excluded = (el: Element): boolean =>
        el.getAttribute('aria-hidden') === 'true' ||
        el.closest('[aria-hidden="true"]') !== null ||
        el.hasAttribute('disabled') ||
        ['presentation', 'none'].includes(el.getAttribute('role') ?? '')

      return Array.from(document.querySelectorAll(selector))
        .filter(el => !excluded(el) && !named(el))
        .map(el => ({
          state,
          rule: 'missing-accessible-name',
          impact: 'serious',
          help: `<${el.tagName.toLowerCase()}> is interactive but has no accessible name (strict DOM pass)`,
          target: el.tagName.toLowerCase() + (el.className ? `.${String(el.className).split(/\s+/)[0]}` : ''),
          html: el.outerHTML.replace(/\s+/g, ' ').slice(0, 200),
        }))
    },
    { selector: NAMED_ROLE_SELECTOR, state }
  )
}

function report(rows: Finding[]): string {
  const byRule = new Map<string, Finding[]>()
  for (const finding of rows) {
    byRule.set(finding.rule, [...(byRule.get(finding.rule) ?? []), finding])
  }

  const order = ['critical', 'serious', 'moderate', 'minor', 'unknown']
  const rules = [...byRule.entries()].sort(
    ([, a], [, b]) => order.indexOf(a[0].impact) - order.indexOf(b[0].impact) || b.length - a.length
  )

  const lines = [`${rows.length} axe violation node(s) across ${new Set(rows.map(f => f.state)).size} state(s)`]
  for (const [rule, items] of rules) {
    lines.push('', `  ${rule} [${items[0].impact}] (${items.length}) - ${items[0].help}`)
    for (const item of items) {
      lines.push(`    - ${item.state}`, `      ${item.target}`, `      ${item.html}`)
    }
  }
  return lines.join('\n')
}

async function useEnglish(page: Page, scope: Page | ReturnType<Page['getByRole']>) {
  await scope.getByTestId('language-selector').click()
  await page.getByRole('option', { name: 'English', exact: true }).click()
}

async function answerWelcomeModal(page: Page) {
  const modal = page.getByRole('dialog')
  await expect(modal).toBeVisible()

  await useEnglish(page, modal)

  await modal.getByTestId('study-field-select').click()
  await page.getByRole('option').first().click()

  await modal.locator('[data-testid^="primary-language-option-"]').first().click()
  await expect(modal).toBeHidden()
}

test.describe('axe wcag scan', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings').catch(() => undefined)
  })

  test.afterAll(() => {
    mkdirSync(OUTPUT_DIR, { recursive: true })
    writeFileSync(OUTPUT_FILE, `${JSON.stringify(findings, null, 2)}\n`)
    console.log(`\n${report(findings)}\n\nWritten to ${OUTPUT_FILE}`)
  })

  test('scan first load, welcome modal open', async ({ page }, testInfo) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toBeVisible()

    await scan(page, testInfo.title)
  })

  test('scan onboarded home, sidebar and recommendations', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)
    await expect(page.getByTestId('sidebar-clear-choices')).toBeVisible()

    await scan(page, testInfo.title)
  })

  test('scan onboarded home, first filter accordion expanded', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const trigger = page.locator('[data-accordion-heading] button').first()
    await expect(trigger).toBeVisible()
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
      await trigger.click()
    }
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await scan(page, testInfo.title)
  })

  test('scan feedback modal with search-data modal stacked on top', async ({ page }, testInfo) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    await page.getByRole('button', { name: 'Send feedback' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'View search data' }).click()
    await expect(page.getByText('Search data preview')).toBeVisible()

    await scan(page, testInfo.title)
  })

  test('scan contrast on the admin overview', async ({ page }, testInfo) => {
    await page.goto('/admin')
    await expect(page.getByText('Suodattimien asetukset')).toBeVisible()

    await scanContrast(page, testInfo.title)
  })

  // The key list and the expanded value table are scanned together because MUI marks the
  // page aria-hidden behind an open dialog, so axe skips everything underneath it. Anything
  // only reachable from the expanded state has to be scanned before a dialog opens.
  test('scan contrast on the backend locales tab, key expanded', async ({ page }, testInfo) => {
    await page.goto('/admin/backend-locales')
    await expect(page.getByRole('button', { name: 'Uusi avain' })).toBeVisible()

    await page
      .getByRole('button', { name: /Näytä avaimen .* tekstit/ })
      .first()
      .click()
    await expect(page.getByRole('button', { name: 'Uusi teksti' })).toBeVisible()

    await scanContrast(page, testInfo.title)
  })

  test('scan contrast on the backend locales text dialog', async ({ page }, testInfo) => {
    await page.goto('/admin/backend-locales')

    await page
      .getByRole('button', { name: /Näytä avaimen .* tekstit/ })
      .first()
      .click()
    await page.getByRole('button', { name: 'Uusi teksti' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()

    // Picking English as the course language makes a completion-type answer impossible, which
    // is the only state that renders the unreachable-combination warning caption.
    await dialog.getByLabel('Haettavan kurssin kieli').click()
    await page.getByRole('option', { name: 'englanti', exact: true }).click()
    await expect(dialog.getByText(/suoritustapaa ei kysytä/)).toBeVisible()

    await scanContrast(page, testInfo.title)
  })
})
