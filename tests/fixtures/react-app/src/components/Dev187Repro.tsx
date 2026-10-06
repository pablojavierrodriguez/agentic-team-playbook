const Icon = () => null;

export const A = () => (
  <div>
    <button aria-label="uno"><Icon /></button>
    <button>plain text label</button>
    <button><span>visible label</span></button>
  </div>
);

export const B = () => (
  <div>
    <button><Icon /></button>
  </div>
);