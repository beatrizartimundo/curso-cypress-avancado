describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Hitting the real API', () => {
    beforeEach(() => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }
      }).as('getStories')

      cy.visit('/')
      cy.wait('@getStories')
    })

    it('shows the footer', () => {
      cy.get('footer')
        .should('be.visible')
        .and('contain', 'Icons made by Freepik from www.flaticon.com')
    })

    context('List of stories', () => {
      it('shows one less stories after dimissing the first story', () => {
        cy.get('.button-small').first().click()

        cy.get('.item').should('have.length', 19)
      })

      it('searches via the last searched term', () => {
        cy.intercept(
          'GET',
          `**/search?query=${newTerm}&page=0`
        ).as('getNewTerm')

        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(`${newTerm}{enter}`)

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getNewTerm')

        cy.getLocalStorage('search')
          .should('be.equal', newTerm)

        cy.get(`button:contains(${initialTerm})`).should('be.visible').click()

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.getLocalStorage('search')
          .should('be.equal', initialTerm)

        cy.get('.item').should('have.length', 20)
        cy.get('.item').first().should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`).should('be.visible')
      })

      // Since the API is external,
      // I can't control what it will provide to the frontend,
      // and so, how can I test ordering?
      // This is why these tests are being skipped.
      // TODO: Find a way to test them out.

      context('Search', () => {
        beforeEach(() => {
          cy.intercept(
            'GET',
        `**/search?query=${newTerm}&page=0`
          ).as('getNewTerm')

          cy.get('#search').clear()
        })

        it('types and hits ENTER', () => {
          cy.get('#search').type(`${newTerm}{enter}`)

          // cy.assertLoadingIsShownAndHidden()
          cy.wait('@getNewTerm')

          cy.getLocalStorage('search')
            .should('be.equal', newTerm)

          cy.get('.item').should('have.length', 20)
          cy.get('.item').first().should('contain', newTerm)
          cy.get(`button:contains(${initialTerm})`).should('be.visible')
        })

        it('types and clicks the submit button', () => {
          cy.get('#search').type(newTerm)
          cy.contains('Submit').click()

          // cy.assertLoadingIsShownAndHidden()
          cy.wait('@getNewTerm')

          cy.get('.item').should('have.length', 20)
          cy.get('.item').first().should('contain', newTerm)
          cy.get(`button:contains(${initialTerm})`).should('be.visible')
        })

        // exemplo extra credit 3 de submit porem não é a forma que o usuario realiza
        // it('types and submits the form directly', () => {
        //   cy.get('#search')
        //     .type(newTerm)
        //   cy.get('form').submit()
        //   cy.wait('@getNewTerm')
        //   cy.get('.item').should('have.length', 20)

        // })

        context('Last searches', () => {
          it('shows a max of 5 buttons for the last searched terms', () => {
            const faker = require('faker')

            cy.intercept({
              method: 'GET',
              // pega todas as buscas feitas ** após o search
              pathname: '**/search**'
            }).as('getRandomStories')

            Cypress._.times(6, () => {
              cy.get('#search').clear().type(`${faker.random.word()}{enter}`)
              cy.wait('@getRandomStories')
            })

            // cy.assertLoadingIsShownAndHidden()

            cy.get('.last-searches button').should('have.length', 5)
          })
        })
      })
    })
  })
})
context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', { statusCode: 500 }).as('getServerFail')

    cy.visit('/')
    cy.wait('@getServerFail')

    cy.get('p:contains(Something went wrong)').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', { forceNetworkError: true }).as(
      'getNetworkFailure'
    )

    cy.visit('/')
    cy.wait('@getNetworkFailure')
    cy.get('p:contains(Something went wrong)').should('be.visible')
  })
})
