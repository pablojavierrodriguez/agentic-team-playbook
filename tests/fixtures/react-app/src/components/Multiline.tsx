import type { ChangeEvent } from 'react';

/**
 * Fixture for the multiline buildUnits regression.
 *
 * UX-001 blocks numeric inputs unless the same unit carries the decimal
 * inputMode escape hatch. When a formatter spreads the attributes over several
 * lines and one of those lines holds an arrow function, a unit splitter that
 * counts every `>` as a tag close ends the unit on that line. The escape hatch
 * then lands in the next unit, becomes invisible, and UX-001 reports a false
 * positive. Here the handler deliberately precedes the escape hatch, which is
 * the attribute order that exposes the bug.
 */
export function MultilineAmountInputs() {
  const toCents = (event: ChangeEvent<HTMLInputElement>) => Math.round(Number(event.target.value) * 100);

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <input
        type="number"
        onChange={(event) => setAmount(toCents(event))}
        inputMode="decimal"
        aria-label="Amount"
      />

      <input
        type="number"
        onBlur={(event) => commitRate(toCents(event))}
        inputMode="decimal"
        aria-label="Rate"
      />

      <input
        type="number"
        onChange={(event) => setFee(toCents(event))}
        inputMode="decimal"
        aria-label="Fee"
      />
    </form>
  );
}