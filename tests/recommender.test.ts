import recommendCourses from '../src/server/util/recommender'
describe('testing index file', () => {
  test('passes', () => {
    const sampleAnswerData = {
        "study-field-select": "H57",
        "primary-language": "fi",
        "lang-1": "sv",
        "previusly-done-lang": "0",
        "study-period": ["period_1", "period_2", "period_3"],
        "replacement": "0",
        "mentoring": "1",
        "challenge": "1",
        "graduation": "0",
        "study-place": "hybrid",
        "integrated": "0",
        "independent": "1",
        "flexible": "1"
    }
    recommendCourses(sampleAnswerData)
    expect(true === true)
  });
});
