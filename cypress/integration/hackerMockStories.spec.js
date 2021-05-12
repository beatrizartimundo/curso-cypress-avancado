describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'

  context('Mocking the API', () => {
    context('Footer and list of stories', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
        `**/search?query=${initialTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')

        cy.wait('@getStories')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories.json')
        it('shows the right data for all rendered stories', () => {
          // compara se o dado da tela é o mesmo do json
          cy.get('.item')
            .first()
            .should('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)

          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

          cy.get('.item')
            .last()
            .should('contain', stories.hits[1].title)
            .and('contain', stories.hits[1].author)
            .and('contain', stories.hits[1].num_comments)
            .and('contain', stories.hits[1].points)
          cy.get(`.item a:contains(${stories.hits[1].title})`)
            .should('have.attr', 'href', stories.hits[1].url)
        })

        it('shows one less stories after dimissing the first story', () => {
          cy.get('.button-small').first().click()

          cy.get('.item').should('have.length', 1)
        })

        context('Order by', () => {
          it('orders by title', () => {
            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].title)
            cy.get(`.item a:contains(${stories.hits[0].title})`)
              .should('have.attr', 'href', stories.hits[0].url)

            cy.get('@titleHeader').click()
            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].title)
            cy.get(`.item a:contains(${stories.hits[1].title})`)
              .should('have.attr', 'href', stories.hits[1].url)
          })

          it('orders by author', () => {
            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].author)

            cy.get('@authorHeader').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].author)
          })

          it('orders by comments', () => {
            cy.get('.list-header-button:contains(Comments)')
              .as('commentHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].num_comments)

            cy.get('@commentHeader').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].num_comments)
          })

          it('orders by points', () => {
            cy.get('.list-header-button:contains(Points)')
              .as('pointstHeader')
              .click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[0].points)

            cy.get('@pointstHeader').click()

            cy.get('.item')
              .first()
              .should('be.visible')
              .and('contain', stories.hits[1].points)
          })
        })
      })
    })
    context('Search', () => {
      beforeEach(() => {
        cy.intercept(
          'GET',
          `**/search?query=${initialTerm}&page=0`,
          { fixture: 'empty' }
        ).as('getEmptyStories')

        cy.intercept(
          'GET',
        `**/search?query=${newTerm}&page=0`,
        { fixture: 'stories' }
        ).as('getStories')

        cy.visit('/')
        cy.wait('@getEmptyStories')

        cy.get('#search')
          .clear()
      })

      it('types and hits ENTER', () => {
        cy.get('#search').type(`${newTerm}{enter}`)

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search').type(newTerm)
        cy.contains('Submit').click()

        // cy.assertLoadingIsShownAndHidden()
        cy.wait('@getStories')

        cy.get('.item').should('have.length', 2)
        cy.get(`button:contains(${initialTerm})`).should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const faker = require('faker')

          cy.intercept(
            'GET',
            // pega todas as buscas feitas ** após o search
            '**/search**',
            { fixture: 'empty' }
          ).as('getRandomStories')

          Cypress._.times(6, () => {
            cy.get('#search')
              .clear()
              .type(`${faker.random.word()}{enter}`)
            cy.wait('@getRandomStories')
          })

          // cy.assertLoadingIsShownAndHidden()

          cy.get('.last-searches button').should('have.length', 5)
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
