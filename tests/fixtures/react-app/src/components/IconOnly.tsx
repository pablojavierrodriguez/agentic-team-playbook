const Icon = () => null;

/**
 * Every shape a labelled control takes. All four are accessible and none of them
 * may be reported: the label is either a direct text node or wrapped in markup,
 * on one line or spread across several.
 */
export const DirectText = () => (
  <button onClick={save}>Guardar</button>
);

export const WrappedLabel = () => (
  <button onClick={save}><span>Guardar</span></button>
);

export const MultilineIconAndLabel = () => (
  <button
    onClick={save}
    style={styles.row}
  >
    <Icon />
    <span>Guardar</span>
  </button>
);

export const MultilineWrappedLabel = () => (
  <button
    onClick={save}
    style={styles.row}
  >
    <span>Guardar</span>
  </button>
);

export const DivRoleButtonLabelled = () => (
  <div
    role="button"
    tabIndex={0}
  >
    <Icon />
    <span>Guardar</span>
  </div>
);

/**
 * The two shapes that genuinely have no accessible name.
 */
export const GenuinelyUnnamed = () => (
  <button
    onClick={remove}
    style={styles.row}
  >
    <Icon />
  </button>
);

export const GenuinelyUnnamedRoleButton = () => (
  <div
    role="button"
    tabIndex={0}
  >
    <Icon />
  </div>
);