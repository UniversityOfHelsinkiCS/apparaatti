type WithGroups = { hyGroupCn?: string[] | null }

export const isSuperuser = (user: WithGroups) => {
  const groups = user?.hyGroupCn
  if (!groups) {
    return false
  }
  return groups.includes('grp-toska')
}

export const isAdmin = (user: WithGroups) => {
  const groups = user?.hyGroupCn
  if (!groups) {
    return false
  }
  return (
    groups?.includes('hy-kielikeskus-employees') ||
    groups?.includes('grp-toska') ||
    groups?.includes('grp-a90600-opintot')
  )
}
