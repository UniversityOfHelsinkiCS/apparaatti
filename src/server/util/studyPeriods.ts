//source: https://studies.helsinki.fi/ohjeet/artikkeli/lukuvuosi-ja-opetusperiodit?check_logged_in=1#degree_students and  https://studies.helsinki.fi/ohjeet/node/314

const dateIsInPeriod = (date: Date, period) => {
  const start = parseDate(period.start_date)
  const end = parseDate(period.end_date)
  return date >= start && date <= end
}


const parseDate = (date: string) =>  {
  const [day, month, year] = date.split(".").map(Number)
  return new Date(year, month - 1, day)
}

export const dateToPeriod = (date: string) => {
  const dateObj = parseDate(date)
  let hits = []
  studyPeriods.years.forEach(year => {
    year.periods.forEach((period) => {
      if(dateIsInPeriod(dateObj, period)){
        hits.push(period)
      }
    })
  })

 
  return hits
}


const studyPeriods = {
  years: [
    {
      start_year: '2024',
      end_year: '2025',
      periods: [
        {
          name: 'intensive_1',
          start_date: '26.8.2024',
          end_date: '1.9.2024',
        },
        {
          name: 'period_1',
          start_date: '2.9.2024',
          end_date: '20.10.2024',
        },
        {
          name: 'exam_week_1',
          start_date: '21.10.2024',
          end_date: '27.10.2024',
        },
        {
          name: 'period_2',
          start_date: '28.10.2024',
          end_date: '15.12.2024',
        },
        {
          name: 'exam_week_2',
          start_date: '16.12.2024',
          end_date: '22.12.2024',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2025',
          end_date: '12.1.2025',
        },
        {
          name: 'period_3',
          start_date: '13.1.2025',
          end_date: '2.3.2025',
        },
        {
          name: 'exam_week_3',
          start_date: '3.3.2025',
          end_date: '9.3.2025',
        },
        {
          name: 'period_4',
          start_date: '10.3.2025',
          end_date: '4.5.2025',
        },
        {
          name: 'exam_week_4',
          start_date: '5.5.2025',
          end_date: '11.5.2025',
        },
        {
          name: 'intensive_3',
          start_date: '5.5.2025',
          end_date: '31.5.2025',
        }
      ]
    },
    { 
      start_year: '2025',
      end_year: '2026',
      periods: [
        {
          name: 'intensive_1',
          start_date: '25.8.2025',
          end_date: '31.8.2025',
        },
        {
          name: 'period_1',
          start_date: '1.9.2025',
          end_date: '19.10.2025',
        },
        {
          name: 'exam_week_1',
          start_date: '20.10.2025',
          end_date: '26.10.2025',
        },
        {
          name: 'period_2',
          start_date: '27.10.2025',
          end_date: '14.12.2025',
        },
        {
          name: 'exam_week_2',
          start_date: '15.12.2025',
          end_date: '21.12.2025',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2026',
          end_date: '11.1.2026',
        },
        {
          name: 'period_3',
          start_date: '12.1.2026',
          end_date: '1.3.2026',
        },
        {
          name: 'exam_week_3',
          start_date: '2.3.2026',
          end_date: '8.3.2026',
        },
        {
          name: 'period_4',
          start_date: '9.3.2026',
          end_date: '3.5.2026',
        },
        {
          name: 'exam_week_4',
          start_date: '4.5.2026',
          end_date: '10.5.2026',
        },
        {
          name: 'intensive_3',
          start_date: '4.5.2026',
          end_date: '31.5.2026',
        }
      ]
    },
    {
      start_year: '2026',
      end_year: '2027',
      periods: [
        {
          name: 'intensive_1',
          start_date: '24.8.2026',
          end_date: '30.8.2026',
        },
        {
          name: 'period_1',
          start_date: '31.8.2026',
          end_date: '18.10.2026',
        },
        {
          name: 'exam_week_1',
          start_date: '19.10.2026',
          end_date: '25.10.2026',
        },
        {
          name: 'period_2',
          start_date: '26.10.2026',
          end_date: '13.12.2026',
        },
        {
          name: 'exam_week_2',
          start_date: '14.12.2026',
          end_date: '20.12.2026',
        },
        {
          name: 'intensive_2',
          start_date: '4.1.2027',
          end_date: '17.1.2027',
        },
        {
          name: 'period_3',
          start_date: '18.1.2027',
          end_date: '7.3.2027',
        },
        {
          name: 'exam_week_3',
          start_date: '8.3.2027',
          end_date: '14.3.2027',
        },
        {
          name: 'period_4',
          start_date: '15.3.2027',
          end_date: '9.5.2027',
        },
        {
          name: 'exam_week_4',
          start_date: '10.5.2027',
          end_date: '16.5.2027',
        },
        {
          name: 'intensive_3',
          start_date: '10.5.2027',
          end_date: '31.5.2027',
        }
      ]
    },
    {
      start_year: '2027',
      end_year: '2028',
      periods: [
        {
          name: 'intensive_1',
          start_date: '30.8.2027',
          end_date: '5.9.2027',
        },
        {
          name: 'period_1',
          start_date: '6.9.2027',
          end_date: '24.10.2027',
        },
        {
          name: 'exam_week_1',
          start_date: '25.10.2027',
          end_date: '31.10.2027',
        },
        {
          name: 'period_2',
          start_date: '1.11.2027',
          end_date: '19.12.2027',
        },
        {
          name: 'exam_week_2',
          start_date: '20.12.2027',
          end_date: '23.12.2027',
        },
        {
          name: 'intensive_2',
          start_date: '3.1.2028',
          end_date: '16.1.2028',
        },
        {
          name: 'period_3',
          start_date: '17.1.2028',
          end_date: '5.3.2028',
        },
        {
          name: 'exam_week_3',
          start_date: '6.3.2028',
          end_date: '12.3.2028',
        },
        {
          name: 'period_4',
          start_date: '13.3.2028',
          end_date: '7.5.2028',
        },
        {
          name: 'exam_week_4',
          start_date: '8.5.2028',
          end_date: '14.5.2028',
        },
        {
          name: 'intensive_3',
          start_date: '8.5.2028',
          end_date: '31.5.2028',
        }
      ]
    },
    {
      start_year: '2028',
      end_year: '2029',
      periods: [
        {
          name: 'intensive_1',
          start_date: '28.8.2028',
          end_date: '3.9.2028',
        },
        {
          name: 'period_1',
          start_date: '4.9.2028',
          end_date: '22.10.2028',
        },
        {
          name: 'exam_week_1',
          start_date: '23.10.2028',
          end_date: '29.10.2028',
        },
        {
          name: 'period_2',
          start_date: '30.10.2028',
          end_date: '17.12.2028',
        },
        {
          name: 'exam_week_2',
          start_date: '18.12.2028',
          end_date: '23.12.2028',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2029',
          end_date: '14.1.2029',
        },
        {
          name: 'period_3',
          start_date: '15.1.2029',
          end_date: '4.3.2029',
        },
        {
          name: 'exam_week_3',
          start_date: '5.3.2029',
          end_date: '11.3.2029',
        },
        {
          name: 'period_4',
          start_date: '12.3.2029',
          end_date: '6.5.2029',
        },
        {
          name: 'exam_week_4',
          start_date: '7.5.2029',
          end_date: '13.5.2029',
        },
        {
          name: 'intensive_3',
          start_date: '7.5.2029',
          end_date: '31.5.2029',
        }
      ]
    },
    {
      start_year: '2029',
      end_year: '2030',
      periods: [
        {
          name: 'intensive_1',
          start_date: '27.8.2029',
          end_date: '2.9.2029',
        },
        {
          name: 'period_1',
          start_date: '3.9.2029',
          end_date: '21.10.2029',
        },
        {
          name: 'exam_week_1',
          start_date: '22.10.2029',
          end_date: '28.10.2029',
        },
        {
          name: 'period_2',
          start_date: '29.10.2029',
          end_date: '16.12.2029',
        },
        {
          name: 'exam_week_2',
          start_date: '17.12.2029',
          end_date: '23.12.2029',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2030',
          end_date: '13.1.2030',
        },
        {
          name: 'period_3',
          start_date: '14.1.2030',
          end_date: '3.3.2030',
        },
        {
          name: 'exam_week_3',
          start_date: '4.3.2030',
          end_date: '10.3.2030',
        },
        {
          name: 'period_4',
          start_date: '11.3.2030',
          end_date: '5.5.2030',
        },
        {
          name: 'exam_week_4',
          start_date: '6.5.2030',
          end_date: '12.5.2030',
        },
        {
          name: 'intensive_3',
          start_date: '6.5.2030',
          end_date: '31.5.2030',
        }
      ]
    },
    {
      start_year: '2030',
      end_year: '2031',
      periods: [
        {
          name: 'intensive_1',
          start_date: '26.8.2030',
          end_date: '1.9.2030',
        },
        {
          name: 'period_1',
          start_date: '2.9.2030',
          end_date: '20.10.2030',
        },
        {
          name: 'exam_week_1',
          start_date: '21.10.2030',
          end_date: '27.10.2030',
        },
        {
          name: 'period_2',
          start_date: '28.10.2030',
          end_date: '15.12.2030',
        },
        {
          name: 'exam_week_2',
          start_date: '16.12.2030',
          end_date: '22.12.2030',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2031',
          end_date: '12.1.2031',
        },
        {
          name: 'period_3',
          start_date: '13.1.2031',
          end_date: '2.3.2031',
        },
        {
          name: 'exam_week_3',
          start_date: '3.3.2031',
          end_date: '9.3.2031',
        },
        {
          name: 'period_4',
          start_date: '10.3.2031',
          end_date: '4.5.2031',
        },
        {
          name: 'exam_week_4',
          start_date: '5.5.2031',
          end_date: '11.5.2031',
        },
        {
          name: 'intensive_3',
          start_date: '5.5.2031',
          end_date: '31.5.2031',
        }
      ]
    },
    {
      start_year: '2031',
      end_year: '2032',
      periods: [
        {
          name: 'intensive_1',
          start_date: '25.8.2031',
          end_date: '31.8.2031',
        },
        {
          name: 'period_1',
          start_date: '1.9.2031',
          end_date: '19.10.2031',
        },
        {
          name: 'exam_week_1',
          start_date: '20.10.2031',
          end_date: '26.10.2031',
        },
        {
          name: 'period_2',
          start_date: '27.10.2031',
          end_date: '14.12.2031',
        },
        {
          name: 'exam_week_2',
          start_date: '15.12.2031',
          end_date: '21.12.2031',
        },
        {
          name: 'intensive_2',
          start_date: '2.1.2032',
          end_date: '11.1.2032',
        },
        {
          name: 'period_3',
          start_date: '12.1.2032',
          end_date: '29.2.2032',
        },
        {
          name: 'exam_week_3',
          start_date: '1.3.2032',
          end_date: '7.3.2032',
        },
        {
          name: 'period_4',
          start_date: '8.3.2032',
          end_date: '2.5.2032',
        },
        {
          name: 'exam_week_4',
          start_date: '3.5.2032',
          end_date: '9.5.2032',
        },
        {
          name: 'intensive_3',
          start_date: '10.5.2032',
          end_date: '31.5.2032',
        }
      ]
    }
  ]
}

export default studyPeriods