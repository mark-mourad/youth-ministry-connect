import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ReportRow = Record<string, string | number>;

export function exportXlsx(rows: ReportRow[], sheetName: string, fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 30));
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportPdf(rows: ReportRow[], title: string, fileName: string) {
  const doc = new jsPDF({ orientation: "landscape" });
  const head = rows.length > 0 ? [Object.keys(rows[0]!)] : [["No data"]];
  const body = rows.map((row) => Object.values(row).map(String));
  doc.setFontSize(14);
  doc.text(title, 14, 15);
  autoTable(doc, {
    head,
    body,
    startY: 22,
    styles: { fontSize: 9, halign: "center" },
    headStyles: { fillColor: [29, 185, 84] },
  });
  doc.save(`${fileName}.pdf`);
}
