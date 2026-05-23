function getTimeFactor() {
  const h = new Date().getHours();

  if ((h >= 7 && h <= 10) || (h >= 13 && h <= 15) || (h >= 17 && h <= 20)) {
    return 1.4;
  }

  if (h >= 0 && h <= 5) {
    return 0.4;
  }

  return 1.0;
}

module.exports = {
  getTimeFactor,
};