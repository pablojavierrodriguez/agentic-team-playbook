const Icon = () => null;

export const VisibleLabel = () => (
  <button
    onClick={save}
    style={styles.row}
  >
    <span>Guardar</span>
  </button>
);

export const GenuinelyUnnamed = () => (
  <button
    onClick={remove}
    style={styles.row}
  >
    <Icon />
  </button>
);