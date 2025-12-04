import { Op } from 'sequelize'

export const getWhereClauseForOneWordSearch = (search: string) => ({
  [Op.or]: [
    {
      username: {
        [Op.iLike]: `${search}%`,
      },
    },
    {
      firstName: {
        [Op.iLike]: `${search}%`,
      },
    },
    {
      lastName: {
        [Op.iLike]: `${search}%`,
      },
    },
    {
      email: {
        [Op.iLike]: `${search}%`,
      },
    },
    {
      studentNumber: {
        [Op.iLike]: `${search}%`,
      },
    },
  ],
})

export const getWhereClauseForTwoWordSearch = (search: string) => {
  const [firstName, lastName] = search.split(' ')
  return {
    [Op.or]: [
      // assume that the first word is the first name and the second word is the last name
      {
        firstName: {
          [Op.iLike]: `%${firstName}%`,
        },
        lastName: {
          [Op.iLike]: `${lastName}%`,
        },
      },
      // assume that both words are the "first name", this is because
      // first name includes middle names as well. Thus this allows
      // for searching with first and middle names
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      // sometimes, users might first type in last name and then first name
      // so we need to account for that as well
      {
        firstName: {
          [Op.iLike]: `${lastName}%`,
        },
        lastName: {
          [Op.iLike]: `${firstName}%`,
        },
      },
    ],
  }
}

export const getWhereClauseForManyWordSearch = (search: string) => {
  const searchedWords = search.split(' ')
  const [lastName1, ...firstNames1] = searchedWords
  // treat the last word in searchedWords as lastName2 and
  // the rest as firstNames2 i.e. equivalent to
  // const [...firstNames2, lastName2] = searchedWords
  // if it'd be possible in JS :)
  const lastName2 = searchedWords[searchedWords.length - 1]
  const firstNames2 = searchedWords.slice(0, searchedWords.length - 1)

  return {
    [Op.or]: [
      {
        firstName: {
          [Op.iLike]: `${searchedWords}%`,
        },
      },
      {
        firstName: {
          [Op.iLike]: `${firstNames1.join(' ')}%`,
        },
        lastName: {
          [Op.iLike]: `${lastName1}%`,
        },
      },
      {
        firstName: {
          [Op.iLike]: `${firstNames2.join(' ')}%`,
        },
        lastName: {
          [Op.iLike]: `${lastName2}%`,
        },
      },
    ],
  }
}
