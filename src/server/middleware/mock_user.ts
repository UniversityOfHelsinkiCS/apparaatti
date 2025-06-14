const mockUser = {
  id: 'hy-hlo-135753688',
  username: 'hy-hlo-testuser',
  firstName: 'Testi',
  lastName: 'Kayttaja',
  email: 'grp-toska@helsinki.fi',
  language: 'fi',
  isAdmin: true,
  iamGroups: ['grp-toska'],
}

const mockUserMiddleware = (req, _, next) => {
  console.log('Mock user middleware in use')

  if (req.path.includes('/login')) return next()

  req.user = mockUser

  return next()
}

export default mockUserMiddleware
