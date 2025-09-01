import { generateSampleData } from './generateSampleData';
import sampleData from './sampledata.json';
//this test is used to find cases where there are no recommendations given to the user by suppliying random inputs
describe('Recommender API', () => {
    it(`should return some recommendations`, () => {
      cy.intercept('POST', '/api/form/1/answer').as('getData');      
      cy.visit('/')
      console.log(sampleData)
      cy.log("before")
      const generator = generateSampleData()
      // cy.log("after")
      let iterations  = 0
      while(true){
        const sample = generator.next() 
        if(!sample){
          break
        }
        cy.request('POST', '/api/form/1/answer', sample.value).then((response) => {
        cy.task('log', 'iteration')
        if(response.status === 500){
            cy.task('log', 'FAIL 500')
            cy.task('log', sample)
            cy.task('log', response.status.body)
            return
          }
            expect(response.status).to.eq(200);
            // cy.task('log', response.status.body)
            const body = response.body
            if(body.recommendations.length === 0){
              cy.task('log', 'FAIL NO RECOMMENDATIONS')
              cy.task('log', sample)
              cy.task('log', response.status.body)
            }
            
          // expect(response.body).to.have.property('recommendations');
          // expect(response.body).to.have.property('relevantRecommendations');
          // expect(response.body).to.have.property('userCoordinates');
          // expect(response.body).to.have.property('pointBasedRecommendations');
        })
        cy.wait(50)
        if(iterations > 20000){
          break
        }
        iterations += 1
       // break
      }
    });
});



/*
Helper function here that generates all possible values of sampledata




*/
