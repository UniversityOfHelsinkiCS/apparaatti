debugRouter.get('/cur/debug', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const realisations = await Cur.findAll({})
  const realisationCodeUrns = realisations.map(r => r.customCodeUrns)
    .filter(u => urnInCustomCodeUrns(u, 'kkt'))
    .flatMap(u => Object.values(u))
    .flat()

  const unique = uniqueVals(realisationCodeUrns)

  res.json(unique)
})

debugRouter.get('/cur', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const { name, codeurn } = req.query

  const nameQuery = name
    ? {
      [Op.or]: [
        { 'name.fi': { [Op.like]: `%${name}%` } },
        { 'name.en': { [Op.like]: `%${name}%` } },
        { 'name.sv': { [Op.like]: `%${name}%` } },
      ],
    }
    : {}

  const curs = await Cur.findAll({ where: nameQuery, raw: true })
  console.log('code urn is: ', codeurn)
  if(codeurn){
    const urnFilteredCourses = curs.filter((cur) => {
      return urnInCustomCodeUrns(cur.customCodeUrns, codeurn)
    })
    return res.json(urnFilteredCourses)
  }
  
  res.json(curs)
})

debugRouter.get('/cu', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }
  const { name, code } = req.query

  const nameQuery = name
    ? {
      [Op.or]: [
        { 'name.fi': { [Op.like]: `%${name}%` } },
        { 'name.en': { [Op.like]: `%${name}%` } },
        { 'name.sv': { [Op.like]: `%${name}%` } },
      ],
    }
    : {}

  const codeQuery = code
    ? {
      courseCode: { [Op.like]: `%${code}%` },
    }
    : {}

  const whereQuery = {
    ...nameQuery,
    ...codeQuery,
  }
  const cus = await Cu.findAll({ where: whereQuery })
  res.json(cus)
})

debugRouter.get('/curcu', async (req, res) => {
  if (!req.user) {
    res.status(404).json({ message: 'User not found' })
    return
  }

  const curcur = await CurCu.findAll()
  res.json(curcus)
})

export default debugRouter
