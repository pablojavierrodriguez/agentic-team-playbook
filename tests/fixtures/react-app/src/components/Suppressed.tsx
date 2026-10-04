/**
 * Inline suppression must silence findings on the target line only.
 * UX-001 and UX-005 are suppressed by id; UX-013 by the blanket form.
 */
export function Suppressed({ amount }) {
  return (
    <div>
      <input type="number" /> {/* ux-audit-ignore UX-001 */}
      <input type="email" /> {/* ux-audit-ignore UX-005 */}
      <b>{(amount).toLocaleString()}</b> {/* ux-audit-ignore */}
    </div>
  );
}