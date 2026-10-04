/**
 * Fixture that must produce ZERO findings. Every signature is either absent or
 * explicitly opted out with the documented escape hatch.
 */
export function Clean({ amount, date }) {
  return (
    <div className="flex flex-col gap-2">
      <input
        type="number"
        inputMode="decimal"
        value={amount}
        onChange={() => {}}
      />
      <input type="email" autoCapitalize="none" autoCorrect="off" />
      <button className="min-h-[44px] px-4" aria-label="Confirm">
        <TrashIcon />
      </button>
      <span className="text-sm tabular-nums">{(amount).toLocaleString()}</span>
      <span className="pb-32" />
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="truncate">{date.getFullYear()}</span>
      </div>
      <div
        className="cursor-pointer active:scale-[0.98]"
        onClick={() => {}}
      />
    </div>
  );
}