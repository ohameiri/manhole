import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { DimensionEntry } from '../../types/dimension';

export async function exportToExcel(
  dimensions: DimensionEntry[],
  pngBlob: Blob | null,
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Manhole Butterfly Diagram Dimensioner';
  workbook.created = new Date();

  // === Sheet 1: Dimensions Table ===
  const dimSheet = workbook.addWorksheet('Dimensions');

  dimSheet.columns = [
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Item', key: 'item', width: 28 },
    { header: 'Value', key: 'value', width: 20 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Standard Reference', key: 'standardRef', width: 35 },
  ];

  // Style header row
  const headerRow = dimSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '4472C4' },
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: '2F5496' } },
    };
  });
  headerRow.height = 24;

  // Add data rows with alternating colors
  dimensions.forEach((dim, i) => {
    const row = dimSheet.addRow({
      category: dim.category,
      item: dim.item,
      value: String(dim.value),
      unit: dim.unit,
      standardRef: dim.standardRef,
    });

    if (i % 2 === 0) {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D9E2F3' },
        };
      });
    }

    // Highlight warnings
    if (dim.category === 'Warning') {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FDE8E8' },
        };
        cell.font = { color: { argb: 'C0392B' } };
      });
    }

    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: 'hair', color: { argb: 'DDDDDD' } },
      };
    });
  });

  // Auto filter
  dimSheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: dimensions.length + 1, column: 5 },
  };

  // Freeze header
  dimSheet.views = [{ state: 'frozen', ySplit: 1 }];

  // === Sheet 2: Preview Image ===
  if (pngBlob) {
    const previewSheet = workbook.addWorksheet('Preview');

    const arrayBuffer = await pngBlob.arrayBuffer();
    const imageId = workbook.addImage({
      buffer: arrayBuffer,
      extension: 'png',
    });

    previewSheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 900, height: 675 },
    });

    previewSheet.getColumn(1).width = 130;
  }

  // === Generate & Download ===
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const cleanName = filename.replace(/\.dxf$/i, '');
  saveAs(blob, `${cleanName}-dimensions.xlsx`);
}
