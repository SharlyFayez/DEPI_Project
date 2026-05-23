const { getTimeFactor } = require("../src/utils");

describe("Simulator Utils", () => {

  test("getTimeFactor returns a number", () => {
    expect(typeof getTimeFactor()).toBe("number");
  });

});