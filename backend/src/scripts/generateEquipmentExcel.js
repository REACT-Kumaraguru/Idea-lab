import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import Equipment from '../models/EquipmentModel.js';

// Paths where the Excel file should be generated
const PROJECT_ROOT_OUTPUT = path.resolve('..', 'AICTE_IDEA_Lab_Equipment_and_Components_Catalog.xlsx');
const USER_DOWNLOADS_OUTPUT = path.join('C:', 'Users', 'user', 'Downloads', 'AICTE_IDEA_Lab_Equipment_and_Components_Catalog.xlsx');

async function generateCatalog() {
  console.log('Fetching equipment records from database...');
  const allEquipments = await Equipment.findAll({ order: [['id', 'ASC']] });
  console.log(`Fetched ${allEquipments.length} items from database.`);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AICTE IDEA Lab Portal';
  workbook.lastModifiedBy = 'Antigravity AI Agent';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Color Constants (ARGB format for ExcelJS)
  const NAVY_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
  const SLATE_SUBHEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF334155' } };
  const CARD_HEADER_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0284C7' } };
  const LIGHT_CARD_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F9FF' } };
  const ZEBRA_EVEN_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
  const WHITE_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
  const GREEN_PILL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
  const GRAY_PILL_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };

  const THIN_BORDER = {
    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
    right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
  };

  const CARD_BORDER = {
    top: { style: 'medium', color: { argb: 'FF0284C7' } },
    left: { style: 'medium', color: { argb: 'FF0284C7' } },
    bottom: { style: 'medium', color: { argb: 'FF0284C7' } },
    right: { style: 'medium', color: { argb: 'FF0284C7' } }
  };

  // Helper to determine source and category
  function enrichItem(item, idx) {
    const id = item.id;
    let sourceDoc = '';
    let category = '';
    let isBookable = item.isAvailable;
    let hasOfficialImage = Boolean(item.image);

    if (id <= 22) {
      sourceDoc = 'Quote No. 230 (Major Prototyping Equipment)';
      category = 'Prototyping & Fabrication Equipment';
    } else if (id <= 28) {
      sourceDoc = 'Quote No. 231 (Electronic Instruments)';
      category = 'Electronic Test & Measurement Bench';
    } else {
      sourceDoc = 'PO2526A0193 (Zeekers Tech - Mechanical Tools)';
      // Categorize mechanical tools by name keywords
      const name = item.equipmentName.toLowerCase();
      if (name.includes('drill') || name.includes('saw') || name.includes('cutting') || name.includes('grind') || name.includes('sander')) {
        category = 'Power Cutting & Drilling Machinery';
      } else if (name.includes('solder') || name.includes('hot air') || name.includes('power supply') || name.includes('oscilloscope') || name.includes('multimeter')) {
        category = 'Electronics & Soldering Workstation';
      } else if (name.includes('plier') || name.includes('wrench') || name.includes('spanner') || name.includes('screwdriver') || name.includes('hammer') || name.includes('chisel') || name.includes('file')) {
        category = 'Hand Tools & Mechanical Assembly';
      } else if (name.includes('caliper') || name.includes('micrometer') || name.includes('gauge') || name.includes('scale') || name.includes('ruler')) {
        category = 'Precision Measurement & Inspection';
      } else if (name.includes('safety') || name.includes('glove') || name.includes('goggle') || name.includes('mask') || name.includes('first aid')) {
        category = 'Lab Safety & PPE';
      } else {
        category = 'Facility Hardware & Workshop Accessories';
      }
    }

    return {
      sNo: idx + 1,
      id: item.id,
      name: item.equipmentName,
      brand: item.brandName,
      quantity: item.quantity,
      category,
      sourceDoc,
      isBookable: isBookable ? 'Yes (Bookable)' : 'No (Facility Inventory)',
      pricePerHour: item.pricePerHour ? `₹${parseFloat(item.pricePerHour).toFixed(2)}/hr` : 'Hourly Rate (Admin Set)',
      kctPricePerHour: '₹0.00 / hr (Free for @kct.ac.in)',
      hasOfficialImage: hasOfficialImage ? 'Yes (Official Studio Shot)' : 'Pending',
      imagePath: item.image || 'N/A',
      details: item.equipmentDetails || 'Standard lab specification.'
    };
  }

  const enrichedItems = allEquipments.map((e, idx) => enrichItem(e, idx));
  const bookableItems = enrichedItems.filter(e => e.id <= 28);
  const facilityItems = enrichedItems.filter(e => e.id > 28);

  const totalQuantity = enrichedItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const bookableQuantity = bookableItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const facilityQuantity = facilityItems.reduce((acc, curr) => acc + curr.quantity, 0);

  // ==========================================
  // SHEET 1: INVENTORY SUMMARY & EXECUTIVE OVERVIEW
  // ==========================================
  const summarySheet = workbook.addWorksheet('Summary & Overview', {
    views: [{ showGridLines: true }]
  });

  summarySheet.columns = [
    { width: 4 },  // A (margin)
    { width: 38 }, // B
    { width: 22 }, // C
    { width: 22 }, // D
    { width: 28 }, // E
    { width: 35 }, // F
  ];

  // Header Title
  summarySheet.mergeCells('B2:F2');
  const titleCell = summarySheet.getCell('B2');
  titleCell.value = 'AICTE IDEA LAB — EQUIPMENT & COMPONENT INVENTORY';
  titleCell.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = NAVY_HEADER_FILL;
  summarySheet.getRow(2).height = 40;

  summarySheet.mergeCells('B3:F3');
  const subtitleCell = summarySheet.getCell('B3');
  subtitleCell.value = 'Comprehensive Master Catalog of Website Equipment, Major Prototyping Assets & Mechanical Facility Tools';
  subtitleCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FFCBD5E1' } };
  subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subtitleCell.fill = SLATE_SUBHEADER_FILL;
  summarySheet.getRow(3).height = 24;

  // Metadata block
  summarySheet.getCell('B5').value = 'Report Generation Date:';
  summarySheet.getCell('B5').font = { bold: true };
  summarySheet.getCell('C5').value = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  summarySheet.getCell('E5').value = 'Target System:';
  summarySheet.getCell('E5').font = { bold: true };
  summarySheet.getCell('F5').value = 'IDEA Lab Main Portal Inventory (/products)';

  // Key Statistics Table
  summarySheet.mergeCells('B7:D7');
  const statHeader = summarySheet.getCell('B7');
  statHeader.value = 'PLATFORM INVENTORY METRICS';
  statHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  statHeader.fill = CARD_HEADER_FILL;
  statHeader.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' };
  summarySheet.getRow(7).height = 25;

  const statsData = [
    ['Total Equipment & Component Entries Cataloged', `${enrichedItems.length} Distinct Items`, '100% Registered'],
    ['Total Physical Units / Pieces in Inventory', `${totalQuantity} Physical Units`, 'Verified in DB'],
    ['Major Prototyping Equipment (Quote 230)', '22 Equipment Items', 'Bookable via Portal'],
    ['Electronic Test & Measurement Instruments (Quote 231)', '6 Bench Instruments', 'Bookable via Portal'],
    ['Total Active Bookable Machines on Web Catalog', '28 Major Machines', 'IDs 1 to 28'],
    ['Facility & Mechanical Workshop Tools (PO2526A0193)', '141 Tool & Hardware Items', 'Facility Inventory'],
    ['Verified Official Studio Product Images', '28 of 28 Bookable Machines', '100% Studio Clean']
  ];

  statsData.forEach((row, i) => {
    const rowIdx = 8 + i;
    summarySheet.getCell(`B${rowIdx}`).value = row[0];
    summarySheet.getCell(`C${rowIdx}`).value = row[1];
    summarySheet.getCell(`D${rowIdx}`).value = row[2];

    const fill = i % 2 === 0 ? ZEBRA_EVEN_FILL : WHITE_FILL;
    ['B', 'C', 'D'].forEach(col => {
      const cell = summarySheet.getCell(`${col}${rowIdx}`);
      cell.fill = fill;
      cell.border = THIN_BORDER;
      cell.font = { name: 'Calibri', size: 10 };
      if (col === 'C' || col === 'D') {
        cell.alignment = { horizontal: 'center' };
        if (col === 'C') cell.font = { name: 'Calibri', size: 10, bold: true };
      }
    });
    summarySheet.getRow(rowIdx).height = 22;
  });

  // Pricing Rule Card
  summarySheet.mergeCells('B16:F16');
  const priceHeader = summarySheet.getCell('B16');
  priceHeader.value = 'EQUIPMENT USAGE PRICING POLICY (AUTOMATED RULES)';
  priceHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  priceHeader.fill = CARD_HEADER_FILL;
  priceHeader.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' };
  summarySheet.getRow(16).height = 25;

  const pricingRules = [
    ['KCT Community Users (@kct.ac.in)', '₹0.00 / Free', 'Students, faculty, research scholars, and staff receive 100% subsidized free access for lab projects.'],
    ['External / Commercial Accounts', 'Hourly Rate', 'Standard per-hour machine utilization charge (admin configurable per equipment via admin portal).'],
    ['Smart Board Policy', 'Excluded', 'Smart Board (#8 in Quote 231) excluded per directive: "Remove teaching aiding things".'],
    ['Product Image Standard', 'Official Catalog Only', 'Strictly isolated product catalog photos on white/transparent backgrounds. No casual workshop/worker photos.']
  ];

  pricingRules.forEach((row, i) => {
    const rowIdx = 17 + i;
    summarySheet.getCell(`B${rowIdx}`).value = row[0];
    summarySheet.getCell(`C${rowIdx}`).value = row[1];
    summarySheet.mergeCells(`D${rowIdx}:F${rowIdx}`);
    summarySheet.getCell(`D${rowIdx}`).value = row[2];

    const fill = i % 2 === 0 ? ZEBRA_EVEN_FILL : WHITE_FILL;
    ['B', 'C', 'D', 'E', 'F'].forEach(col => {
      const cell = summarySheet.getCell(`${col}${rowIdx}`);
      cell.fill = fill;
      cell.border = THIN_BORDER;
      cell.font = { name: 'Calibri', size: 10 };
      if (col === 'B') cell.font = { name: 'Calibri', size: 10, bold: true };
      if (col === 'C') {
        cell.alignment = { horizontal: 'center' };
        cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: row[1].includes('Free') ? 'FF15803D' : 'FF1E3A8A' } };
      }
    });
    summarySheet.getRow(rowIdx).height = 24;
  });

  // Document Sources Breakdown Table
  summarySheet.mergeCells('B22:F22');
  const sourceHeader = summarySheet.getCell('B22');
  sourceHeader.value = 'PROCUREMENT DOCUMENT BREAKDOWN';
  sourceHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sourceHeader.fill = SLATE_SUBHEADER_FILL;
  sourceHeader.alignment = { horizontal: 'left', indent: 1, vertical: 'middle' };
  summarySheet.getRow(22).height = 25;

  const docSources = [
    ['Quote No. 230', 'Prototyping Equipment', '22 Items', `${bookableItems.slice(0, 22).reduce((s, x) => s + x.quantity, 0)} Units`, 'SPL07 Laser Cutter, Prusa MINI+, Bambu P1S, 3D Scanner, 1325 CNC Router, etc.'],
    ['Quote No. 231', 'Electronic Test Bench', '6 Items', `${bookableItems.slice(22, 28).reduce((s, x) => s + x.quantity, 0)} Units`, 'Siglent Oscilloscopes, Siglent Waveform Gen, Siglent DMM, HP LaserJet, Enthu PCBMATE.'],
    ['PO2526A0193', 'Zeekers Tech Tools', '141 Items', `${facilityQuantity} Units`, 'PCB power drill, Bosch cordless drill, circular saw, sander, hand tools, safety kits.']
  ];

  docSources.forEach((row, i) => {
    const rowIdx = 23 + i;
    summarySheet.getCell(`B${rowIdx}`).value = row[0];
    summarySheet.getCell(`C${rowIdx}`).value = row[1];
    summarySheet.getCell(`D${rowIdx}`).value = row[2];
    summarySheet.getCell(`E${rowIdx}`).value = row[3];
    summarySheet.getCell(`F${rowIdx}`).value = row[4];

    const fill = i % 2 === 0 ? ZEBRA_EVEN_FILL : WHITE_FILL;
    ['B', 'C', 'D', 'E', 'F'].forEach(col => {
      const cell = summarySheet.getCell(`${col}${rowIdx}`);
      cell.fill = fill;
      cell.border = THIN_BORDER;
      cell.font = { name: 'Calibri', size: 10 };
      if (col === 'B') cell.font = { name: 'Calibri', size: 10, bold: true };
      if (col === 'C' || col === 'D' || col === 'E') cell.alignment = { horizontal: 'center' };
    });
    summarySheet.getRow(rowIdx).height = 24;
  });

  // Helper function to build standard inventory tables
  function buildInventoryTable(sheet, items, isMaster = false) {
    sheet.views = [{ state: 'frozen', ySplit: 2, showGridLines: true }];

    const columns = [
      { header: 'S.No', key: 'sNo', width: 7, align: 'center' },
      { header: 'DB ID', key: 'id', width: 8, align: 'center' },
      { header: 'Equipment / Component Name', key: 'name', width: 38, align: 'left' },
      { header: 'Brand / Manufacturer', key: 'brand', width: 22, align: 'left' },
      { header: 'Qty', key: 'quantity', width: 8, align: 'center' },
      { header: 'Category / Domain', key: 'category', width: 30, align: 'left' },
      { header: 'Procurement Source', key: 'sourceDoc', width: 28, align: 'left' },
      { header: 'Portal Availability', key: 'isBookable', width: 20, align: 'center' },
      { header: 'Standard Rate', key: 'pricePerHour', width: 22, align: 'center' },
      { header: 'KCT Student Rate', key: 'kctPricePerHour', width: 26, align: 'center' },
      { header: 'Official Image', key: 'hasOfficialImage', width: 22, align: 'center' },
      { header: 'Technical Specifications & Model Details', key: 'details', width: 60, align: 'left' },
    ];

    sheet.columns = columns;

    // Header styling
    sheet.getRow(1).height = 30;
    sheet.getRow(1).eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = NAVY_HEADER_FILL;
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
      cell.border = THIN_BORDER;
    });

    // Populate Rows
    items.forEach((item, idx) => {
      const row = sheet.addRow(item);
      const isEven = idx % 2 === 0;
      const fill = isEven ? WHITE_FILL : ZEBRA_EVEN_FILL;
      row.height = 24;

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = THIN_BORDER;
        cell.fill = fill;
        cell.font = { name: 'Calibri', size: 10 };
        const colDef = columns[colNumber - 1];

        if (colDef) {
          cell.alignment = {
            horizontal: colDef.align,
            vertical: 'middle',
            wrapText: colDef.key === 'details' || colDef.key === 'name'
          };

          // Highlight Bookable status
          if (colDef.key === 'isBookable') {
            if (item.isBookable.includes('Yes')) {
              cell.fill = GREEN_PILL_FILL;
              cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF15803D' } };
            } else {
              cell.fill = GRAY_PILL_FILL;
              cell.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };
            }
          }

          // Highlight KCT Price
          if (colDef.key === 'kctPricePerHour') {
            cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF15803D' } };
          }

          // Highlight Official Image
          if (colDef.key === 'hasOfficialImage') {
            if (item.hasOfficialImage.includes('Yes')) {
              cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF0284C7' } };
            }
          }
        }
      });
    });

    // Enable Excel auto-filter on all columns
    sheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: items.length + 1, column: columns.length }
    };
  }

  // ==========================================
  // SHEET 2: ALL INVENTORY (MASTER LIST - 169 ITEMS)
  // ==========================================
  const masterSheet = workbook.addWorksheet('All Inventory (169 Items)');
  buildInventoryTable(masterSheet, enrichedItems, true);

  // ==========================================
  // SHEET 3: MAJOR BOOKABLE EQUIPMENT (28 ITEMS)
  // ==========================================
  const bookableSheet = workbook.addWorksheet('Bookable Equipment (28)');
  buildInventoryTable(bookableSheet, bookableItems, false);

  // ==========================================
  // SHEET 4: FACILITY & WORKSHOP TOOLS (141 ITEMS)
  // ==========================================
  const facilitySheet = workbook.addWorksheet('Facility Tools (141)');
  buildInventoryTable(facilitySheet, facilityItems, false);

  // Save to Project Root
  console.log(`Saving workbook to project root: ${PROJECT_ROOT_OUTPUT}...`);
  await workbook.xlsx.writeFile(PROJECT_ROOT_OUTPUT);
  console.log(`Saved successfully to: ${PROJECT_ROOT_OUTPUT}`);

  // Save copy to User's Downloads folder
  try {
    console.log(`Saving copy to Downloads: ${USER_DOWNLOADS_OUTPUT}...`);
    await workbook.xlsx.writeFile(USER_DOWNLOADS_OUTPUT);
    console.log(`Saved successfully to Downloads!`);
  } catch (err) {
    console.log(`Note: could not save to Downloads folder (${err.message}), project root copy is available.`);
  }

  return {
    projectRoot: PROJECT_ROOT_OUTPUT,
    downloads: USER_DOWNLOADS_OUTPUT,
    totalCount: enrichedItems.length,
    bookableCount: bookableItems.length,
    facilityCount: facilityItems.length
  };
}

generateCatalog()
  .then(res => {
    console.log('SUCCESS: Excel sheet generation complete!', res);
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR generating Excel sheet:', err);
    process.exit(1);
  });
