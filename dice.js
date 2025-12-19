const otel = require('@opentelemetry/api');

/**
 * Rolls a set of dice and returns the results.
 * @param {number} rolls - Number of times to roll.
 * @param {number} min - Minimum die value.
 * @param {number} max - Maximum die value.
 */
function rollTheDice(rolls, min, max) {
  // Get the tracer to create a manual sub-span
  const tracer = otel.trace.getTracer('dice-lib');

  // Start a child span to track the actual calculation
  return tracer.startActiveSpan('dice.calculation', (span) => {
    const results = [];
    
    for (let i = 0; i < rolls; i++) {
      results.push(Math.floor(Math.random() * (max - min + 1) + min));
    }

    // Add attributes to the span so you can see results in Tempo
    span.setAttribute('dice.rolls_count', rolls);
    span.setAttribute('dice.results', JSON.stringify(results));
    
    // End the span
    span.end();
    
    return results;
  });
}

module.exports = { rollTheDice };