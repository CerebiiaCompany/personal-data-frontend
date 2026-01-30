import ExcelJS from "exceljs";

/**
 * Genera y descarga una plantilla Excel con dos hojas:
 * - Hoja 1 "Plantilla": columnas para importar usuarios
 * - Hoja 2 "Instrucciones": indicaciones de qué poner en cada columna
 */
export async function downloadExcelTemplate() {
  const workbook = new ExcelJS.Workbook();
  
  // === HOJA 1: Plantilla ===
  const templateSheet = workbook.addWorksheet("Plantilla");
  
  // Headers con estilo
  templateSheet.columns = [
    { header: "Tipo de Documento", key: "docType", width: 20 },
    { header: "Numero de Documento", key: "docNumber", width: 20 },
    { header: "Nombres", key: "name", width: 25 },
    { header: "Apellidos", key: "lastName", width: 25 },
    { header: "Edad", key: "age", width: 10 },
    { header: "Genero", key: "gender", width: 15 },
    { header: "Correo", key: "email", width: 30 },
    { header: "Telefono", key: "phone", width: 20 },
  ];

  // Estilo del header
  const headerRow = templateSheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2d60e0" }, // primary-500
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 25;

  // Agregar filas de ejemplo (opcionales)
  templateSheet.addRow({
    docType: "CC",
    docNumber: 1234567890,
    name: "Juan",
    lastName: "Pérez",
    age: 30,
    gender: "MASCULINO",
    email: "juan.perez@ejemplo.com",
    phone: "3001234567",
  });

  templateSheet.addRow({
    docType: "TI",
    docNumber: 9876543210,
    name: "María",
    lastName: "González",
    age: 25,
    gender: "FEMENINO",
    email: "maria.gonzalez@ejemplo.com",
    phone: "3109876543",
  });

  // === HOJA 2: Instrucciones ===
  const instructionsSheet = workbook.addWorksheet("Instrucciones");
  instructionsSheet.columns = [
    { header: "Campo", key: "field", width: 25 },
    { header: "Descripción", key: "description", width: 60 },
  ];

  // Estilo del header
  const instrHeaderRow = instructionsSheet.getRow(1);
  instrHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  instrHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2d60e0" },
  };
  instrHeaderRow.alignment = { vertical: "middle", horizontal: "center" };
  instrHeaderRow.height = 25;

  // Instrucciones por campo
  instructionsSheet.addRows([
    {
      field: "Tipo de Documento",
      description: "CC (Cédula de Ciudadanía), TI (Tarjeta de Identidad) u OTHER (Otro).",
    },
    {
      field: "Numero de Documento",
      description: "Número del documento sin puntos ni comas. Ejemplo: 1234567890",
    },
    {
      field: "Nombres",
      description: "Nombre(s) completo(s) de la persona. Ejemplo: Juan Carlos",
    },
    {
      field: "Apellidos",
      description: "Apellido(s) completo(s) de la persona. Ejemplo: Pérez López",
    },
    {
      field: "Edad",
      description: "Edad en años (número entero). Ejemplo: 30",
    },
    {
      field: "Genero",
      description: 'MASCULINO, FEMENINO u OTRO. Escribe exactamente tal cual (sin tildes). Ejemplo: "MASCULINO"',
    },
    {
      field: "Correo",
      description: "Correo electrónico válido. Ejemplo: usuario@ejemplo.com",
    },
    {
      field: "Telefono",
      description: "Número de teléfono celular sin espacios ni símbolos. Ejemplo: 3001234567",
    },
  ]);

  // Wrap text en la columna de descripción
  instructionsSheet.getColumn("description").alignment = {
    wrapText: true,
    vertical: "top",
  };

  // Ajustar altura de filas para que se vea todo el texto
  instructionsSheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.height = 35;
    }
  });

  // Agregar nota final
  instructionsSheet.addRow({});
  const noteRow = instructionsSheet.addRow({
    field: "IMPORTANTE",
    description:
      "⚠️ No modifiques los nombres de las columnas (headers). La plantilla no funcionará si cambias 'Nombres' por 'Nombre', etc. Elimina las filas de ejemplo antes de subir tu plantilla.",
  });
  noteRow.font = { bold: true, color: { argb: "FFD97706" } };
  noteRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFEF3C7" },
  };
  noteRow.height = 50;
  noteRow.alignment = { wrapText: true, vertical: "middle" };

  // === GENERAR Y DESCARGAR ===
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
