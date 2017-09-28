import { createRandomString } from '../string';

describe('string helpers', function() {
  context('createRandomString()', () => {
    it('create a correctly sized default string', () => {
      const defaultString = createRandomString();

      expect(defaultString).to.exist;
      expect(defaultString).to.be.a('string');
      expect(defaultString.length).to.equal(12);
    });
    it('create a string of given length when arg is passed', () => {
      const shortString = createRandomString(5);

      expect(shortString).to.exist;
      expect(shortString).to.be.a('string');
      expect(shortString.length).to.equal(5);
    });
  });
});
