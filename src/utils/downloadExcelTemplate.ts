import ExcelJS from "exceljs";

const MAX_DATA_ROWS = 1001; // soporta hasta 1000 registros

export async function downloadExcelTemplate(countryCode?: string) {
  const workbook = new ExcelJS.Workbook();
  const isChile = countryCode === "CL";

  // ─── HOJA 1: Plantilla ──────────────────────────────────────────────────────
  const sheet = workbook.addWorksheet("Plantilla");

  sheet.columns = [
    { header: "Tipo de Documento", key: "docType", width: 22 },
    { header: "Numero de Documento", key: "docNumber", width: 22 },
    { header: "Nombres", key: "name", width: 25 },
    { header: "Apellidos", key: "lastName", width: 25 },
    { header: "Edad", key: "age", width: 10 },
    { header: "Genero", key: "gender", width: 18 },
    { header: "Correo", key: "email", width: 32 },
    { header: "Telefono", key: "phone", width: 18 },
  ];

  // Estilo del encabezado
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2d60e0" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FF1a4abf" } },
      left: { style: "thin", color: { argb: "FF1a4abf" } },
      bottom: { style: "thin", color: { argb: "FF1a4abf" } },
      right: { style: "thin", color: { argb: "FF1a4abf" } },
    };
  });

  // ── Validaciones de lista desplegable ────────────────────────────────────────

  const dataValidations = (sheet as any).dataValidations;

  // Tipo de Documento → columna A
  // Si la empresa es de Chile (CL), solo se habilita RUT.
  dataValidations.add(`A2:A${MAX_DATA_ROWS}`, {
    type: "list",
    allowBlank: true,
    formulae: [isChile ? '"RUT"' : '"CC,TI,RUT,CI,OTHER"'],
    showErrorMessage: true,
    errorStyle: "stop",
    errorTitle: "Tipo de Documento inválido",
    error: isChile
      ? "Selecciona un valor de la lista:\n• RUT (Rol Único Tributario — Chile)"
      : "Selecciona un valor de la lista:\n• CC  (Cédula de Ciudadanía — Colombia)\n• TI  (Tarjeta de Identidad — Colombia)\n• RUT (Rol Único Tributario — Chile)\n• CI  (Cédula de Identidad — Chile)\n• OTHER  (Otro documento)",
    showInputMessage: true,
    promptTitle: "Tipo de Documento",
    prompt: isChile
      ? "Haz clic y selecciona: RUT"
      : "Haz clic y selecciona: CC, TI, RUT, CI u OTHER",
  });

  // Género → columna F
  dataValidations.add(`F2:F${MAX_DATA_ROWS}`, {
    type: "list",
    allowBlank: true,
    formulae: ['"MASCULINO,FEMENINO,OTRO"'],
    showErrorMessage: true,
    errorStyle: "stop",
    errorTitle: "Género inválido",
    error:
      "Selecciona un valor de la lista:\n• MASCULINO\n• FEMENINO\n• OTRO",
    showInputMessage: true,
    promptTitle: "Género",
    prompt: "Haz clic y selecciona: MASCULINO, FEMENINO u OTRO",
  });

  // ── Filas de ejemplo (fondo amarillo, texto gris — borrar antes de subir) ────
  const exampleStyle: Partial<ExcelJS.Style> = {
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFF8DC" } },
    font: { italic: true, color: { argb: "FF999999" } },
  };

  const exampleRowsData = isChile
    ? [
        {
          docType: "RUT",
          docNumber: "12345678-5",
          name: "Camila",
          lastName: "Soto",
          age: 28,
          gender: "FEMENINO",
          email: "camila.soto@ejemplo.com",
          phone: "912345678",
        },
        {
          docType: "RUT",
          docNumber: "98765432-1",
          name: "Juan",
          lastName: "Pérez",
          age: 30,
          gender: "MASCULINO",
          email: "juan.perez@ejemplo.com",
          phone: "987654321",
        },
      ]
    : [
        {
          docType: "CC",
          docNumber: 1234567890,
          name: "Juan",
          lastName: "Pérez",
          age: 30,
          gender: "MASCULINO",
          email: "juan.perez@ejemplo.com",
          phone: "3001234567",
        },
        {
          docType: "TI",
          docNumber: 9876543210,
          name: "María",
          lastName: "González",
          age: 25,
          gender: "FEMENINO",
          email: "maria.gonzalez@ejemplo.com",
          phone: "3109876543",
        },
        {
          docType: "RUT",
          docNumber: "12345678-5",
          name: "Camila",
          lastName: "Soto",
          age: 28,
          gender: "FEMENINO",
          email: "camila.soto@ejemplo.com",
          phone: "912345678",
        },
      ];

  const addedExampleRows = exampleRowsData.map((data) => sheet.addRow(data));

  addedExampleRows.forEach((row) => {
    row.height = 22;
    row.eachCell((cell) => {
      Object.assign(cell, exampleStyle);
    });
  });

  // Primera fila fija (freeze) y autofiltro
  sheet.views = [{ state: "frozen", ySplit: 1 }];
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 8 } };

  // ─── HOJA 2: Instrucciones ───────────────────────────────────────────────────
  const instrSheet = workbook.addWorksheet("Instrucciones");
  instrSheet.columns = [
    { header: "Campo", key: "field", width: 24 },
    { header: "Descripción", key: "description", width: 52 },
    { header: "Valores válidos", key: "values", width: 36 },
  ];

  const instrHeader = instrSheet.getRow(1);
  instrHeader.height = 28;
  instrHeader.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
  instrHeader.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2d60e0" } };
  instrHeader.alignment = { vertical: "middle", horizontal: "center" };

  const instrRows = [
    {
      field: "Tipo de Documento",
      description: isChile
        ? "Tipo de documento de identidad. Usa la lista desplegable de la columna A en la hoja Plantilla (RUT)."
        : "Tipo de documento de identidad. Usa la lista desplegable de la columna A en la hoja Plantilla. Usa RUT o CI para datos chilenos.",
      values: isChile ? "RUT" : "CC  |  TI  |  RUT  |  CI  |  OTHER",
    },
    {
      field: "Numero de Documento",
      description: isChile
        ? "Número del documento RUT chileno. Puedes usar guión y dígito verificador (incl. K)."
        : "Número del documento. Para CC/TI sin puntos ni comas. Para RUT chileno puedes usar guión y dígito verificador (incl. K).",
      values: isChile ? "Ej: 12345678-5" : "Ej: 1234567890  |  12345678-5",
    },
    {
      field: "Nombres",
      description: "Nombre(s) completo(s) de la persona.",
      values: "Ej: Juan Carlos",
    },
    {
      field: "Apellidos",
      description: "Apellido(s) completo(s) de la persona.",
      values: "Ej: Pérez López",
    },
    {
      field: "Edad",
      description: "Edad en años (número entero, sin decimales).",
      values: "Ej: 30",
    },
    {
      field: "Genero",
      description: "Género de la persona. Usa la lista desplegable de la columna F en la hoja Plantilla.",
      values: "MASCULINO  |  FEMENINO  |  OTRO",
    },
    {
      field: "Correo",
      description: "Correo electrónico válido.",
      values: "Ej: usuario@ejemplo.com",
    },
    {
      field: "Telefono",
      description: "Número celular sin espacios ni símbolos especiales.",
      values: "Ej: 3001234567",
    },
  ];

  instrRows.forEach((data, i) => {
    const row = instrSheet.addRow(data);
    row.height = 38;
    row.alignment = { wrapText: true, vertical: "top" };
    // Color alternado
    if (i % 2 === 0) {
      row.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF4F7FF" } };
    }
    // Resaltar en azul los campos con lista desplegable
    if (data.field === "Tipo de Documento" || data.field === "Genero") {
      row.getCell("values").font = { bold: true, color: { argb: "FF2d60e0" } };
      row.getCell("field").font = { bold: true };
    }
  });

  // Nota final
  instrSheet.addRow({});
  const noteRow = instrSheet.addRow({
    field: "⚠️ IMPORTANTE",
    description:
      "1. No modifiques los nombres de las columnas (encabezados en azul).\n" +
      "2. Elimina las filas de ejemplo (en amarillo) antes de subir el archivo.\n" +
      "3. En Tipo de Documento y Género, usa SIEMPRE la lista desplegable para evitar errores.\n" +
      "4. El archivo debe tener al menos una fila de datos.",
    values: "",
  });
  noteRow.height = 72;
  noteRow.font = { bold: true, color: { argb: "FFB45309" } };
  noteRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
  noteRow.alignment = { wrapText: true, vertical: "middle" };
  noteRow.getCell("description").border = {
    left: { style: "medium", color: { argb: "FFFBBF24" } },
  };

  // ─── DESCARGAR ───────────────────────────────────────────────────────────────
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Plantilla_Importar_Usuarios.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
