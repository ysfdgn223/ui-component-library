/**
 * Arbitrary `data-*` props. React's JSX handles these on intrinsic elements,
 * but a props object typed by hand does not, and this library styles state
 * through data attributes — so parts that take a props object need them.
 */
export type DataAttributes = {
  [key: `data-${string}`]: string | number | boolean | undefined;
};
