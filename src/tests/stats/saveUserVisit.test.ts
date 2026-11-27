import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../server/util/dbActions/userVisits.ts', () => ({
  createUserVisitsEntry: vi.fn(),
  getUserVisitsByUser: vi.fn(),
}))

vi.mock('../../server/util/dbActions/studyRights.ts', () => ({
  studyRightsForPersonId: vi.fn(),
}))

vi.mock('../../server/util/dbActions/organisations.ts', () => ({
  organisationsWithIds: vi.fn(),
}))

vi.mock('../../server/util/dev.ts', () => ({
  localLog: vi.fn(),
}))

import type { User } from '../../common/types.ts'
import { organisationsWithIds } from '../../server/util/dbActions/organisations.ts'
import { studyRightsForPersonId } from '../../server/util/dbActions/studyRights.ts'
import { createUserVisitsEntry, getUserVisitsByUser } from '../../server/util/dbActions/userVisits.ts'
import { getUserVisitsAtHour, hashUser, saveUserVisitIfUnique } from '../../server/util/userVisitHelpers.ts'

const userWithGroups = (groups: string[]): User =>
  ({ id: 'hy-hlo-1', username: 'student', hyGroupCn: groups }) as unknown as User

const student = userWithGroups([])
const kielikeskusAdmin = userWithGroups(['hy-kielikeskus-employees'])
const superuser = userWithGroups(['grp-toska'])

describe('saveUserVisitIfUnique', () => {
  beforeEach(() => {
    vi.mocked(getUserVisitsByUser).mockReset().mockResolvedValue([])
    vi.mocked(createUserVisitsEntry).mockReset()
    vi.mocked(studyRightsForPersonId).mockReset().mockResolvedValue([])
    vi.mocked(organisationsWithIds).mockReset().mockResolvedValue([])
  })

  it('records a visit for a student with no groups', async () => {
    await saveUserVisitIfUnique(student)

    expect(createUserVisitsEntry).toHaveBeenCalledTimes(1)
  })

  it('skips an admin, so admin traffic never reaches the stats', async () => {
    await saveUserVisitIfUnique(kielikeskusAdmin)

    expect(getUserVisitsByUser).not.toHaveBeenCalled()
    expect(createUserVisitsEntry).not.toHaveBeenCalled()
  })

  it('skips a superuser', async () => {
    await saveUserVisitIfUnique(superuser)

    expect(createUserVisitsEntry).not.toHaveBeenCalled()
  })

  it('does not record a second visit when one already exists in the hour', async () => {
    vi.mocked(getUserVisitsByUser).mockResolvedValue([{ id: 1 }] as never)

    await saveUserVisitIfUnique(student)

    expect(createUserVisitsEntry).not.toHaveBeenCalled()
  })

  it('stores the hash rather than the user id', async () => {
    await saveUserVisitIfUnique(student)

    const [visitorHashHex] = vi.mocked(createUserVisitsEntry).mock.calls[0]
    expect(visitorHashHex).not.toContain(student.id)
    expect(visitorHashHex).toBe(await hashUser(student))
  })

  it('carries the study data of the first study right onto the entry', async () => {
    vi.mocked(studyRightsForPersonId).mockResolvedValue([
      {
        organisationId: 'org-1',
        educationPhase1: { code: 'KH50', name: { fi: 'Matematiikka' } },
        educationPhase2: null,
      },
    ] as never)
    vi.mocked(organisationsWithIds).mockResolvedValue([{ code: 'H50' }] as never)

    await saveUserVisitIfUnique(student)

    const [, , studyData] = vi.mocked(createUserVisitsEntry).mock.calls[0]
    expect(studyData).toEqual({
      organisationCode: 'H50',
      phase1ProgrammeCode: 'KH50',
      phase1ProgrammeName: { fi: 'Matematiikka' },
      phase2ProgrammeCode: null,
      phase2ProgrammeName: null,
    })
  })
})

describe('getUserVisitsAtHour', () => {
  beforeEach(() => {
    vi.mocked(getUserVisitsByUser).mockReset().mockResolvedValue([])
  })

  it('asks for the whole UTC hour the time falls in, not the hour from that minute', async () => {
    await getUserVisitsAtHour('hash', new Date('2026-02-20T10:47:31.250Z'))

    const [, start, end] = vi.mocked(getUserVisitsByUser).mock.calls[0]
    expect(start.toISOString()).toBe('2026-02-20T10:00:00.000Z')
    expect(end.toISOString()).toBe('2026-02-20T11:00:00.000Z')
  })

  it('rolls over the date when the visit is in the last UTC hour of the day', async () => {
    await getUserVisitsAtHour('hash', new Date('2026-02-20T23:59:59.999Z'))

    const [, start, end] = vi.mocked(getUserVisitsByUser).mock.calls[0]
    expect(start.toISOString()).toBe('2026-02-20T23:00:00.000Z')
    expect(end.toISOString()).toBe('2026-02-21T00:00:00.000Z')
  })
})
