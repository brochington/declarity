import Entity from '../Entity';

describe('Entity ->', function() {
  it('exists', () => {
    const entity = new Entity();

    expect(entity).to.exist;
  });
});
