/**
 * Same anti-patterns as the react-app fixture, but on a project without
 * date-fns or framer-motion. UX-003 and UX-004 are dependency-gated, so they
 * must NOT fire here. This is what makes the auditor stack agnostic.
 */
export function Minimal({ date, amount }) {
  return (
    <div className="flex flex-col">
      <input type="number" />
      <input type="email" />
      <div className="pb-16" />
      <div className="fixed bottom-0" />
      <span className="text-[13px]">{date.getFullYear()}</span>
      <div className="cursor-pointer" onClick={() => {}} />
      <b>{(amount).toLocaleString()}</b>
    </div>
  );
}