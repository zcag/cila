// Flat config (ESLint 9). Next 16's `eslint-config-next` ships native flat
// config arrays, so we spread them directly — no FlatCompat shim needed.
// `next lint` was removed in Next 16; the `lint` script calls `eslint` directly.
import next from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  ...next,
  {
    ignores: [".next/", "node_modules/", "out/"],
  },
];

export default eslintConfig;
