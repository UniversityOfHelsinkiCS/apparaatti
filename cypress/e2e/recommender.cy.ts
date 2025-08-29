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
      while(true){
        const sample = generator.next() 
        if(!sample){
          break
        }
        cy.task('log', sample)
        cy.request('POST', '/api/form/1/answer', sample.value).then((response) => {
          if(response.status === 500){
            return
          }
           expect(response.status).to.eq(200);
            cy.task('log', response.status.body)

            
          // expect(response.body).to.have.property('recommendations');
          // expect(response.body).to.have.property('relevantRecommendations');
          // expect(response.body).to.have.property('userCoordinates');
          // expect(response.body).to.have.property('pointBasedRecommendations');
        })
        cy.wait(1000)
       // break
      }
    });
});



/*
Helper function here that generates all possible values of sampledata




*/
