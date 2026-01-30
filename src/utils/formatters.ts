export const priceFormatter = new Intl.NumberFormat("es-CO", {
  style: "decimal",
  maximumFractionDigits: 0,
});

export const creditsFormatter = new Intl.NumberFormat("es-CO", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
