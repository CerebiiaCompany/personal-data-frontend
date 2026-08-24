export interface JurisdictionTerms {
  suppression_term: string;
  dpo_title: string;
  arco_article: string;
}

export function getJurisdictionTerms(countryCode?: string | null): JurisdictionTerms {
  const isChile = countryCode === "CL";
  return {
    suppression_term: isChile ? "Supresión" : "Cancelación",
    dpo_title: "Oficial de Protección de Datos",
    arco_article: isChile ? "Art. 11 inc. 2°, Ley 21.719" : "Ley 1581 de 2012",
  };
}
