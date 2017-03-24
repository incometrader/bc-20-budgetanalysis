const checkIncome = require('../public/javascripts/core.js');

describe('Find how much the income will return after one income is added ', () => {
   it('should return 0 for empty list', () => {
      expect(checkIncome()).toEqual(10000);
   });
});
