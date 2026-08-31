import type { Page } from '@playwright/test'

import { expect, test } from '../fixtures'

type Violation = { rule: string; detail: string; html: string }

const FLOW_IN_BUTTON =
  'button div, button p, button ul, button ol, button li, button h1, button h2, button h3, button h4, button h5, button h6, button form, button section, button article'
const INTERACTIVE_IN_BUTTON =
  'button button, button a, button input, button select, button textarea, button [tabindex]'
const FLOW_IN_PHRASING = 'label div, label p, a div, a p'
const ARIA_REFERENCE_ATTRIBUTES = ['aria-labelledby', 'aria-controls', 'aria-describedby', 'aria-owns']

async function findViolations(page: Page): Promise<Violation[]> {
  return page.evaluate(
    ({ nestingRules, ariaAttributes }) => {
      const snippet = (el: Element) => el.outerHTML.replace(/\s+/g, ' ').slice(0, 180)
      const found: Violation[] = []

      for (const [rule, selector] of nestingRules) {
        for (const el of Array.from(document.querySelectorAll(selector))) {
          found.push({
            rule,
            detail: `<${el.tagName.toLowerCase()}> inside <${el.parentElement?.closest('button, label, a')?.tagName.toLowerCase() ?? '?'}>`,
            html: snippet(el),
          })
        }
      }

      const byId = new Map<string, Element[]>()
      for (const el of Array.from(document.querySelectorAll('[id]'))) {
        if (!el.id) continue
        byId.set(el.id, [...(byId.get(el.id) ?? []), el])
      }
      for (const [id, elements] of byId) {
        if (elements.length > 1) {
          found.push({
            rule: 'duplicate-id',
            detail: `id="${id}" used ${elements.length} times`,
            html: elements.map(snippet).join('\n      '),
          })
        }
      }

      for (const attribute of ariaAttributes) {
        for (const el of Array.from(document.querySelectorAll(`[${attribute}]`))) {
          const missing = (el.getAttribute(attribute) ?? '')
            .split(/\s+/)
            .filter(Boolean)
            .filter(token => !document.getElementById(token))
          if (missing.length > 0) {
            found.push({
              rule: 'dangling-aria-reference',
              detail: `${attribute}="${missing.join(' ')}" matches no element`,
              html: snippet(el),
            })
          }
        }
      }

      return found
    },
    {
      nestingRules: [
        ['flow-content-in-button', FLOW_IN_BUTTON],
        ['interactive-content-in-button', INTERACTIVE_IN_BUTTON],
        ['flow-content-in-phrasing-context', FLOW_IN_PHRASING],
      ] as [string, string][],
      ariaAttributes: ARIA_REFERENCE_ATTRIBUTES,
    }
  )
}

function formatReport(state: string, violations: Violation[]): string {
  const byRule = new Map<string, Violation[]>()
  for (const violation of violations) {
    byRule.set(violation.rule, [...(byRule.get(violation.rule) ?? []), violation])
  }

  const lines = [`${violations.length} markup violation(s) while: ${state}`]
  for (const [rule, items] of byRule) {
    lines.push('', `  ${rule} (${items.length})`)
    for (const item of items) {
      lines.push(`    - ${item.detail}`, `      ${item.html}`)
    }
  }
  return lines.join('\n')
}

async function expectValidMarkup(page: Page, state: string) {
  const violations = await findViolations(page)
  expect.soft(violations, formatReport(state, violations)).toEqual([])
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

test.describe('markup validity', () => {
  test.beforeEach(async ({ request }) => {
    await request.get('/api/debug/reset/settings').catch(() => undefined)
  })

  test('welcome modal on first load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('dialog')).toBeVisible()

    await expectValidMarkup(page, 'welcome modal open on first load')
  })

  test('sidebar and recommendations after onboarding', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)
    await expect(page.getByTestId('sidebar-clear-choices')).toBeVisible()

    await expectValidMarkup(page, 'sidebar and results after answering the welcome modal')
  })

  test('expanded filter accordion', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    const trigger = page.locator('[data-accordion-heading] button').first()
    await expect(trigger).toBeVisible()
    if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
      await trigger.click()
    }
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await expectValidMarkup(page, 'a filter accordion expanded')
  })

  test('stacked feedback modals', async ({ page }) => {
    await page.goto('/')
    await answerWelcomeModal(page)

    await page.getByRole('button', { name: 'Send feedback' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: 'View search data' }).click()
    await expect(page.getByText('Search data preview')).toBeVisible()

    await expectValidMarkup(page, 'feedback modal with the search-data modal stacked on top')
  })
})
