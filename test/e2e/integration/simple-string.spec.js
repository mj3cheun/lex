describe('Simple String', () => {
  it('Select from list of predefined tokens and provide string values', () => {
    cy.visit('http://localhost:8080/simple-string.html');

    cy.verifyAssistantOptions(['First Name', 'Last Name']);

    cy.get('[data-test=lex-container] input').type('F');
    cy.verifyAssistantOptions(['First Name'], ['Last Name']);

    // Select First Name suggestion
    cy.get('[data-test=assistant-suggestion]').click();
    cy.get('[data-test=assistant-header]').should('contain', 'Enter a value');

    // Enter a value
    cy.get('[data-test=option-input]').type('Joe{enter}');

    // Verify token
    cy.get('[data-test=token-input]').each(($el, index) => {
      cy.log(index);
      if (index === 0) {
        expect($el.text()).to.contain('First Name');
      }
      if (index === 1) {
        expect($el.text()).to.contain('Joe');
      }
    });
  });
});
