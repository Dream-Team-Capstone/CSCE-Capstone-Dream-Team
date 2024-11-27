const { convertBlockToPython } = require('../blockConverter');

test('converts a print block to Python', () => {
  const block = { type: 'print', value: '"Hello World"' };
  const result = convertBlockToPython(block);
  expect(result).toBe('print("Hello World")');
});
