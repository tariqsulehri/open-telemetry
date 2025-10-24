/**
 * Converts a given number of minutes to hours.
 *
 * @param {number} min - The number of minutes to convert. Defaults to 60 if not provided.
 * @returns {number} - The equivalent number of hours.
 */
exports.convertMin2Hrs = async(min = 60) => {
  return min / 60;
};

/**
 * Converts a given number of days to hours.
 *
 * @param {number} days - The number of days to convert. Defaults to 1 if not provided.
 * @returns {number} - The equivalent number of hours.
 */
exports.convertDays2Hrs = async(days = 1) => {
  return days * 24;
};

/**
 * Converts a given number of days to milliseconds.
 *
 * @param {number} days - The number of days to convert. Defaults to 1 if not provided.
 * @returns {number} - The equivalent number of milliseconds.
 */
exports.convertDays2MilliSeconds = async(days = 1) => {
  return days * 24 * 60 * 60 * 1000;
};

/**
 * Converts a given number of days to seconds.
 *
 * @param {number} days - The number of days to convert. Defaults to 1 if not provided.
 * @returns {number} - The equivalent number of seconds.
 */
exports.convertDays2Seconds = async(days = 1) => {
  return days * 24 * 60 * 60;
};