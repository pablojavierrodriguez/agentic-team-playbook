import { format } from 'date-fns';
import { Reorder } from 'framer-motion';

/**
 * Fixture that must trigger every one of the 13 catalogued signatures.
 * Each rule reports at most once per file, so this file yields 13 findings.
 */
export function Violations({ date, amount }) {
  return (
    <div className="flex flex-col">
      <input type="number" value={amount} />
      <input type="email" />
      <kbd>Ctrl</kbd>
      <button className="h-8 w-8 rounded-lg">
        <TrashIcon />
      </button>
      <div className="flex items-center justify-between">
        <span>{format(date, "MMMM yyyy")}</span>
      </div>
      <div className="pb-16" />
      <div className="fixed bottom-0" />
      <span className="text-[13px]">tight</span>
      <div className="cursor-pointer" onClick={() => {}} />
      <div onScroll={() => { localStorage.setItem('scrollY', '1'); }}>
        <Reorder.Group />
      </div>
      <b>{(amount).toLocaleString()}</b>
    </div>
  );
}