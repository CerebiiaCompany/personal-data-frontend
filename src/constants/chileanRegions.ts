export interface ChileanProvince {
  name: string;
  comunas: string[];
}

export interface Region {
  name: string;
  code: string;
  provinces: ChileanProvince[];
  comunas: string[];
  aliases?: string[];
}

function region(
  name: string,
  code: string,
  provinces: ChileanProvince[],
  aliases: string[] = []
): Region {
  return {
    name,
    code,
    provinces,
    comunas: provinces.flatMap((province) => province.comunas),
    aliases,
  };
}

export function normalizeChilePlaceName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^region\s+(del?\s+)?/, "")
    .replace(/^provincia\s+(del?\s+)?/, "")
    .replace(/['’]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function findChileanRegion(name?: string | null): Region | undefined {
  if (!name) return undefined;
  const normalized = normalizeChilePlaceName(name);
  return CHILEAN_REGIONS.find((item) => {
    if (normalizeChilePlaceName(item.name) === normalized) return true;
    if (normalizeChilePlaceName(item.code) === normalized) return true;
    return (item.aliases ?? []).some(
      (alias) => normalizeChilePlaceName(alias) === normalized
    );
  });
}

export function findChileanProvince(
  regionName?: string | null,
  provinceName?: string | null
): ChileanProvince | undefined {
  if (!provinceName) return undefined;
  const foundRegion = findChileanRegion(regionName);
  if (!foundRegion) return undefined;
  const normalized = normalizeChilePlaceName(provinceName);
  return foundRegion.provinces.find(
    (province) => normalizeChilePlaceName(province.name) === normalized
  );
}

export const CHILEAN_REGIONS: Region[] = [
  region(
    "Arica y Parinacota",
    "AP",
    [
      { name: "Arica", comunas: ["Arica", "Camarones"] },
      { name: "Parinacota", comunas: ["Putre", "General Lagos"] },
    ],
    ["XV Arica y Parinacota"]
  ),
  region(
    "Tarapacá",
    "TA",
    [
      { name: "Iquique", comunas: ["Iquique", "Alto Hospicio"] },
      {
        name: "Tamarugal",
        comunas: ["Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
      },
    ],
    ["I Tarapacá"]
  ),
  region(
    "Antofagasta",
    "AN",
    [
      {
        name: "Antofagasta",
        comunas: ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal"],
      },
      {
        name: "El Loa",
        comunas: ["Calama", "Ollagüe", "San Pedro de Atacama"],
      },
      { name: "Tocopilla", comunas: ["Tocopilla", "María Elena"] },
    ],
    ["II Antofagasta"]
  ),
  region(
    "Atacama",
    "AT",
    [
      { name: "Copiapó", comunas: ["Copiapó", "Caldera", "Tierra Amarilla"] },
      { name: "Chañaral", comunas: ["Chañaral", "Diego de Almagro"] },
      {
        name: "Huasco",
        comunas: ["Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
      },
    ],
    ["III Atacama"]
  ),
  region(
    "Coquimbo",
    "CO",
    [
      {
        name: "Elqui",
        comunas: [
          "La Serena",
          "Coquimbo",
          "Andacollo",
          "La Higuera",
          "Paihuano",
          "Vicuña",
        ],
      },
      {
        name: "Choapa",
        comunas: ["Illapel", "Canela", "Los Vilos", "Salamanca"],
      },
      {
        name: "Limarí",
        comunas: [
          "Ovalle",
          "Combarbalá",
          "Monte Patria",
          "Punitaqui",
          "Río Hurtado",
        ],
      },
    ],
    ["IV Coquimbo"]
  ),
  region(
    "Valparaíso",
    "VA",
    [
      {
        name: "Valparaíso",
        comunas: [
          "Valparaíso",
          "Casablanca",
          "Concón",
          "Juan Fernández",
          "Puchuncaví",
          "Quintero",
          "Viña del Mar",
        ],
      },
      { name: "Isla de Pascua", comunas: ["Isla de Pascua"] },
      {
        name: "Los Andes",
        comunas: ["Los Andes", "Calle Larga", "Rinconada", "San Esteban"],
      },
      {
        name: "Petorca",
        comunas: ["La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar"],
      },
      {
        name: "Quillota",
        comunas: ["Quillota", "La Calera", "Hijuelas", "La Cruz", "Nogales"],
      },
      {
        name: "San Antonio",
        comunas: [
          "San Antonio",
          "Algarrobo",
          "Cartagena",
          "El Quisco",
          "El Tabo",
          "Santo Domingo",
        ],
      },
      {
        name: "San Felipe de Aconcagua",
        comunas: [
          "San Felipe",
          "Catemu",
          "Llaillay",
          "Panquehue",
          "Putaendo",
          "Santa María",
        ],
      },
      {
        name: "Marga Marga",
        comunas: ["Quilpué", "Limache", "Olmué", "Villa Alemana"],
      },
    ],
    ["V Valparaíso"]
  ),
  region(
    "Región Metropolitana de Santiago",
    "RM",
    [
      {
        name: "Santiago",
        comunas: [
          "Santiago",
          "Cerrillos",
          "Cerro Navia",
          "Conchalí",
          "El Bosque",
          "Estación Central",
          "Huechuraba",
          "Independencia",
          "La Cisterna",
          "La Florida",
          "La Granja",
          "La Pintana",
          "La Reina",
          "Las Condes",
          "Lo Barnechea",
          "Lo Espejo",
          "Lo Prado",
          "Macul",
          "Maipú",
          "Ñuñoa",
          "Pedro Aguirre Cerda",
          "Peñalolén",
          "Providencia",
          "Pudahuel",
          "Quilicura",
          "Quinta Normal",
          "Recoleta",
          "Renca",
          "San Joaquín",
          "San Miguel",
          "San Ramón",
          "Vitacura",
        ],
      },
      {
        name: "Cordillera",
        comunas: ["Puente Alto", "Pirque", "San José de Maipo"],
      },
      { name: "Chacabuco", comunas: ["Colina", "Lampa", "Tiltil"] },
      {
        name: "Maipo",
        comunas: ["San Bernardo", "Buin", "Calera de Tango", "Paine"],
      },
      {
        name: "Melipilla",
        comunas: ["Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro"],
      },
      {
        name: "Talagante",
        comunas: [
          "Talagante",
          "El Monte",
          "Isla de Maipo",
          "Padre Hurtado",
          "Peñaflor",
        ],
      },
    ],
    ["Metropolitana", "Santiago", "Metropolitana de Santiago"]
  ),
  region(
    "Libertador General Bernardo O'Higgins",
    "LI",
    [
      {
        name: "Cachapoal",
        comunas: [
          "Rancagua",
          "Codegua",
          "Coinco",
          "Coltauco",
          "Doñihue",
          "Graneros",
          "Las Cabras",
          "Machalí",
          "Malloa",
          "Mostazal",
          "Olivar",
          "Peumo",
          "Pichidegua",
          "Quinta de Tilcoco",
          "Rengo",
          "Requínoa",
          "San Vicente",
        ],
      },
      {
        name: "Cardenal Caro",
        comunas: [
          "Pichilemu",
          "La Estrella",
          "Litueche",
          "Marchihue",
          "Navidad",
          "Paredones",
        ],
      },
      {
        name: "Colchagua",
        comunas: [
          "San Fernando",
          "Chépica",
          "Chimbarongo",
          "Lolol",
          "Nancagua",
          "Palmilla",
          "Peralillo",
          "Placilla",
          "Pumanque",
          "Santa Cruz",
        ],
      },
    ],
    ["O'Higgins", "OHiggins", "Libertador Bernardo O'Higgins"]
  ),
  region(
    "Maule",
    "MA",
    [
      {
        name: "Talca",
        comunas: [
          "Talca",
          "Constitución",
          "Curepto",
          "Empedrado",
          "Maule",
          "Pelarco",
          "Pencahue",
          "Río Claro",
          "San Clemente",
          "San Rafael",
        ],
      },
      { name: "Cauquenes", comunas: ["Cauquenes", "Chanco", "Pelluhue"] },
      {
        name: "Curicó",
        comunas: [
          "Curicó",
          "Hualañé",
          "Licantén",
          "Molina",
          "Rauco",
          "Romeral",
          "Sagrada Familia",
          "Teno",
          "Vichuquén",
        ],
      },
      {
        name: "Linares",
        comunas: [
          "Linares",
          "Colbún",
          "Longaví",
          "Parral",
          "Retiro",
          "San Javier",
          "Villa Alegre",
          "Yerbas Buenas",
        ],
      },
    ],
    ["VII Maule"]
  ),
  region(
    "Ñuble",
    "NB",
    [
      {
        name: "Diguillín",
        comunas: [
          "Chillán",
          "Bulnes",
          "Chillán Viejo",
          "El Carmen",
          "Pemuco",
          "Pinto",
          "Quillón",
          "San Ignacio",
          "Yungay",
        ],
      },
      {
        name: "Itata",
        comunas: [
          "Quirihue",
          "Cobquecura",
          "Coelemu",
          "Ninhue",
          "Portezuelo",
          "Ránquil",
          "Treguaco",
        ],
      },
      {
        name: "Punilla",
        comunas: [
          "San Carlos",
          "Coihueco",
          "Ñiquén",
          "San Fabián",
          "San Nicolás",
        ],
      },
    ],
    ["XVI Ñuble"]
  ),
  region(
    "Biobío",
    "BI",
    [
      {
        name: "Concepción",
        comunas: [
          "Concepción",
          "Coronel",
          "Chiguayante",
          "Florida",
          "Hualqui",
          "Lota",
          "Penco",
          "San Pedro de la Paz",
          "Santa Juana",
          "Talcahuano",
          "Tomé",
          "Hualpén",
        ],
      },
      {
        name: "Arauco",
        comunas: [
          "Lebu",
          "Arauco",
          "Cañete",
          "Contulmo",
          "Curanilahue",
          "Los Álamos",
          "Tirúa",
        ],
      },
      {
        name: "Biobío",
        comunas: [
          "Los Ángeles",
          "Antuco",
          "Cabrero",
          "Laja",
          "Mulchén",
          "Nacimiento",
          "Negrete",
          "Quilaco",
          "Quilleco",
          "San Rosendo",
          "Santa Bárbara",
          "Tucapel",
          "Yumbel",
          "Alto Biobío",
        ],
      },
    ],
    ["VIII Biobío", "Bio Bio", "Bío Bío"]
  ),
  region(
    "Araucanía",
    "AR",
    [
      {
        name: "Cautín",
        comunas: [
          "Temuco",
          "Carahue",
          "Cholchol",
          "Cunco",
          "Curarrehue",
          "Freire",
          "Galvarino",
          "Gorbea",
          "Lautaro",
          "Loncoche",
          "Melipeuco",
          "Nueva Imperial",
          "Padre Las Casas",
          "Perquenco",
          "Pitrufquén",
          "Pucón",
          "Saavedra",
          "Teodoro Schmidt",
          "Toltén",
          "Vilcún",
          "Villarrica",
        ],
      },
      {
        name: "Malleco",
        comunas: [
          "Angol",
          "Collipulli",
          "Curacautín",
          "Ercilla",
          "Lonquimay",
          "Los Sauces",
          "Lumaco",
          "Purén",
          "Renaico",
          "Traiguén",
          "Victoria",
        ],
      },
    ],
    ["IX Araucanía", "La Araucanía"]
  ),
  region(
    "Los Ríos",
    "LR",
    [
      {
        name: "Valdivia",
        comunas: [
          "Valdivia",
          "Corral",
          "Lanco",
          "Los Lagos",
          "Máfil",
          "Mariquina",
          "Paillaco",
          "Panguipulli",
        ],
      },
      {
        name: "Ranco",
        comunas: ["La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
      },
    ],
    ["XIV Los Ríos"]
  ),
  region(
    "Los Lagos",
    "LL",
    [
      {
        name: "Llanquihue",
        comunas: [
          "Puerto Montt",
          "Calbuco",
          "Cochamó",
          "Fresia",
          "Frutillar",
          "Llanquihue",
          "Los Muermos",
          "Maullín",
          "Puerto Varas",
        ],
      },
      {
        name: "Chiloé",
        comunas: [
          "Castro",
          "Ancud",
          "Chonchi",
          "Curaco de Vélez",
          "Dalcahue",
          "Puqueldón",
          "Queilén",
          "Quellón",
          "Quemchi",
          "Quinchao",
        ],
      },
      {
        name: "Osorno",
        comunas: [
          "Osorno",
          "Puerto Octay",
          "Purranque",
          "Puyehue",
          "Río Negro",
          "San Juan de la Costa",
          "San Pablo",
        ],
      },
      {
        name: "Palena",
        comunas: ["Chaitén", "Futaleufú", "Hualaihué", "Palena"],
      },
    ],
    ["X Los Lagos"]
  ),
  region(
    "Aysén del General Carlos Ibáñez del Campo",
    "AI",
    [
      { name: "Coyhaique", comunas: ["Coyhaique", "Lago Verde"] },
      { name: "Aysén", comunas: ["Aysén", "Cisnes", "Guaitecas"] },
      {
        name: "Capitán Prat",
        comunas: ["Cochrane", "O'Higgins", "Tortel"],
      },
      { name: "General Carrera", comunas: ["Chile Chico", "Río Ibáñez"] },
    ],
    ["Aysén", "Aysen", "XI Aysén"]
  ),
  region(
    "Magallanes y de la Antártica Chilena",
    "MG",
    [
      {
        name: "Magallanes",
        comunas: ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio"],
      },
      {
        name: "Antártica Chilena",
        comunas: ["Cabo de Hornos", "Antártica"],
      },
      {
        name: "Tierra del Fuego",
        comunas: ["Porvenir", "Primavera", "Timaukel"],
      },
      { name: "Última Esperanza", comunas: ["Natales", "Torres del Paine"] },
    ],
    ["Magallanes", "XII Magallanes"]
  ),
];
