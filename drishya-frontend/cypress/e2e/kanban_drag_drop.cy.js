// cypress/e2e/kanban_drag_drop.cy.js
describe('Kanban Board Drag and Drop', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/login');
    cy.get('input[type="email"]').type('sravs@gmail.com');
    cy.get('input[type="password"]').type('12345678');
    cy.get('button[type="submit"]').click();
    cy.url({timeout: 10000}).should('eq', 'http://localhost:5173/');
    cy.visit('http://localhost:5173/kanban');
    cy.get('.loader', { timeout: 15000 }).should('not.exist');
    cy.contains('h3', '📋 To Do').should('be.visible');
  });

  it('should drag a To Do task to Done column', () => {
  cy.visit('http://localhost:5173/login');
  cy.get('input[type="email"]').type('sravs@gmail.com');
  cy.get('input[type="password"]').type('12345678');
  cy.get('button[type="submit"]').click();
  cy.url({timeout: 10000}).should('eq', 'http://localhost:5173/');
  cy.visit('http://localhost:5173/kanban');
  cy.get('.loader', { timeout: 10000 }).should('not.exist');
  cy.contains('h3', '📋 To Do').should('be.visible');

  cy.get('.task-card h4').first().invoke('text').then(taskTitle => {
    // Real mouse events for DnD-kit
    cy.contains('.task-card h4', taskTitle)
      .parents('.task-card')
      .realMouseDown();
    // Move to Done column, use test id
    cy.get('[data-testid="kanban-done-column"]')
      .realMouseMove()
      .realMouseUp();
    cy.wait(1500);
    // Assertion for card in Done
    cy.get('[data-testid="kanban-done-column"] .task-card h4', { timeout: 10000 })
      .should('contain.text', taskTitle.trim());
  });
});

});
