/**
 * Parser robustness. Nothing here is about a UX signature: every construct is
 * something a formatter or a real codebase produces, and the engine must not
 * crash, hang, or mis-attribute a signature while handling it.
 */
import { formatAmount } from './format';

const cmp = (a: number, b: number) => a > b;
const labels: Array<string> = [];

export const Fragments = ({ ok }: { ok: boolean }) => (
  <>
    {ok && <div className="pb-16" />}
    {cmp(1, 2) ? <kbd>Ctrl</kbd> : null}
  </>
);

export const ArrowInHandler = () => (
  <input
    type="number"
    onChange={(event) => set(toCents(event) > 0 ? formatAmount(1) : 2)}
    value={labels.length}
  />
);

export const LabelWithArrowHandler = () => (
  <button onClick={() => go()} className="h-8 w-8">
    <Icon />
  </button>
);

export const Unclosed = () => (
  <div className="pb-16">
    <button>
      <Icon />
  </div>
);

export const SelfRoot = () => <Icon />;