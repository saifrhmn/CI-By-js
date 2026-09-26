const {
  add,
  subtract,
  multiply,
  divide,
  percentage,
} = require("../src/calculator");

describe("calculator", () => {
  test("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  test("subtracts two numbers", () => {
    expect(subtract(7, 2)).toBe(5);
  });

  test("multiplies two numbers", () => {
    expect(multiply(4, 5)).toBe(20);
  });

  test("divides two numbers", () => {
    expect(divide(10, 2)).toBe(5);
  });

  test("throws when dividing by zero", () => {
    expect(() => divide(10, 0)).toThrow("Cannot divide by zero");
  });

  test("calculates a percentage", () => {
    expect(percentage(200, 15)).toBe(30);
  });
});
