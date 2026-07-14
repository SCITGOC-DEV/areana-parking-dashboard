import ExcelJS from "exceljs";

import { saveAs } from "file-saver";
import DateUtils from "./DateUtils";
import { addPadding, formatDateToMMDDYYYY, formatTIN, formatDateWithTimezone, formatTimeWithTimezone } from "./Constants";

// Helper function to safely pad a value with zeros (for IDs, etc.)
const safeAddPadding = (value) => {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    try {
        return value.toString().padStart(10, '0');
    } catch (error) {
        return 'N/A';
    }
};

const sanitizeWorksheetName = (name) => {
    if (!name) return 'Sheet';
    // Remove or replace invalid characters: * ? : \ / [ ]
    return name
        .replace(/[*?:\\\/\[\]]/g, '') // Remove invalid characters
        .replace(/\|/g, '-') // Replace pipe with dash
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim()
        .substring(0, 31); // Excel worksheet names are limited to 31 characters
};

const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "0.00";
    }
    return Number(value).toFixed(2);
};

const safeNumber = (value) => {
    const num = Number(value || 0);
    return isNaN(num) ? 0 : num;
};

const safeOrNumber = (value) => {
    if (value === null || value === undefined || value === '0' || value === 0) {
        return 'N/A'
    }
    return addPadding(value);
}


// Add this helper at the top, after imports
function formatTINDash(tin) {
    if (!tin) return '';
    const cleanTIN = tin.toString().replace(/-/g, '');
    // Format as 3-3-3-5
    return cleanTIN.replace(/(\d{3})(\d{3})(\d{3})(\d{0,5})/, (m, a, b, c, d) => [a, b, c, d].filter(Boolean).join('-'));
}

const exportAnexBReport = async (data, fileName, startDate, endDate, plateNo, serialNo, reportData = null) => {
    if (!Array.isArray(data)) {
        console.error('Invalid data format: expected array');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    let plateData;
    let serialNumberData;

    // Use vehiclePlateNumber from reportData if available, otherwise use the passed parameters
    const actualVehiclePlate = reportData?.vehiclePlateNumber || plateNo;
    const actualSerialNo = reportData?.sn || serialNo; // Use sn from query when available

    if (actualVehiclePlate == 'All' && actualSerialNo == 'All') {
        plateData = 'All';
        serialNumberData = 'All';
    }

    if (actualVehiclePlate != 'All') {
        plateData = actualVehiclePlate;
        serialNumberData = actualSerialNo; // Use sn from query instead of 'N/A'
    }
    if (actualSerialNo != 'All') {
        serialNumberData = actualSerialNo;
        plateData = actualVehiclePlate; // Use actual vehicle plate from query, not 'N/A'
    }

    // Title row (merged)
    worksheet.mergeCells("A1:AB1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = [
        "PARK SOLUTIONS INC.",
        "VAT-TIN: 010-165-233-00010",
        `Plate NO.: ${plateData}`,
        "MIN: N/A",
        `SN: ${serialNumberData}`,
        `For the peroid: ${startDate || 'N/A'} to ${endDate || 'N/A'}`
    ].join('\n');
    titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    titleCell.font = { bold: true, size: 12 };
    worksheet.getRow(1).height = 100;

    // Table title row (merged)
    worksheet.insertRow(2, []);
    worksheet.mergeCells("A2:AB2");
    const tableTitleCell = worksheet.getCell("A2");
    tableTitleCell.value = "BIR Sales Summary Report";
    tableTitleCell.alignment = { horizontal: "center", vertical: "middle" };
    tableTitleCell.font = { size: 16, bold: true };

    // Header rows (Row 3 and 4) - Exact structure from image
    worksheet.mergeCells("A3:A5"); worksheet.getCell("A3").value = "Date";
    worksheet.mergeCells("B3:B5"); worksheet.getCell("B3").value = "Passenger Type";
    worksheet.mergeCells("C3:C5"); worksheet.getCell("C3").value = "Beginning SI No.";
    worksheet.mergeCells("D3:D5"); worksheet.getCell("D3").value = "Ending SI No.";
    worksheet.mergeCells("E3:E5"); worksheet.getCell("E3").value = "Grand Accum. Sales Ending Balance";
    worksheet.mergeCells("F3:F5"); worksheet.getCell("F3").value = "Grand Accum. Beg. Balance";
    worksheet.mergeCells("G3:G5"); worksheet.getCell("G3").value = "Sales issued w/ Manual SI (per RR 16-2018)";
    worksheet.mergeCells("H3:H5"); worksheet.getCell("H3").value = "Gross Sales for the Day";
    worksheet.mergeCells("I3:I5"); worksheet.getCell("I3").value = "VATable Sales";
    worksheet.mergeCells("J3:J5"); worksheet.getCell("J3").value = "VAT Amount";
    worksheet.mergeCells("K3:K5"); worksheet.getCell("K3").value = "VAT-Exempt Sales";
    worksheet.mergeCells("L3:L5"); worksheet.getCell("L3").value = "Zero-Rated Sales";

    // Deductions section with merged header
    worksheet.mergeCells("M3:P3"); worksheet.getCell("M3").value = "Deductions";
    worksheet.mergeCells("M4:P4"); worksheet.getCell("M4").value = "Discount";
    worksheet.getCell("M5").value = "SC";
    worksheet.getCell("N5").value = "PWD";
    worksheet.getCell("O5").value = "Student";
    worksheet.getCell("P5").value = "Total Deductions";

    // Adjustment on VAT section with merged header
    worksheet.mergeCells("Q3:U3"); worksheet.getCell("Q3").value = "Adjustment on VAT";
    worksheet.mergeCells("Q4:S4"); worksheet.getCell("Q4").value = "Discount";
    worksheet.getCell("Q4").alignment =
        worksheet.getCell("Q5").value = "SC";
    worksheet.getCell("R5").value = "PWD";
    worksheet.getCell("S5").value = "Others";
    worksheet.mergeCells("T4:T5"); worksheet.getCell("T4").value = "VAT on Returns";
    worksheet.mergeCells("U4:U5"); worksheet.getCell("U4").value = "Total VAT Adjustment";

    worksheet.mergeCells("V3:V5"); worksheet.getCell("V3").value = "VAT Payable";
    worksheet.mergeCells("W3:W5"); worksheet.getCell("W3").value = "Net Sales";
    worksheet.mergeCells("X3:X5"); worksheet.getCell("X3").value = "Sales Overrun / Overflow";
    worksheet.mergeCells("Y3:Y5"); worksheet.getCell("Y3").value = "Total Income";
    worksheet.mergeCells("Z3:Z5"); worksheet.getCell("Z3").value = "Reset Counter";
    worksheet.mergeCells("AA3:AA5"); worksheet.getCell("AA3").value = "Z-Counter";
    worksheet.mergeCells("AB3:AB5"); worksheet.getCell("AB3").value = "Remarks";

    // Color coding to match the image exactly
    const headerColors = {
        // First group - light gray/white
        white: ["A3", "B3", "C3", "D3"],
        // Second group - light blue
        lightBlue: ["E3", "F3", "G3", "H3"],
        // Third group - yellow
        yellow: ["I3", "J3", "K3", "L3"],
        // Fourth group - orange (Deductions)
        orange: ["M3", "M5", "N5", "O5", "P5"],
        orangeSub: ["M4", "N4", "O4", "P4"],
        // Fifth group - green (Adjustment on VAT)
        green: ["Q3", "Q5", "R5", "S5"],
        greenSub: ["Q4", "R4", "S4", "T4", "U4"],
        // Remaining columns - light gray
        lightGray: ["V3", "W3", "X3", "Y3", "Z3", "AA3", "AB3"]
    };

    // Apply colors to match the image
    headerColors.white.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFFF" } };
    });
    headerColors.lightBlue.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "DDEEFF" } };
    });
    headerColors.yellow.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFF99" } };
    });
    headerColors.orange.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB366" } };
    });
    headerColors.orangeSub.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFB366" } };
    });
    headerColors.green.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "92D050" } };
    });
    headerColors.greenSub.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "92D050" } };
    });
    headerColors.lightGray.forEach(cell => {
        worksheet.getCell(cell).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F2F2F2" } };
    });

    // Style header cells with borders and alignment to match image
    for (let col = 1; col <= 28; col++) {
        const cell3 = worksheet.getCell(3, col);
        const cell4 = worksheet.getCell(4, col);
        const cell5 = worksheet.getCell(5, col);

        // Font styling
        cell3.font = { bold: true, size: 9 };
        cell4.font = { bold: true, size: 9 };
        cell5.font = { bold: true, size: 9 };

        // Alignment - center for headers
        cell3.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell4.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell5.alignment = { horizontal: "center", vertical: "middle", wrapText: true };

        // Borders - thin black borders
        const borderStyle = { style: 'thin', color: { argb: '000000' } };
        cell3.border = {
            top: borderStyle, bottom: borderStyle,
            left: borderStyle, right: borderStyle
        };
        cell4.border = {
            top: borderStyle, bottom: borderStyle,
            left: borderStyle, right: borderStyle
        };
        cell5.border = {
            top: borderStyle, bottom: borderStyle,
            left: borderStyle, right: borderStyle
        };
    }

    // Set column widths optimized to fit all columns in one screen
    const columnWidths = [
        8,   // A - Date
        9,   // B - Passenger Type
        12,   // C - Beginning SI
        12,   // D - Ending SI
        10,  // E - Grand Accum Sales Ending
        10,  // F - Grand Accum Beg Balance
        10,  // G - Sales issued w/ Manual SI
        9,   // H - Gross Sales
        8,   // I - VATable Sales
        8,   // J - VAT Amount
        9,   // K - VAT-Exempt Sales
        8,   // L - Zero-Rated Sales
        7,   // M - Discount SC
        6,   // N - PWD
        7,   // O - Student
        8,   // P - Total Deductions
        7,   // Q - Discount SC (VAT Adj)
        6,   // R - PWD (VAT Adj)
        7,   // S - Others
        8,   // T - VAT on Returns
        8,   // U - Total VAT Adjustment
        8,   // V - VAT Payable
        8,   // W - Net Sales
        9,   // X - Sales Overrun
        8,   // Y - Total Income
        7,   // Z - Reset Counter
        7,   // AA - Z-Counter
        8    // AB - Remarks
    ];

    worksheet.columns = columnWidths.map(width => ({ width }));

    // Helper to format date
    const formatDateToMMDDYYYY = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    };

    // Write data rows with formulas for calculations
    let rowIndex = 6;
    let summaryRowIndices = []; // Track summary row indices for grand total formulas
    let dataStartRow = 6;

    data.forEach(mainObj => {
        const transactionDate = mainObj.transactionDate || mainObj.date || '';
        const formattedDate = formatDateToMMDDYYYY(transactionDate);

        // Get passenger summary data for this transaction
        const passengerSummary = mainObj.passengerSummaryData || [];

        // --- SUMMARY ROW (date-level totals) ---
        const summaryRowData = [
            formattedDate, // A: Date (MM/DD/YYYY)
            '', // B: Passenger Type (blank for summary)
            safeOrNumber(mainObj.beginningOr) || 'N/A', // C: Beginning SI (editable)
            safeOrNumber(mainObj.endingOr) || 'N/A',   // D: Ending SI (editable)
            Number(mainObj.newGrandTotal) || 0, // E: Grand Accum Sales Ending (editable)
            Number(mainObj.oldGrandTotal) || 0, // F: Grand Accum Beg Balance (editable)
            0, // G: Manual SI Sales (editable)
            Number(mainObj.grossSales) || 0, // H: Gross Sales for the Day (editable)
            Number(mainObj.vatableSales) || 0, // I: VATable Sales (editable)
            Number(mainObj.vatAmount) || 0, // J: VAT Amount (editable)
            Number(mainObj.vatableExemptSales) || Number(mainObj.grossSales) || 0, // K: VAT-Exempt Sales (editable)
            Number(mainObj.zeroRatedSales) || 0, // L: Zero-Rated Sales (editable)
            Number(mainObj.seniorCitizenDiscount) || 0, // M: Discount SC (editable)
            Number(mainObj.pwdDiscount) || 0, // N: PWD (editable)
            Number(mainObj.studentDiscount) || 0, // O: Student (editable)
            null, // P: Total Deductions (formula)
            0, // Q: Discount SC (VAT Adj) (editable)
            0, // R: PWD (VAT Adj) (editable)
            0, // S: Others (editable)
            0, // T: VAT on Returns (editable)
            null, // U: Total VAT Adjustment (formula)
            null, // V: VAT Payable (formula)
            Number(mainObj.netSales) || 0, // W: Net Sales (editable)
            0, // X: Sales Overrun (editable)
            null, // Y: Total Income (formula)
            mainObj.resetCount || mainObj.restCounterNo || '0', // Z: Reset Counter (editable)
            mainObj.zReadingCount || mainObj.zCounterNo || '0', // AA: Z-Counter (editable)
            '' // AB: Remarks (editable)
        ];

        const summaryRow = worksheet.addRow(summaryRowData);
        summaryRow.height = 20;
        summaryRowIndices.push(rowIndex);

        // Add formulas to summary row
        // P: Total Deductions = M + N + O
        worksheet.getCell(`P${rowIndex}`).value = { formula: `M${rowIndex}+N${rowIndex}+O${rowIndex}` };
        // U: Total VAT Adjustment = Q + R + S + T
        worksheet.getCell(`U${rowIndex}`).value = { formula: `Q${rowIndex}+R${rowIndex}+S${rowIndex}+T${rowIndex}` };
        // V: VAT Payable = J - U
        worksheet.getCell(`V${rowIndex}`).value = { formula: `J${rowIndex}-U${rowIndex}` };
        // Y: Total Income = H - P (Gross Sales - Total Deductions)
        worksheet.getCell(`Y${rowIndex}`).value = { formula: `H${rowIndex}-P${rowIndex}` };

        // Style summary row with light blue background
        summaryRow.eachCell((cell, colNumber) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "E6F3FF" }
            };
            cell.font = { bold: true, size: 9 };

            const borderStyle = { style: 'thin', color: { argb: '000000' } };
            cell.border = {
                top: borderStyle, bottom: borderStyle,
                left: borderStyle, right: borderStyle
            };

            if (colNumber === 1) {
                cell.alignment = { horizontal: "left", vertical: "middle" };
            } else if (colNumber >= 5 && colNumber <= 25) {
                cell.alignment = { horizontal: "right", vertical: "middle" };
                cell.numFmt = '#,##0.00';
            } else {
                cell.alignment = { horizontal: "center", vertical: "middle" };
            }
        });

        rowIndex++;

        // --- DETAIL ROWS (passenger type breakdown) ---
        if (passengerSummary && passengerSummary.length > 0) {
            passengerSummary.forEach(ptype => {
                const passengerType = ptype.passengerType || 'Adult';
                const totalTicketCost = Number(ptype.totalTicketCost) || 0;
                const totalDiscount = Number(ptype.totalDiscount) || 0;
                const totalNetAmount = Number(ptype.totalNetAmount) || 0;

                // Calculate discounts by type (approximate based on passenger type)
                let scDiscount = 0;
                let pwdDiscount = 0;
                let studentDiscount = 0;

                if (passengerType.toLowerCase().includes('senior') || passengerType.toLowerCase().includes('sc')) {
                    scDiscount = totalDiscount;
                } else if (passengerType.toLowerCase().includes('pwd')) {
                    pwdDiscount = totalDiscount;
                } else if (passengerType.toLowerCase().includes('student')) {
                    studentDiscount = totalDiscount;
                }

                const detailRowData = [
                    '', // A: Date (blank)
                    passengerType, // B: Passenger Type (editable)
                    '', // C: Beginning SI (blank)
                    '', // D: Ending SI (blank)
                    '', // E: Grand Accum. Sales Ending Balance (blank)
                    '', // F: Grand Accum. Beg. Balance (blank)
                    '', // G: Manual SI Sales (blank)
                    totalTicketCost, // H: Gross Sales for the Day (per type) (editable)
                    0, // I: VATable Sales (editable)
                    0, // J: VAT Amount (editable)
                    totalTicketCost, // K: VAT-Exempt Sales (per type) (editable)
                    0, // L: Zero-Rated Sales (editable)
                    scDiscount, // M: Discount SC (per type) (editable)
                    pwdDiscount, // N: PWD (per type) (editable)
                    studentDiscount, // O: Student (per type) (editable)
                    null, // P: Total Deductions (formula)
                    0, // Q: Discount SC (VAT Adj) (editable)
                    0, // R: PWD (VAT Adj) (editable)
                    0, // S: Others (editable)
                    0, // T: VAT on Returns (editable)
                    null, // U: Total VAT Adjustment (formula)
                    null, // V: VAT Payable (formula)
                    totalNetAmount, // W: Net Sales (per type) (editable)
                    0, // X: Sales Overrun (editable)
                    null, // Y: Total Income (formula)
                    '', // Z: Reset Counter
                    '', // AA: Z-Counter
                    ''  // AB: Remarks (editable)
                ];

                const detailRow = worksheet.addRow(detailRowData);
                detailRow.height = 20;

                // Add formulas to detail row
                // P: Total Deductions = M + N + O
                worksheet.getCell(`P${rowIndex}`).value = { formula: `M${rowIndex}+N${rowIndex}+O${rowIndex}` };
                // U: Total VAT Adjustment = Q + R + S + T
                worksheet.getCell(`U${rowIndex}`).value = { formula: `Q${rowIndex}+R${rowIndex}+S${rowIndex}+T${rowIndex}` };
                // V: VAT Payable = J - U
                worksheet.getCell(`V${rowIndex}`).value = { formula: `J${rowIndex}-U${rowIndex}` };
                // Y: Total Income = H - P (Gross Sales - Total Deductions)
                worksheet.getCell(`Y${rowIndex}`).value = { formula: `H${rowIndex}-P${rowIndex}` };

                // Style detail rows
                detailRow.eachCell((cell, colNumber) => {
                    const borderStyle = { style: 'thin', color: { argb: '000000' } };
                    cell.border = {
                        top: borderStyle, bottom: borderStyle,
                        left: borderStyle, right: borderStyle
                    };
                    cell.font = { size: 9 };

                    if (colNumber === 1) {
                        cell.alignment = { horizontal: "left", vertical: "middle" };
                    } else if (colNumber >= 5 && colNumber <= 25) {
                        cell.alignment = { horizontal: "right", vertical: "middle" };
                        cell.numFmt = '#,##0.00';
                    } else {
                        cell.alignment = { horizontal: "center", vertical: "middle" };
                    }
                });

                rowIndex++;
            });
        }
    });

    // --- GRAND TOTAL ROW WITH FORMULAS ---
    const dataEndRow = rowIndex - 1;

    const grandTotalRowData = [
        'GRAND TOTAL', // A: Date
        '', // B: Passenger Type
        '', // C: Beginning SI
        '', // D: Ending SI
        '', // E: Grand Accum. Sales Ending Balance
        '', // F: Grand Accum. Beg. Balance
        null, // G: Manual SI Sales (formula)
        null, // H: Gross Sales for the Day (formula)
        null, // I: VATable Sales (formula)
        null, // J: VAT Amount (formula)
        null, // K: VAT-Exempt Sales (formula)
        null, // L: Zero-Rated Sales (formula)
        null, // M: Discount SC (formula)
        null, // N: PWD (formula)
        null, // O: Student (formula)
        null, // P: Total Deductions (formula)
        null, // Q: Discount SC (VAT Adj) (formula)
        null, // R: PWD (VAT Adj) (formula)
        null, // S: Others (formula)
        null, // T: VAT on Returns (formula)
        null, // U: Total VAT Adjustment (formula)
        null, // V: VAT Payable (formula)
        null, // W: Net Sales (formula)
        null, // X: Sales Overrun (formula)
        null, // Y: Total Income (formula)
        '', // Z: Reset Counter
        '', // AA: Z-Counter
        ''  // AB: Remarks
    ];

    const grandTotalRow = worksheet.addRow(grandTotalRowData);
    grandTotalRow.height = 25;
    const grandTotalRowNum = grandTotalRow.number;

    // Prepare summary row indices for summation (e.g., G5,G8,G11)
    const summaryRows = summaryRowIndices.map(r => `${r}`).join(',');

    // Add SUM formulas for grand total row (only summary rows)
    worksheet.getCell(`G${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `G${r}`).join(',')})` };
    worksheet.getCell(`H${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `H${r}`).join(',')})` };
    worksheet.getCell(`I${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `I${r}`).join(',')})` };
    worksheet.getCell(`J${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `J${r}`).join(',')})` };
    worksheet.getCell(`K${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `K${r}`).join(',')})` };
    worksheet.getCell(`L${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `L${r}`).join(',')})` };
    worksheet.getCell(`M${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `M${r}`).join(',')})` };
    worksheet.getCell(`N${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `N${r}`).join(',')})` };
    worksheet.getCell(`O${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `O${r}`).join(',')})` };
    worksheet.getCell(`P${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `P${r}`).join(',')})` };
    worksheet.getCell(`Q${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `Q${r}`).join(',')})` };
    worksheet.getCell(`R${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `R${r}`).join(',')})` };
    worksheet.getCell(`S${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `S${r}`).join(',')})` };
    worksheet.getCell(`T${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `T${r}`).join(',')})` };
    worksheet.getCell(`U${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `U${r}`).join(',')})` };
    worksheet.getCell(`V${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `V${r}`).join(',')})` };
    worksheet.getCell(`W${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `W${r}`).join(',')})` };
    worksheet.getCell(`X${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `X${r}`).join(',')})` };
    worksheet.getCell(`Y${grandTotalRowNum}`).value = { formula: `SUM(${summaryRowIndices.map(r => `Y${r}`).join(',')})` };

    // Style grand total row
    grandTotalRow.eachCell((cell, colNumber) => {
        // Yellow background for grand total row
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF99" }
        };

        // Bold font
        cell.font = { bold: true, size: 9 };

        // Borders
        const borderStyle = { style: 'thin', color: { argb: '000000' } };
        cell.border = {
            top: borderStyle, bottom: borderStyle,
            left: borderStyle, right: borderStyle
        };

        // Alignment
        if (colNumber === 1) {
            cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (colNumber >= 5 && colNumber <= 25) {
            cell.alignment = { horizontal: "right", vertical: "middle" };
            cell.numFmt = '#,##0.00';
        } else {
            cell.alignment = { horizontal: "center", vertical: "middle" };
        }
    });

    // Set row heights for header rows
    worksheet.getRow(3).height = 35;
    worksheet.getRow(4).height = 35;

    // Export the workbook
    let buffer;
    try {
        buffer = await workbook.xlsx.writeBuffer();
    } catch (error) {
        console.error('Error generating Excel buffer:', error);
        return { success: false, message: "Failed to generate Excel file", error };
    }

    if (!buffer) {
        return { success: false, message: "Failed to generate Excel buffer" };
    }

    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    try {
        saveAs(blob, `${fileName}.xlsx`);
    } catch (error) {
        console.error('Error saving file:', error);
        return { success: false, message: "Failed to save file", error };
    }

    return { success: true, message: "Export completed successfully" };
};

// Export to Excel with ExcelJS
const exportTransactionReports = async (data, filters = {}) => {
    try {
        const ExcelJS = require('exceljs');
        const { saveAs } = require('file-saver');

        // Check if required modules are available
        if (!ExcelJS) {
            throw new Error('ExcelJS module not available');
        }
        if (!saveAs) {
            throw new Error('file-saver module not available');
        }

        // Create workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Transactions");

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A1:L1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "Transaction History Report";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { bold: true, size: 16 };

        // Add date range subtitle
        worksheet.mergeCells("A2:L2");
        const subtitleCell = worksheet.getCell("A2");
        const dateFrom = filters.dateFrom ? formatDateToMMDDYYYY(filters.dateFrom) : 'All time';
        const dateTo = filters.dateTo ? formatDateToMMDDYYYY(filters.dateTo) : 'Present';
        subtitleCell.value = `Generated on: ${formatDateToMMDDYYYY(new Date())} | Period: ${dateFrom} to ${dateTo}`;
        subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
        subtitleCell.font = { italic: true, size: 12 };

        // Define columns
        const columns = [
            { header: 'Invoice No.', key: 'ticketId', width: 20 },
            { header: 'Bus Number', key: 'busNumber', width: 15 },
            { header: 'Machine Serial No', key: 'machineSerialNo', width: 22 },
            { header: 'Passenger', key: 'passenger', width: 25 },
            { header: 'Payment Method', key: 'paymentMethod', width: 20 },
            { header: 'Transaction Time', key: 'transactionTime', width: 22 },
            { header: 'Passenger Type', key: 'passengerType', width: 15 },
            { header: 'Route Name', key: 'routeName', width: 15 },
            { header: 'ID Number', key: 'idNumber', width: 20 },
            { header: 'Contact Number', key: 'contactNumber', width: 18 },
            { header: 'Gross Amount', key: 'totalAmount', width: 15 },
            { header: 'Discount', key: 'discount', width: 15 },
            { header: 'Net Amount', key: 'amount', width: 15 },
            { header: 'VAT Exempt Sales', key: 'vatExemptSales', width: 15 },
            { header: 'VAT Amount', key: 'vatAmount', width: 15 },
            { header: 'Vatable Sales', key: 'vatableSales', width: 15 },
        ];

        // Add header row but do NOT set worksheet.columns directly
        // This prevents ExcelJS from automatically using 'key' values as potential headers

        // Skip rows for title and subtitle
        const headerRow = worksheet.getRow(4);
        columns.forEach((column, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = column.header;

            // Set column width individually instead of using worksheet.columns
            worksheet.getColumn(index + 1).width = column.width;
        });

        // Style header row
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'add8e6' }  // Light blue background
            };
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        headerRow.height = 22;

        // Add data rows
        let totalAmount = 0;
        let totalDiscount = 0;
        let totalNetAmount = 0;
        let totalVAT = 0;
        let totalVatableSales = 0;
        let totalVatExemptSales = 0;

        data.forEach((ticket, index) => {
            // Calculate discount amount from percentage
            const discountAmount = ticket.ticket_cost * (ticket.discount / 100);
            const netAmount = ticket.ticket_cost - discountAmount;
            // Build row data manually
            const rowData = [
                safeAddPadding(ticket.ticket_id),
                ticket?.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A',
                ticket?.machine?.serial_number || 'N/A',
                ticket.registered_name || 'N/A',
                ticket.payment_method?.replace(/_/g, ' ') || 'N/A',
                formatDateToMMDDYYYY(ticket.created_at),
                ticket.passenger_type || 'N/A',
                ticket.vehicle_route?.route?.route_name || 'N/A',
                ticket.passenger_id_no || 'N/A',
                ticket.registered_phone || 'N/A',
                `${ticket.ticket_cost.toFixed(2)}`,
                discountAmount,
                netAmount,
                ticket.ticket_cost || 0,
                ticket.vat_amount,
                ticket.vatable_sales || 0,
            ];

            const row = worksheet.addRow(rowData);

            // Apply zebra striping
            if (index % 2 === 1) {
                row.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5f5f5' }  // Light gray for alternating rows
                    };
                });
            }

            // Number formatting
            const amountCell = row.getCell(4);
            amountCell.numFmt = '#,##0.00';
            amountCell.alignment = { horizontal: 'right' };

            const totalAmountCell = row.getCell(12);
            totalAmountCell.numFmt = '#,##0.00';
            totalAmountCell.alignment = { horizontal: 'right' };

            const discountCell = row.getCell(13);
            discountCell.numFmt = '#,##0.00';
            discountCell.alignment = { horizontal: 'right' };

            const vatCell = row.getCell(14);
            vatCell.numFmt = '#,##0.00';
            vatCell.alignment = { horizontal: 'right' };

            const vatableSalesCell = row.getCell(15);
            vatableSalesCell.numFmt = '#,##0.00';
            vatableSalesCell.alignment = { horizontal: 'right' };

            const vatExemptSalesCell = row.getCell(16);
            vatExemptSalesCell.numFmt = '#,##0.00';
            vatExemptSalesCell.alignment = { horizontal: 'right' };

            // Track totals
            totalAmount += ticket.ticket_cost;
            totalDiscount += discountAmount;
            totalNetAmount += netAmount;
            totalVAT += ticket.vat_amount;
            totalVatableSales += ticket.vatable_sales || 0;
            totalVatExemptSales += ticket.ticket_cost || 0;
        });

        // Add a row of space before the summary
        worksheet.addRow([]);

        // Add summary section with grand totals
        const summaryRow = worksheet.addRow([
            'Grand Total', '', '', '', '', '', '', '', '', '',
            `${totalAmount.toFixed(2)}`, // Gross Amount with peso sign
            totalDiscount, // Discount
            totalNetAmount, // Net Amount
            totalVatExemptSales, // VAT Exempt Sales
            totalVAT, // VAT Amount
            totalVatableSales // Vatable Sales
        ]);
        summaryRow.font = { bold: true };

        // Format total cells
        const totalCell = summaryRow.getCell(12);
        totalCell.numFmt = '#,##0.00';
        totalCell.alignment = { horizontal: 'right' };

        const totalDiscountCell = summaryRow.getCell(13);
        totalDiscountCell.numFmt = '#,##0.00';
        totalDiscountCell.alignment = { horizontal: 'right' };

        const netAmountCell = summaryRow.getCell(14);
        netAmountCell.numFmt = '#,##0.00';
        netAmountCell.alignment = { horizontal: 'right' };

        const totalVatExemptSalesCell = summaryRow.getCell(15);
        totalVatExemptSalesCell.numFmt = '#,##0.00';
        totalVatExemptSalesCell.alignment = { horizontal: 'right' };

        const totalVatCell = summaryRow.getCell(16);
        totalVatCell.numFmt = '#,##0.00';
        totalVatCell.alignment = { horizontal: 'right' };

        const totalVatableSalesCell = summaryRow.getCell(17);
        totalVatableSalesCell.numFmt = '#,##0.00';
        totalVatableSalesCell.alignment = { horizontal: 'right' };

        // Style summary row
        summaryRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'add8e6' }  // Light blue background
            };
        });
        summaryRow.height = 22;

        // Set autofilter for the data columns (A4:K4)
        worksheet.autoFilter = {
            from: { row: 4, column: 1 },
            to: { row: 4, column: 11 }
        };

        // Set column widths explicitly for all 11 columns
        worksheet.columns = [
            { width: 13 }, // Date
            { width: 28 }, // Name
            { width: 18 }, // OSCA ID
            { width: 16 }, // SC TIN
            { width: 16 }, // SI Number
            { width: 18 }, // Sales
            { width: 14 }, // VAT Amount
            { width: 18 }, // VAT Exempt
            { width: 14 }, // Discount 5
            { width: 14 }, // Discount 20
            { width: 16 }, // Net Sales
        ];

        // Generate Excel file and trigger download
        const date = new Date().toISOString().split('T')[0];
        const fileName = `transactions_export_${date}`;
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        saveAs(blob, `${fileName}.xlsx`);

        return { success: true, message: "Export completed successfully" };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, message: "Failed to export data", error };
    }
};

const exportAnexAReport = async (users, fileName, startDate, endDate, plateNo, serialNo) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nSALES REPORT\nALL (Regular, Senior, Student, PWD)\nPlate NO.: ${plateNo}\nMIN: N/A\nSN: ${serialNo}\n`;
    titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    titleCell.font = { bold: true, size: 12 };
    worksheet.getRow(1).height = 90;

    worksheet.mergeCells("H1:I1");
    const dateRangeCell = worksheet.getCell("H1");
    const dateObj = new Date();
    const formattedDate = dateObj.toISOString().split('T')[0];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    dateRangeCell.value = `Date Generated: ${formattedDate}\r\nTime: ${formattedTime}`;
    dateRangeCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    dateRangeCell.font = { bold: true, size: 12 };

    worksheet.getCell("A2").value = `For the period: ${startDate} to ${endDate}`;
    worksheet.getCell("A2").alignment = { horizontal: "left" };
    worksheet.getCell("A3").value = "";

    const headers = [
        "Transaction Date",
        "Passenger Type",
        "Invoice No.",
        "Name",
        "Card NO",
        "Boarded",
        "Gross Sales(CAD)",
        "Discount(CAD)",
        "Net Sales(CAD)"
    ];

    // Store the header row number for filter reference
    const headerRowNumber = 4; // Row 4 since we have title, date range, and blank row above
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4CAF50" } // Material Design Green 500
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    let totalGross = 0;
    let totalDiscount = 0;
    let totalNet = 0;

    users.forEach((user) => {
        const gross = user.ticket_cost;
        const discount = +(gross * (user.discount / 100)).toFixed(2);
        const net = +(gross - discount).toFixed(2); // Calculate net properly

        totalGross += gross;
        totalDiscount += discount;
        totalNet += net;

        const dataRow = worksheet.addRow([
            formatDateToMMDDYYYY(user.boarded_at),
            // user.passenger_type,
            'REGULAR',
            safeAddPadding(user.ticket_id),
            user.registered_name,
            user.card_no || 'N/A',
            user.boarded ? 'N/A' : 'N/A',
            gross,
            discount,
            net
        ]);

        // Add borders to data rows
        dataRow.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });
    });

    // Add AutoFilter to the header row (applies to all columns)
    // The range starts from the header row and includes all data rows
    const lastDataRow = worksheet.lastRow.number;
    worksheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: lastDataRow, column: headers.length }
    };

    // Add Grand Total Row
    const totalRowNumber = worksheet.lastRow.number + 1;
    worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);
    const labelCell = worksheet.getCell(`A${totalRowNumber}`);
    labelCell.value = "Grand Total";
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: "right", vertical: "middle" };
    labelCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

    const totalRow = worksheet.getRow(totalRowNumber);
    totalRow.getCell(7).value = +totalGross.toFixed(2);
    totalRow.getCell(8).value = +totalDiscount.toFixed(2);
    totalRow.getCell(9).value = +totalNet.toFixed(2);

    [7, 8, 9].forEach((col) => {
        const cell = totalRow.getCell(col);
        cell.font = { bold: true };
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    worksheet.columns = [
        { width: 15 },  // Transaction Date
        { width: 20 },  // Passenger Type
        { width: 40 },  // Invoice No.
        { width: 25 },  // Name
        { width: 15 },  // Card NO
        { width: 12 },  // Boarded
        { width: 18 },  // Gross Sales
        { width: 18 },  // Discount
        { width: 18 },  // Net Sales
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportSeniorCitizenReport = async (users, fileName, startDate = "", endDate = "", serialNo) => {
    try {
        // Validate input
        if (!users || !Array.isArray(users)) {
            console.error('Invalid users data:', users);
            return { success: false, message: "Invalid data provided" };
        }



        const ExcelJS = require('exceljs');
        const { saveAs } = require('file-saver');

        // Check if required modules are available
        if (!ExcelJS) {
            throw new Error('ExcelJS module not available');
        }
        if (!saveAs) {
            throw new Error('file-saver module not available');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sheet1");

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A1:K1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nPlate NO.: All\nMIN: N/A \nSN: ${serialNo}\nFor the period: ${startDate} to ${endDate}`;
        titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        titleCell.font = { bold: true, size: 12 };
        const titleRow = worksheet.getRow(1);
        titleRow.height = 100;

        // Table Title Cell
        worksheet.mergeCells(`A4:K4`);
        const tableTitleCell = worksheet.getCell("A4");
        tableTitleCell.alignment = { horizontal: "center" };
        tableTitleCell.font = { size: 16 }
        tableTitleCell.value = "Senior Citizen Sales Book/Report";

        // --- HEADER SETUP TO MATCH SAMPLE IMAGE ---
        // Start headers at row 4 (after title and date range)
        const headerStartRow = 5;

        // 1. Merge cells for all columns except Discount (vertically)
        worksheet.mergeCells(`A${headerStartRow}:A${headerStartRow + 1}`);
        worksheet.mergeCells(`B${headerStartRow}:B${headerStartRow + 1}`);
        worksheet.mergeCells(`C${headerStartRow}:C${headerStartRow + 1}`);
        worksheet.mergeCells(`D${headerStartRow}:D${headerStartRow + 1}`);
        worksheet.mergeCells(`E${headerStartRow}:E${headerStartRow + 1}`);
        worksheet.mergeCells(`F${headerStartRow}:F${headerStartRow + 1}`);
        worksheet.mergeCells(`G${headerStartRow}:G${headerStartRow + 1}`);
        worksheet.mergeCells(`H${headerStartRow}:H${headerStartRow + 1}`);
        worksheet.mergeCells(`K${headerStartRow}:K${headerStartRow + 1}`);

        // 2. Merge Discount horizontally (I and J in row 5)
        worksheet.mergeCells(`I${headerStartRow}:J${headerStartRow}`);

        // 3. Set parent header values (row 5)
        worksheet.getCell(`A${headerStartRow}`).value = 'Date';
        worksheet.getCell(`B${headerStartRow}`).value = 'Name of Senior Citizen (SC)';
        worksheet.getCell(`C${headerStartRow}`).value = 'OSCA ID No./SC ID No.';
        worksheet.getCell(`D${headerStartRow}`).value = 'SC TIN';
        worksheet.getCell(`E${headerStartRow}`).value = 'SI Number';
        worksheet.getCell(`F${headerStartRow}`).value = 'Sales (inclusive of VAT)';
        worksheet.getCell(`G${headerStartRow}`).value = 'VAT Amount';
        worksheet.getCell(`H${headerStartRow}`).value = 'VAT Exempt Sales';
        worksheet.getCell(`I${headerStartRow}`).value = 'Discount';
        worksheet.getCell(`K${headerStartRow}`).value = 'Net Sales';

        // 4. Set Discount sub-headers (row 6)
        worksheet.getCell(`I${headerStartRow + 1}`).value = '5%';
        worksheet.getCell(`J${headerStartRow + 1}`).value = '20%';

        // 5. Apply colors and styles to main headers
        const parentHeaderColors = [
            'A6A6A6',  // Date - Gray
            '00B0F0',  // Name of Senior - Blue
            'FFFF00',  // OSCA ID No./SC ID No. - Yellow
            'B4A7D6',  // SC TIN - Purple/Lavender (same as Card No was)
            'FFC000',  // SI Number - Orange
            '92D050',  // Sales (inclusive of VAT) - Green
            'ED7D31',  // VAT Amount - Orange
            'E7E6E6',  // VAT Exempt - Light Gray
            'FFE699',  // Discount 5% - Light Yellow
            'FFE699',  // Discount 20% - Light Yellow
            'A6A6A6'   // Net Sales - Gray
        ];

        // Style main header cells
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'].forEach((col, idx) => {
            const cell = worksheet.getCell(`${col}${headerStartRow}`);
            let color = parentHeaderColors[idx];
            if (color) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: color }
                };
            }
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Style discount sub-header cells
        worksheet.getCell(`I${headerStartRow + 1}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE699' }
        };
        worksheet.getCell(`J${headerStartRow + 1}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD966' }
        };

        worksheet.getCell(`I${headerStartRow + 1}`).font = { bold: true };
        worksheet.getCell(`J${headerStartRow + 1}`).font = { bold: true };
        worksheet.getCell(`I${headerStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`J${headerStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`I${headerStartRow + 1}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        worksheet.getCell(`J${headerStartRow + 1}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Set row heights
        worksheet.getRow(headerStartRow).height = 24;
        worksheet.getRow(headerStartRow + 1).height = 20;
        // --- END HEADER SETUP ---

        // Add data rows and calculate totals
        let totalVatableSales = 0;
        let totalVatAmount = 0;
        let totalDiscount5 = 0;
        let totalDiscount20 = 0;
        let totalNetSales = 0;

        const dataStartRow = headerStartRow + 2; // Row 6

        const data = users.map((user, index) => {
            // Ensure user is an object
            if (!user || typeof user !== 'object') {
                console.warn('Invalid user data at index', index, user);
                return [
                    'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 0, 0, 0, 0, 0, 'N/A'
                ];
            }

            // Safe discount calculation
            const ticketCost = user.ticket_cost || 0;
            const discountPercent = user.discount || 0;
            const discount = ticketCost * (discountPercent / 100);

            // Separate 5% and 20% discounts based on discount percentage
            const discount5 = discountPercent === 5 ? discount : 0;
            const discount20 = discountPercent === 20 ? discount : 0;

            totalVatableSales += user.vatable_sales || 0;
            totalVatAmount += user.vat_amount || 0;
            totalDiscount5 += discount5;
            totalDiscount20 += discount20;
            totalNetSales += user.net_amount || 0;

            // Safe date conversion
            let dateStr = 'N/A';
            try {
                if (user.boarded_at) {
                    dateStr = formatDateToMMDDYYYY(user.boarded_at);
                } dateStr = formatDateToMMDDYYYY(user.boarded_at)
            } catch (error) {
                //console.warn('Error parsing date:', user.boarded_at, error);
            }

            // Safe string conversions
            const registeredName = user.registered_name || 'N/A';
            const scTin = user.tin ? formatTINDash(user.tin) : 'N/A';
            const passengerIdNo = user.passenger_id_no || 'N/A';

            return [
                dateStr,
                registeredName,
                passengerIdNo,
                scTin,
                safeAddPadding(user.ticket_id) || 'N/A',
                user.vatable_sales || 0,
                user.vat_amount || 0,
                user.ticket_cost || 0,
                discount5,
                discount20,
                user.net_amount || 0
            ];
        });

        data.forEach((row, index) => {
            const dataRow = worksheet.addRow(row);

            // Apply zebra striping
            if (index % 2 === 1) {
                dataRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5f5f5' }, // Light gray for alternating rows
                    };
                });
            }

            // Safe number formatting for numeric columns
            try {
                // Format currency columns (columns 6-11 after removing Card No)
                [6, 7, 8, 9, 10, 11].forEach(colIndex => {
                    const cell = dataRow.getCell(colIndex);
                    if (cell.value !== null && cell.value !== undefined && typeof cell.value === 'number') {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                    }
                });
            } catch (error) {
                console.warn('Error formatting row', index, error);
            }
        });

        // Calculate total VAT exempt sales correctly
        // Total VAT Exempt Sales = Total Discount + Total Net Sales
        const totalVatExemptSales = totalDiscount5 + totalDiscount20 + totalNetSales;

        // Add a row of space before the summary
        worksheet.addRow([]);

        // Add summary row with totals (removed one empty string for Card No column)
        const summaryRow = worksheet.addRow([
            'Total', '', '', '', '',
            totalVatableSales,
            totalVatAmount,
            totalVatExemptSales,  // Corrected calculation
            totalDiscount5,
            totalDiscount20,
            totalNetSales
        ]);
        summaryRow.font = { bold: true };
        summaryRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'add8e6' }  // Light blue background
            };
        });
        summaryRow.height = 22;

        // Safe format total cells (updated column indices after removing Card No)
        try {
            [6, 7, 8, 9, 10, 11].forEach(colIndex => {
                const cell = summaryRow.getCell(colIndex);
                if (cell.value !== null && cell.value !== undefined && typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                }
            });
        } catch (error) {
            console.warn('Error formatting summary row:', error);
        }

        // Add autofilter to header row (updated column count to 11 after removing Card No)
        if (data.length > 0) {
            worksheet.autoFilter = {
                from: { row: dataStartRow, column: 1 },
                to: { row: dataStartRow + data.length - 1, column: 11 }
            };
        }

        // Column Widths (removed Card No column)
        worksheet.columns = [
            { width: 15 }, // Date
            { width: 25 }, // Name
            { width: 18 }, // OSCA ID No./SC ID No.
            { width: 18 }, // SC TIN
            { width: 20 }, // SI Number
            { width: 18 }, // Sales
            { width: 15 }, // VAT Amount
            { width: 18 }, // VAT Exempt Sales
            { width: 12 }, // Discount 5%
            { width: 12 }, // Discount 20%
            { width: 15 }  // Net Sales
        ];

        // Export the workbook
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `${fileName}.xlsx`);

        return { success: true, message: "Export completed successfully" };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, message: "Failed to export data", error };
    }
};

const exportDisablePersonReport = async (users, fileName, startDate = "", endDate = "", serialNo) => {
    try {
        // Validate input
        if (!users || !Array.isArray(users)) {
            console.error('Invalid users data:', users);
            return { success: false, message: "Invalid data provided" };
        }



        const ExcelJS = require('exceljs');
        const { saveAs } = require('file-saver');

        // Check if required modules are available
        if (!ExcelJS) {
            throw new Error('ExcelJS module not available');
        }
        if (!saveAs) {
            throw new Error('file-saver module not available');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("PWD Report");

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A1:J1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nPlate NO.: All\nMIN: N/A\nSN: ${serialNo}\nFor the period: ${startDate} to ${endDate}`;
        titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        titleCell.font = { bold: true, size: 12 };
        const titleRow = worksheet.getRow(1);
        titleRow.height = 100;

        // Date Range Row
        // const dateRangeCell = worksheet.getCell("A2");
        // dateRangeCell.value = `Date Range: ${startDate || 'All time'} to ${endDate || 'Present'}`;
        // dateRangeCell.alignment = { horizontal: "left" };
        // dateRangeCell.font = { italic: true, size: 12 };

        // Table Title Cell

        worksheet.mergeCells(`A4:J4`);
        const tableTitleCell = worksheet.getCell("A4");
        tableTitleCell.alignment = { horizontal: "center" };
        tableTitleCell.font = { size: 16 }
        tableTitleCell.value = "Persons with Disability Sales Book/Report";

        // --- HEADER SETUP ---
        const headerStartRow = 5;

        // 1. Merge cells for all columns except Discount (vertically)
        worksheet.mergeCells(`A${headerStartRow}:A${headerStartRow + 1}`);
        worksheet.mergeCells(`B${headerStartRow}:B${headerStartRow + 1}`);
        worksheet.mergeCells(`C${headerStartRow}:C${headerStartRow + 1}`);
        worksheet.mergeCells(`D${headerStartRow}:D${headerStartRow + 1}`);
        worksheet.mergeCells(`E${headerStartRow}:E${headerStartRow + 1}`);
        worksheet.mergeCells(`F${headerStartRow}:F${headerStartRow + 1}`);
        worksheet.mergeCells(`G${headerStartRow}:G${headerStartRow + 1}`);
        worksheet.mergeCells(`H${headerStartRow}:H${headerStartRow + 1}`);
        worksheet.mergeCells(`K${headerStartRow}:K${headerStartRow + 1}`);

        // 2. Merge Discount horizontally (I and J in row 5)
        worksheet.mergeCells(`I${headerStartRow}:J${headerStartRow}`);

        // 3. Set parent header values (row 5)
        worksheet.getCell(`A${headerStartRow}`).value = 'Date';
        worksheet.getCell(`B${headerStartRow}`).value = 'Name of Person with Disability (PWD)';
        worksheet.getCell(`C${headerStartRow}`).value = 'PWD ID No.';
        worksheet.getCell(`D${headerStartRow}`).value = 'PWD TIN';
        worksheet.getCell(`E${headerStartRow}`).value = 'SI Number';
        worksheet.getCell(`F${headerStartRow}`).value = 'Sales (inclusive of VAT)';
        worksheet.getCell(`G${headerStartRow}`).value = 'VAT Amount';
        worksheet.getCell(`H${headerStartRow}`).value = 'VAT Exempt Sales';
        worksheet.getCell(`I${headerStartRow}`).value = 'Discount';
        worksheet.getCell(`K${headerStartRow}`).value = 'Net Sales';

        // 4. Set Discount sub-headers (row 6)
        worksheet.getCell(`I${headerStartRow + 1}`).value = '5%';
        worksheet.getCell(`J${headerStartRow + 1}`).value = '20%';

        // 5. Apply colors and styles to main headers (removed Card No, updated PWD TIN color to B4A7D6)
        const parentHeaderColors = [
            'A6A6A6', // A - Date
            '00B0F0', // B - Name
            'FFFF00', // C - PWD ID No.
            'B4A7D6', // D - PWD TIN (same as SC TIN color)
            'FFC000', // E - SI Number
            '92D050', // F - Sales
            'ED7D31', // G - VAT Amount
            'E7E6E6', // H - VAT Exempt Sales
            'FFE699', // I - Discount
            'A6A6A6'  // K - Net Sales
        ];

        // Style main header cells
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'K'].forEach((col, idx) => {
            const cell = worksheet.getCell(`${col}${headerStartRow}`);
            let color = parentHeaderColors[idx];
            if (color) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: color }
                };
            }
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Style discount sub-header cells
        worksheet.getCell(`I${headerStartRow + 1}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE699' }
        };
        worksheet.getCell(`J${headerStartRow + 1}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD966' }
        };

        worksheet.getCell(`I${headerStartRow + 1}`).font = { bold: true };
        worksheet.getCell(`J${headerStartRow + 1}`).font = { bold: true };
        worksheet.getCell(`I${headerStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`J${headerStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.getCell(`I${headerStartRow + 1}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
        worksheet.getCell(`J${headerStartRow + 1}`).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Set row heights
        worksheet.getRow(headerStartRow).height = 24;
        worksheet.getRow(headerStartRow + 1).height = 20;
        // --- END HEADER SETUP ---

        // Add data rows and calculate totals
        let totalVatableSales = 0;
        let totalVatAmount = 0;
        let totalDiscount5 = 0;
        let totalDiscount20 = 0;
        let totalNetSales = 0;

        const dataStartRow = headerStartRow + 2; // Row 6

        const data = users.map((user, index) => {
            // Ensure user is an object
            if (!user || typeof user !== 'object') {
                console.warn('Invalid user data at index', index, user);
                return [
                    'N/A', 'N/A', 'N/A', 'N/A', 'N/A', 0, 0, 0, 0, 0, 0
                ];
            }

            // Safe discount calculation
            const ticketCost = Number(user.ticket_cost) || 0;
            const discountPercent = Number(user.discount) || 0;
            const discount = ticketCost * (discountPercent / 100);

            // Separate 5% and 20% discounts based on discount percentage
            const discount5 = discountPercent === 5 ? discount : 0;
            const discount20 = discountPercent === 20 ? discount : 0;

            totalVatableSales += Number(user.vatable_sales) || 0;
            totalVatAmount += Number(user.vat_amount) || 0;
            totalDiscount5 += discount5;
            totalDiscount20 += discount20;
            totalNetSales += Number(user.net_amount) || 0;

            // Safe date conversion
            let dateStr = 'N/A';
            try {
                if (user.boarded_at) {
                    dateStr = formatDateToMMDDYYYY(user.boarded_at);
                }
            } catch (error) {
                //console.warn('Error parsing date:', user.created_at, error);
            }

            // Safe string conversions
            const registeredName = user.registered_name || 'N/A';
            const pwdTin = user.tin ? formatTINDash(user.tin) : 'N/A';
            const passengerIdNo = user.passenger_id_no || 'N/A';

            return [
                dateStr,
                registeredName,
                passengerIdNo,
                pwdTin,
                safeAddPadding(user.ticket_id),
                Number(user.vatable_sales) || 0,
                Number(user.vat_amount) || 0,
                ticketCost,  // Individual VAT Exempt Sales (ticket cost)
                discount5,
                discount20,
                Number(user.net_amount) || 0
            ];
        });

        data.forEach((row, index) => {
            const dataRow = worksheet.addRow(row);

            // Apply zebra striping
            if (index % 2 === 1) {
                dataRow.eachCell((cell) => {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'f5f5f5' }, // Light gray for alternating rows
                    };
                });
            }

            // Safe number formatting for numeric columns
            try {
                // Format currency columns (now columns 5-10 after removing Card No)
                [5, 6, 7, 8, 9, 10].forEach(colIndex => {
                    const cell = dataRow.getCell(colIndex);
                    if (cell.value !== null && cell.value !== undefined && typeof cell.value === 'number') {
                        cell.numFmt = '#,##0.00';
                        cell.alignment = { horizontal: 'right' };
                    }
                });
            } catch (error) {
                console.warn('Error formatting row', index, error);
            }
        });

        // Calculate total VAT exempt sales correctly
        // Total VAT Exempt Sales = Total Discount + Total Net Sales
        const totalVatExemptSales = totalDiscount5 + totalDiscount20 + totalNetSales;

        // Add a row of space before the summary
        worksheet.addRow([]);

        // Add summary row with totals
        const summaryRow = worksheet.addRow([
            'Total', '', '', '', '',
            totalVatableSales,
            totalVatAmount,
            totalVatExemptSales,  // Corrected calculation
            totalDiscount5,
            totalDiscount20,
            totalNetSales
        ]);
        summaryRow.font = { bold: true };
        summaryRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'add8e6' }  // Light blue background
            };
        });
        summaryRow.height = 22;

        // Safe format total cells (now columns 6-11)
        try {
            [6, 7, 8, 9, 10, 11].forEach(colIndex => {
                const cell = summaryRow.getCell(colIndex);
                if (cell.value !== null && cell.value !== undefined && typeof cell.value === 'number') {
                    cell.numFmt = '#,##0.00';
                    cell.alignment = { horizontal: 'right' };
                }
            });
        } catch (error) {
            console.warn('Error formatting summary row:', error);
        }

        // Add autofilter to header row
        if (data.length > 0) {
            worksheet.autoFilter = {
                from: { row: dataStartRow, column: 1 },
                to: { row: dataStartRow + data.length - 1, column: 11 }
            };
        }

        // Column Widths (11 columns now)
        worksheet.columns = [
            { width: 15 }, // Date
            { width: 30 }, // Name
            { width: 18 }, // PWD ID No.
            { width: 18 }, // PWD TIN
            { width: 20 }, // SI Number
            { width: 18 }, // Sales
            { width: 15 }, // VAT Amount
            { width: 18 }, // VAT Exempt Sales
            { width: 12 }, // Discount 5%
            { width: 12 }, // Discount 20%
            { width: 15 }  // Net Sales
        ];

        // Export the workbook
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `${fileName}.xlsx`);

        return { success: true, message: "Export completed successfully" };
    } catch (error) {
        console.error("Export error:", error);
        return { success: false, message: "Failed to export data", error };
    }
};

const exportStationReport = async (users, fileName, route, busStop) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    // Title Row (Merged and Centered)
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "DAILY RECORD OF BUS DISPATCHES AND ARRIVALS";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 14 };

    // Route Information (Left aligned)
    worksheet.mergeCells("A2:C2");
    const routeCell = worksheet.getCell("A2");
    routeCell.value = `Route: ${route}`;
    routeCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    routeCell.font = { bold: true, size: 12 };

    // Bus Stop Information (Left aligned, under route)
    worksheet.mergeCells("A3:C3");
    const busStopCell = worksheet.getCell("A3");
    busStopCell.value = `Bus Stop: ${busStop}`;
    busStopCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    busStopCell.font = { bold: true, size: 12 };

    // Date and Time Information (Right aligned)
    worksheet.mergeCells("D2:E3"); // Merge across 2 rows
    const dateRangeCell = worksheet.getCell("D2");

    const dateObj = new Date();
    const formattedDate = dateObj.toISOString().split('T')[0];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    const formattedTime = `${hours}:${minutes} ${ampm}`;
    dateRangeCell.value = `Date Generated: ${formattedDate}\nTime: ${formattedTime}`;
    dateRangeCell.alignment = {
        horizontal: "right",
        vertical: "top",
        wrapText: true
    };
    dateRangeCell.font = { bold: true, size: 12 };

    // Add some spacing between header and data
    worksheet.addRow([]); // Empty row for spacing

    // Headers
    const headers = [
        "TRIP NO.",
        "PLATE NO.",
        "ACTUAL DISPATCH TIME",
        "TOTAL PAX",
        "DRIVER",
    ];
    const headerRow = worksheet.addRow(headers);

    // Header Styling
    headerRow.eachCell((cell) => {
        cell.font = {
            bold: true,
            color: { argb: "000000" },
            size: 11
        };
        cell.alignment = {
            horizontal: "center",
            vertical: "middle",
            wrapText: true
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" }, // Light gray background for headers
        };
    });

    // Data Rows
    const data = users.map((user, index) => ([
        index + 1,
        user?.vehiclePlateNumber || "N/A",
        DateUtils.getFormattedDateTime(user.busStopTime) || "N/A",
        user?.count || "N/A",
        user?.driverName || "N/A",
    ]));

    data.forEach((row) => {
        const dataRow = worksheet.addRow(row);
        dataRow.eachCell((cell) => {
            cell.alignment = {
                horizontal: "left",
                vertical: "middle",
                wrapText: true
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            cell.font = {
                size: 11
            };
        });
    });

    // Auto-filter for headers
    worksheet.autoFilter = {
        from: {
            row: headerRow.number,
            column: 1
        },
        to: {
            row: headerRow.number,
            column: headers.length
        }
    };

    // Column Widths (optimized for content)
    worksheet.columns = [
        { width: 10 },  // TRIP NO.
        { width: 15 }, // PLATE NO.
        { width: 25 }, // ACTUAL DISPATCH TIME
        { width: 15 },  // TOTAL PAX
        { width: 30 },  // DRIVER
        { width: 15 },  // (empty)
        { width: 15 },  // (empty)
        { width: 30 },  // (empty)
    ];

    // Freeze header row
    worksheet.views = [
        {
            state: 'frozen',
            xSplit: 0,
            ySplit: headerRow.number,
            activeCell: 'A1'
        }
    ];

    // Export the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportBusTripReport = async (users, fileName, date) => {
    const workbook = new ExcelJS.Workbook();

    // Add this right after creating the workbook, before the users.forEach loop
    const summarySheet = workbook.addWorksheet('Summary');

    // Set up the summary table headers
    summarySheet.mergeCells('A1:J1');
    const summaryTitle = summarySheet.getCell('A1');
    summaryTitle.value = "BUS TRIP SUMMARY REPORT";
    summaryTitle.alignment = { horizontal: "center", vertical: "middle" };
    summaryTitle.font = { bold: true, size: 14 };
    summaryTitle.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
    };

    // Create bus plate no. row
    summarySheet.getCell('A3').value = "BUS PLATE NO.";
    summarySheet.getCell('A3').font = { bold: true };
    summarySheet.getCell('C3').value = users[0]?.vehicle_plate_number || "";

    // Create date row
    summarySheet.getCell('A4').value = "Date:";
    summarySheet.getCell('A4').font = { bold: true };
    summarySheet.getCell('C4').value = formatDateToMMDDYYYY(date);

    // Create column headers
    const headers = [
        "TRIP NO.", "Route No.", "Route", "Time Depart", "Bound",
        "Total Pax", "Driver", "Travel Run", "KM run"
    ];

    const headerRow = 6;
    for (let i = 0; i < headers.length; i++) {
        const cell = summarySheet.getCell(headerRow, i + 1);
        cell.value = headers[i];
        cell.font = { bold: true };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
    }

    // Add data rows
    users.forEach((user, index) => {
        const rowNum = headerRow + index + 1;

        //console.log('bus stops: ', user.bus_stop_list)
        const startStop = user.bus_stop_list[0]
        const endStop = user.bus_stop_list[user.bus_stop_list.length - 1]

        console.log('start: ', startStop)
        console.log('end: ', endStop)

        // Calculate total passengers
        const totalPassengers = user.bus_stop_list.reduce((sum, stop) => sum + (parseInt(stop.ticket_count) || 0), 0);

        // Calculate travel run time
        const departureTime = new Date(user.dispatch_time);
        console.log('departureTime: ', departureTime);
        const arrivalTime = new Date(user.arrival_time);
        const travelRun = `${new Date(arrivalTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}`;

        // Extract route number from route_name
        const routeNumber = user.route_name ? user.route_name.replace(/[^0-9]/g, '') : "";

        // Set row data
        summarySheet.getCell(rowNum, 1).value = index + 1; // Trip No.
        summarySheet.getCell(rowNum, 2).value = `Route ${routeNumber}`; // Route No.
        summarySheet.getCell(rowNum, 3).value = user.route_name; // Route
        summarySheet.getCell(rowNum, 4).value = formatDateToMMDDYYYY(user.dispatch_time); // Time Depart
        summarySheet.getCell(rowNum, 5).value = user.direction; // Bound
        summarySheet.getCell(rowNum, 6).value = totalPassengers; // Total Pax
        summarySheet.getCell(rowNum, 7).value = `${user.full_name}`; // Driver
        summarySheet.getCell(rowNum, 8).value = travelRun; // Travel Run
        summarySheet.getCell(rowNum, 9).value = `${user?.distance} KM` ?? ""; // KM run - placeholder for KM End - KM Start

        // Apply borders to all cells in the row
        for (let i = 1; i <= 9; i++) {
            const cell = summarySheet.getCell(rowNum, i);
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        }
    });

    // Auto-fit columns
    summarySheet.columns.forEach((column) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
                maxLength = columnLength;
            }
        });
        column.width = maxLength + 2;
    });

    users.forEach((user, no) => {
        const departureTime = new Date(user.dispatch_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
        const arrivalTime = new Date(user.arrival_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });

        const worksheetName = `No. ${no + 1} ${user.direction} (${departureTime}-${arrivalTime})`;
        const sanitizedName = sanitizeWorksheetName(worksheetName);

        const worksheet = workbook.addWorksheet(sanitizedName);

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A1:D1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "PARK SOLUTIONS INC.";
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        titleCell.font = { bold: true, size: 12 };
        titleCell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("E1:I1");
        const titleCell2 = worksheet.getCell("E1");
        titleCell2.value = "ROUTE";
        titleCell2.alignment = { horizontal: "center", vertical: "middle" };
        titleCell2.font = { bold: true, size: 13 };
        titleCell2.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("J1:N4");
        const titleCell3 = worksheet.getCell("J1");
        titleCell3.value = "TRIP SLIP";
        titleCell3.alignment = { horizontal: "center", vertical: "middle" };
        titleCell3.font = { bold: true, size: 16 };
        titleCell3.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("O1:Q4");
        const titleCell4 = worksheet.getCell("O1");
        titleCell4.value = "MRTSI-OD-F01 REV. 00\nControl No.\nDate:";
        titleCell4.alignment = { horizontal: "left", vertical: "middle", wrapText: true };
        titleCell4.font = { bold: true, size: 13 };
        titleCell4.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A2:B4");
        const titleCell5 = worksheet.getCell("A2");
        titleCell5.value = "";
        titleCell5.alignment = { horizontal: "center", vertical: "middle" };
        titleCell5.font = { bold: true, size: 13 };
        titleCell5.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("C2:D4");
        const titleCell6 = worksheet.getCell("C2");
        titleCell6.value = user.route_name;
        titleCell6.alignment = { horizontal: "center", vertical: "middle" };
        titleCell6.font = { bold: true, size: 13 };
        titleCell6.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("E2:I4");
        const titleCell7 = worksheet.getCell("E2");
        titleCell7.value = user.route_name;
        titleCell7.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        titleCell7.font = { bold: true, size: 13 };
        titleCell7.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A6:D8");
        const routeCell8 = worksheet.getCell("A6");
        routeCell8.value = `Bus Plate No.:${user.vehicle_plate_number}\nDriver's Name:${user.full_name}`;
        routeCell8.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        routeCell8.font = { bold: true, size: 12 };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("O6:Q8");
        const routeCell9 = worksheet.getCell("O6");
        routeCell9.value = `KM Start:\nKM END:`;
        routeCell9.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        routeCell9.font = { bold: true, size: 12 };
        routeCell9.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("A10:I12");
        const routeCell10 = worksheet.getCell("A10");
        routeCell10.value = `Departure Time: ${new Date(user.dispatch_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}\nDispatcher's Signature`;
        routeCell10.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        routeCell10.font = { bold: true, size: 12 };
        routeCell10.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        // Title Row (Merged and Centered)
        worksheet.mergeCells("J10:Q12");
        const routeCell11 = worksheet.getCell("J10");
        routeCell11.value = `Arrival Time: ${new Date(user.arrival_time).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })}\nDispatcher's Signature`;
        routeCell11.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        routeCell11.font = { bold: true, size: 12 };
        routeCell11.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("A13:C13");
        const routeCell12 = worksheet.getCell("A13");
        routeCell12.value = `Bus Stop`;
        routeCell12.alignment = { horizontal: "center", vertical: "top", wrapText: true };
        routeCell12.font = { bold: true, size: 12 };
        routeCell12.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Green background
        };
        routeCell12.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells("D13:Q13");
        const routeCell13 = worksheet.getCell("D13");
        routeCell13.value = `Number of passenger per station (${user.direction})`;
        routeCell13.alignment = { horizontal: "center", vertical: "top", wrapText: true };
        routeCell13.font = { bold: true, size: 12 };
        routeCell13.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00FF00" }, // Green background
        };
        routeCell13.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        console.log("user", users)

        user.bus_stop_list.forEach((vehicle, index) => {
            worksheet.mergeCells("A" + (13 + index + 1) + ":" + "C" + (13 + index + 1));
            const dataCell1 = worksheet.getCell("A" + (13 + index + 1));
            dataCell1.value = vehicle.bus_stop_name;
            dataCell1.alignment = { horizontal: "left", vertical: "top", wrapText: true };
            dataCell1.font = { bold: false, size: 12 };
            dataCell1.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            }

            worksheet.mergeCells("D" + (13 + index + 1) + ":" + "Q" + (13 + index + 1));
            const dataCell2 = worksheet.getCell("D" + (13 + index + 1));
            dataCell2.value = vehicle.ticket_count;
            dataCell2.alignment = { horizontal: "center", vertical: "top", wrapText: true };
            dataCell2.font = { bold: false, size: 12 };
            dataCell2.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            }
        });

        console.log(`A${13 + user.bus_stop_list.length + 1}:G${13 + user.bus_stop_list.length + 1}`);
        // footer
        worksheet.mergeCells(`A${13 + user.bus_stop_list.length + 1}:G${13 + user.bus_stop_list.length + 1}`);
        const footerCell1 = worksheet.getCell(`A${13 + user.bus_stop_list.length + 1}`);
        footerCell1.value = `In case of downtime, please state the reason below`;
        footerCell1.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        footerCell1.font = { bold: true, size: 12 };
        footerCell1.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells(`H${13 + user.bus_stop_list.length + 1}:J${13 + user.bus_stop_list.length + 1}`);
        const footerCell2 = worksheet.getCell(`H${13 + user.bus_stop_list.length + 1}`);
        footerCell2.value = `Downtime:`;
        footerCell2.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        footerCell2.font = { bold: true, size: 12 };
        footerCell2.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells(`K${13 + user.bus_stop_list.length + 1}:M${13 + user.bus_stop_list.length + 1}`);
        const footerCell3 = worksheet.getCell(`K${13 + user.bus_stop_list.length + 1}`);
        footerCell3.value = `Place/Location:`;
        footerCell3.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        footerCell3.font = { bold: true, size: 12 };
        footerCell3.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells(`N${13 + user.bus_stop_list.length + 1}:O${13 + user.bus_stop_list.length + 1}`);
        const footerCell4 = worksheet.getCell(`N${13 + user.bus_stop_list.length + 1}`);
        footerCell4.value = `Uptime: `;
        footerCell4.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        footerCell4.font = { bold: true, size: 12 };
        footerCell4.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

        worksheet.mergeCells(`P${13 + user.bus_stop_list.length + 1}:Q${13 + user.bus_stop_list.length + 1}`);
        const footerCell5 = worksheet.getCell(`P${13 + user.bus_stop_list.length + 1}`);
        footerCell5.value = `Serviced By:`;
        footerCell5.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        footerCell5.font = { bold: true, size: 12 };
        footerCell5.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };

    });

    // Export the workbook
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportDynamicTableData = async (data, fileName, sheetName = "Data") => {
    if (!Array.isArray(data) || data.length === 0) {
        console.error('Invalid data format: expected non-empty array');
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    // Get column headers from the first row
    const headers = Object.keys(data[0]);

    // Convert snake_case headers to human-readable format
    const formatHeader = (header) => {
        return header
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Helper function to check if field is money-related
    const isMoneyField = (key) => {
        const lowerKey = key.toLowerCase();
        return lowerKey.includes('amount') ||
            lowerKey.includes('price') ||
            lowerKey.includes('cost') ||
            lowerKey.includes('fee') ||
            lowerKey.includes('charge') ||
            lowerKey.includes('total') ||
            lowerKey.includes('revenue') ||
            lowerKey.includes('income') ||
            lowerKey.includes('sales') ||
            lowerKey.includes('payment') ||
            lowerKey.includes('balance') ||
            lowerKey.includes('cash') ||
            lowerKey.includes('money') ||
            lowerKey.includes('vat') ||
            lowerKey.includes('discount') ||
            lowerKey.includes('credit') ||
            lowerKey.includes('debit') ||
            lowerKey.includes('withdrawal') ||
            lowerKey.includes('deposit') ||
            lowerKey.includes('refund') ||
            lowerKey.includes('commission') ||
            lowerKey.includes('bonus') ||
            lowerKey.includes('salary') ||
            lowerKey.includes('wage') ||
            lowerKey.includes('tip') ||
            lowerKey.includes('fare') ||
            lowerKey.includes('ticket_price') ||
            lowerKey.includes('card_balance') ||
            lowerKey.includes('wallet_balance') ||
            lowerKey.includes('account_balance') ||
            lowerKey.includes('current_balance') ||
            lowerKey.includes('available_balance') ||
            lowerKey.includes('remaining_balance') ||
            lowerKey.includes('topup_amount') ||
            lowerKey.includes('top_up_amount') ||
            lowerKey.includes('reload_amount') ||
            lowerKey.includes('deduct_amount') ||
            lowerKey.includes('transaction_amount') ||
            lowerKey.includes('settlement_amount') ||
            lowerKey.includes('gross_amount') ||
            lowerKey.includes('net_amount') ||
            lowerKey.includes('tax_amount') ||
            lowerKey.includes('service_fee') ||
            lowerKey.includes('processing_fee') ||
            lowerKey.includes('convenience_fee');
    };

    // Helper function to format cell value
    const formatCellValue = (value, key) => {
        // Handle null, undefined, or empty values
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }

        // Check if field is money-related and format with peso sign
        if (isMoneyField(key) && !isNaN(Number(value))) {
            const numValue = Number(value);
            return `${numValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        // Format dates
        if (value && (key === 'created_at' || key === 'updated_at' || key === 'deleted_at')) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                    });
                }
            } catch (error) {
                console.warn('Error formatting date:', error);
            }
        } else if (value && (key.includes('date') || key.includes('_at'))) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString('en-US', {
                        month: '2-digit',
                        day: '2-digit',
                        year: 'numeric'
                    });
                }
            } catch (error) {
                console.warn('Error formatting date:', error);
            }
        }

        return value;
    };

    // Add headers
    headers.forEach((header, index) => {
        const cell = worksheet.getCell(1, index + 1);
        cell.value = formatHeader(header);
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };
        cell.border = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
        };
    });

    // Add data rows
    data.forEach((row, rowIndex) => {
        headers.forEach((header, colIndex) => {
            const cell = worksheet.getCell(rowIndex + 2, colIndex + 1);
            const formattedValue = formatCellValue(row[header], header);
            cell.value = formattedValue;
            cell.border = {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
            };

            // Style money fields with currency format
            if (isMoneyField(header) && !isNaN(Number(row[header]))) {
                cell.numFmt = '#,##0.00';
            }
        });
    });

    // Auto-fit columns
    headers.forEach((_, index) => {
        worksheet.getColumn(index + 1).width = 15;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportPosSaleReport = async (users, fileName, startDate, endDate, plateNo, staffName) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    worksheet.mergeCells("A1:G1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nPOS SALES REPORT\nALL (Regular, Senior, Student, PWD)\nStaff: ${staffName}\nMIN: N/A\n`;
    titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    titleCell.font = { bold: true, size: 12 };
    worksheet.getRow(1).height = 90;

    worksheet.mergeCells("H1:I1");
    const dateRangeCell = worksheet.getCell("H1");
    const dateObj = new Date();
    const formattedDate = dateObj.toISOString().split('T')[0];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    dateRangeCell.value = `Date Generated: ${formattedDate}\r\nTime: ${formattedTime}`;
    dateRangeCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    dateRangeCell.font = { bold: true, size: 12 };

    worksheet.getCell("A2").value = `For the period: ${startDate} to ${endDate}`;
    worksheet.getCell("A2").alignment = { horizontal: "left" };
    worksheet.getCell("A3").value = "";

    const headers = [
        "Transaction Date",
        "Passenger Type",
        "Invoice No.",
        "Name",
        "Card ID",
        "Boarded",
        "Gross Sales(CAD)",
        "Discount(CAD)",
        "Net Sales(CAD)"
    ];

    const headerRowNumber = 4;
    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4CAF50" }
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    let totalGross = 0;
    let totalDiscount = 0;
    let totalNet = 0;

    users.forEach((user) => {
        const gross = user.ticket_cost || 0;
        const discount = +(gross * (user.discount / 100)).toFixed(2);
        const net = user.net_amount || +(gross - discount).toFixed(2);

        totalGross += gross;
        totalDiscount += discount;
        totalNet += net;

        const dataRow = worksheet.addRow([
            formatDateToMMDDYYYY(user.created_at),
            user.passenger_type || 'N/A',
            user.invoice_no || user.ticket_code || 'N/A',
            user.registered_name || 'N/A',
            user.card_id || 'N/A',
            user.boarded ? 'Yes' : 'No',
            gross,
            discount,
            net
        ]);

        dataRow.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });
    });

    const lastDataRow = worksheet.lastRow.number;
    worksheet.autoFilter = {
        from: { row: headerRowNumber, column: 1 },
        to: { row: lastDataRow, column: headers.length }
    };

    const totalRowNumber = worksheet.lastRow.number + 1;
    worksheet.mergeCells(`A${totalRowNumber}:F${totalRowNumber}`);
    const labelCell = worksheet.getCell(`A${totalRowNumber}`);
    labelCell.value = "Grand Total";
    labelCell.font = { bold: true };
    labelCell.alignment = { horizontal: "right", vertical: "middle" };
    labelCell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" }
    };

    const totalRow = worksheet.getRow(totalRowNumber);
    totalRow.getCell(7).value = +totalGross.toFixed(2);
    totalRow.getCell(8).value = +totalDiscount.toFixed(2);
    totalRow.getCell(9).value = +totalNet.toFixed(2);

    [7, 8, 9].forEach((col) => {
        const cell = totalRow.getCell(col);
        cell.font = { bold: true };
        cell.numFmt = "#,##0.00";
        cell.alignment = { horizontal: "right" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    worksheet.columns = [
        { width: 15 },
        { width: 20 },
        { width: 40 },
        { width: 25 },
        { width: 20 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
        { width: 18 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportRouteAnalyticsSummary = async (data, fileName, selectedDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Route Analytics");

    // Title row
    worksheet.mergeCells("A1:F1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Route Analytics Summary Report";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells("A2:F2");
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Date: ${selectedDate}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 12 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow([
        "Route Name",
        "Route Info",
        "No of Dispatches",
        "Ridership",
        "Revenue (PHP)",
        "Net Amount (PHP)"
    ]);

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Add data rows
    let totalTrips = 0;
    let totalPassengers = 0;
    let totalGrossSales = 0;
    let totalRevenue = 0;

    data.forEach((item) => {
        const row = worksheet.addRow([
            item.route_name || "N/A",
            item.route_info || "N/A",
            item.total_trips || 0,
            item.total_passengers || 0,
            item.total_gross_sales || 0,
            item.total_revenue || 0
        ]);

        // Format currency columns
        row.getCell(5).numFmt = '#,##0.00';
        row.getCell(6).numFmt = '#,##0.00';

        // Alignment
        row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
        row.getCell(2).alignment = { horizontal: "left", vertical: "middle" };
        row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
        row.getCell(6).alignment = { horizontal: "right", vertical: "middle" };

        // Accumulate totals
        totalTrips += item.total_trips || 0;
        totalPassengers += item.total_passengers || 0;
        totalGrossSales += item.total_gross_sales || 0;
        totalRevenue += item.total_revenue || 0;
    });

    // Add total row
    const totalRow = worksheet.addRow([
        "TOTAL",
        "",
        totalTrips,
        totalPassengers,
        totalGrossSales,
        totalRevenue
    ]);

    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD966' }
    };
    totalRow.getCell(5).numFmt = '#,##0.00';
    totalRow.getCell(6).numFmt = '#,##0.00';
    totalRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    totalRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
    totalRow.getCell(4).alignment = { horizontal: "center", vertical: "middle" };
    totalRow.getCell(5).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(6).alignment = { horizontal: "right", vertical: "middle" };

    // Set column widths
    worksheet.getColumn(1).width = 20;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 18;
    worksheet.getColumn(5).width = 20;
    worksheet.getColumn(6).width = 20;

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= 6; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportBusAnalyticsSummary = async (data, fileName, selectedDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bus Analytics");

    // Title row
    worksheet.mergeCells("A1:E1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Bus Analytics Summary Report";
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells("A2:E2");
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Date: ${selectedDate}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 12 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow([
        "Bus Plate Number",
        "Ridership",
        "No of Dispatches",
        "Revenue (PHP)",
        "Net Amount (PHP)"
    ]);

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Add data rows
    let totalRidership = 0;
    let totalDispatches = 0;
    let totalRevenue = 0;
    let totalNetAmount = 0;

    data.forEach((item) => {
        const row = worksheet.addRow([
            item.vehicle_plate_number || "N/A",
            item.ridership || 0,
            item.dispatches || 0,
            item.revenue || 0,
            item.net_amount || 0
        ]);

        // Format currency columns
        row.getCell(4).numFmt = '#,##0.00';
        row.getCell(5).numFmt = '#,##0.00';

        // Alignment
        row.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
        row.getCell(4).alignment = { horizontal: "right", vertical: "middle" };
        row.getCell(5).alignment = { horizontal: "right", vertical: "middle" };

        // Accumulate totals
        totalRidership += item.ridership || 0;
        totalDispatches += item.dispatches || 0;
        totalRevenue += item.revenue || 0;
        totalNetAmount += item.net_amount || 0;
    });

    // Add total row
    const totalRow = worksheet.addRow([
        "TOTAL",
        totalRidership,
        totalDispatches,
        totalRevenue,
        totalNetAmount
    ]);

    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD966' }
    };
    totalRow.getCell(4).numFmt = '#,##0.00';
    totalRow.getCell(5).numFmt = '#,##0.00';
    totalRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    totalRow.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
    totalRow.getCell(3).alignment = { horizontal: "center", vertical: "middle" };
    totalRow.getCell(4).alignment = { horizontal: "right", vertical: "middle" };
    totalRow.getCell(5).alignment = { horizontal: "right", vertical: "middle" };

    // Set column widths
    worksheet.getColumn(1).width = 25;
    worksheet.getColumn(2).width = 15;
    worksheet.getColumn(3).width = 18;
    worksheet.getColumn(4).width = 20;
    worksheet.getColumn(5).width = 20;

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= 5; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportTicketReport = async (data, fileName, reportType, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Ticket Report");

    // Helper function to generate ticket ID
    const generateTicketId = (machineId, ticketId) => {
        if (machineId == null || ticketId == null) return 'N/A';
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Filter out action columns (Print, Edit, etc.)
    const exportColumns = columns.filter(col =>
        !['edit', 'print', 'actions'].includes(col.key.toLowerCase())
    );

    const numCols = exportColumns.length;
    const lastCol = String.fromCharCode(64 + numCols); // A=65, so 64+1=A

    // Title row
    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${reportType} Ticket Report`;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells(`A2:${lastCol}2`);
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 11 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow(exportColumns.map(col => col.header));

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Helper function to extract text value from render function
    const getValueFromColumn = (item, column) => {
        const key = column.key;
        const header = column.header;

        // Special handling for specific keys
        if (key === 'ticket_id') {
            return generateTicketId(item.machine_id, item.ticket_id);
        }
        if (key === 'start_bus_stop') {
            return item.bus_fare?.start_bus_stop?.bus_stop_name || item.vehicle_route?.start_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'end_bus_stop') {
            return item.bus_fare?.end_bus_stop?.bus_stop_name || item.vehicle_route?.end_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'route_name') {
            return item.vehicle_route?.route?.route_name || 'N/A';
        }
        if (key === 'registered_name') {
            return item.registered_name || 'Anonymous';
        }
        if (key === 'staff_name') {
            return item.staff?.full_name || 'N/A';
        }
        if (key === 'machine_serial_number') {
            return item.machine?.serial_number || 'N/A';
        }
        // Handle the confusing case where key is 'machine.serial_number' but header is 'Bus Number'
        if (key === 'machine.serial_number') {
            if (header === 'Bus Number') {
                return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
            }
            return item.machine?.serial_number || 'N/A';
        }
        if (key === 'vehicle_plate_number' || key === 'bus_number') {
            return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
        }
        if (key === 'discount') {
            return item.ticket_cost * (item.discount / 100);
        }
        if (key === 'payment_method') {
            return item.payment_method ? item.payment_method.replace(/_/g, ' ') : 'N/A';
        }
        if (key === 'created_at') {
            return item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';
        }
        if (key === 'validated') {
            return item.validator_id ? 'Validated' : 'Not Validated';
        }
        if (key === 'access_decision') {
            if (item.access_decision === true) return 'Accept';
            if (item.access_decision === false) return 'Deny';
            return 'Not Set';
        }
        if (key === 'boarded') {
            return item.boarded_at ? 'Yes' : 'No';
        }

        // Default: try to get value directly from item
        return item[key] ?? 'N/A';
    };

    // Track totals for numeric columns
    const totals = {};
    exportColumns.forEach(col => {
        totals[col.key] = 0;
    });

    // Add data rows
    data.forEach((item) => {
        const rowData = exportColumns.map(col => {
            const value = getValueFromColumn(item, col);

            // Track totals for numeric columns
            if (typeof value === 'number') {
                totals[col.key] += value;
            }

            return value;
        });

        const row = worksheet.addRow(rowData);

        // Format cells
        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            const value = getValueFromColumn(item, col);

            // Apply number formatting for currency columns
            if (typeof value === 'number' &&
                ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)) {
                row.getCell(cellIndex).numFmt = '#,##0.00';
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-right')) {
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-center')) {
                row.getCell(cellIndex).alignment = { horizontal: "center", vertical: "middle" };
            } else {
                row.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    });

    // Add total row if there are numeric columns
    const hasNumericColumns = exportColumns.some(col =>
        ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)
    );

    if (hasNumericColumns) {
        const totalRowData = exportColumns.map((col, index) => {
            if (index === 0) return 'TOTAL';
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                return totals[col.key];
            }
            return '';
        });

        const totalRow = worksheet.addRow(totalRowData);
        totalRow.font = { bold: true, size: 11 };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD966' }
        };

        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                totalRow.getCell(cellIndex).numFmt = '#,##0.00';
                totalRow.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (index === 0) {
                totalRow.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    }

    // Set column widths
    exportColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= numCols; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportUnusedTicketPOSReport = async (data, fileName, reportType, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Unused Ticket Report (POS)");

    // Helper function to generate ticket ID
    const generateTicketId = (machineId, ticketId) => {
        if (machineId == null || ticketId == null) return 'N/A';
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Filter out action columns (Print, Edit, etc.)
    const exportColumns = columns.filter(col =>
        !['edit', 'print', 'actions'].includes(col.key.toLowerCase())
    );

    const numCols = exportColumns.length;
    const lastCol = String.fromCharCode(64 + numCols); // A=65, so 64+1=A

    // Title row
    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${reportType}`;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells(`A2:${lastCol}2`);
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 11 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow(exportColumns.map(col => col.header));

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Helper function to extract text value from render function
    const getValueFromColumn = (item, column) => {
        const key = column.key;
        const header = column.header;

        // Special handling for specific keys
        if (key === 'ticket_id') {
            return generateTicketId(item.machine_id, item.ticket_id);
        }
        if (key === 'start_bus_stop') {
            return item.bus_fare?.start_bus_stop?.bus_stop_name || item.vehicle_route?.start_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'end_bus_stop') {
            return item.bus_fare?.end_bus_stop?.bus_stop_name || item.vehicle_route?.end_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'route_name') {
            return item.vehicle_route?.route?.route_name || 'N/A';
        }
        if (key === 'registered_name') {
            return item.registered_name || 'Anonymous';
        }
        if (key === 'staff_name') {
            return item.staff?.full_name || 'N/A';
        }
        if (key === 'machine_serial_number') {
            return item.machine?.serial_number || 'N/A';
        }
        // Handle the confusing case where key is 'machine.serial_number' but header is 'Bus Number'
        if (key === 'machine.serial_number') {
            if (header === 'Bus Number') {
                return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
            }
            return item.machine?.serial_number || 'N/A';
        }
        if (key === 'vehicle_plate_number' || key === 'bus_number') {
            return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
        }
        if (key === 'discount') {
            return item.ticket_cost * (item.discount / 100);
        }
        if (key === 'payment_method') {
            return item.payment_method ? item.payment_method.replace(/_/g, ' ') : 'N/A';
        }
        if (key === 'created_at') {
            return item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';
        }
        if (key === 'validated') {
            return item.validator_id ? 'Validated' : 'Not Validated';
        }
        if (key === 'access_decision') {
            if (item.access_decision === true) return 'Accept';
            if (item.access_decision === false) return 'Deny';
            return 'Not Set';
        }
        if (key === 'boarded') {
            return item.boarded_at ? 'Yes' : 'No';
        }

        // Default: try to get value directly from item
        return item[key] ?? 'N/A';
    };

    // Track totals for numeric columns
    const totals = {};
    exportColumns.forEach(col => {
        totals[col.key] = 0;
    });

    // Add data rows
    data.forEach((item) => {
        const rowData = exportColumns.map(col => {
            const value = getValueFromColumn(item, col);

            // Track totals for numeric columns
            if (typeof value === 'number') {
                totals[col.key] += value;
            }

            return value;
        });

        const row = worksheet.addRow(rowData);

        // Format cells
        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            const value = getValueFromColumn(item, col);

            // Apply number formatting for currency columns
            if (typeof value === 'number' &&
                ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)) {
                row.getCell(cellIndex).numFmt = '#,##0.00';
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-right')) {
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-center')) {
                row.getCell(cellIndex).alignment = { horizontal: "center", vertical: "middle" };
            } else {
                row.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    });

    // Add total row if there are numeric columns
    const hasNumericColumns = exportColumns.some(col =>
        ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)
    );

    if (hasNumericColumns) {
        const totalRowData = exportColumns.map((col, index) => {
            if (index === 0) return 'TOTAL';
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                return totals[col.key];
            }
            return '';
        });

        const totalRow = worksheet.addRow(totalRowData);
        totalRow.font = { bold: true, size: 11 };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD966' }
        };

        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                totalRow.getCell(cellIndex).numFmt = '#,##0.00';
                totalRow.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (index === 0) {
                totalRow.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    }

    // Set column widths
    exportColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= numCols; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportUsedTicketPOSReport = async (data, fileName, reportType, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Used Ticket Report (POS)");

    // Helper function to generate ticket ID
    const generateTicketId = (machineId, ticketId) => {
        if (machineId == null || ticketId == null) return 'N/A';
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Filter out action columns (Print, Edit, etc.)
    const exportColumns = columns.filter(col =>
        !['edit', 'print', 'actions'].includes(col.key.toLowerCase())
    );

    const numCols = exportColumns.length;
    const lastCol = String.fromCharCode(64 + numCols); // A=65, so 64+1=A

    // Title row
    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${reportType} `;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells(`A2:${lastCol}2`);
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 11 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow(exportColumns.map(col => col.header));

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Helper function to extract text value from render function
    const getValueFromColumn = (item, column) => {
        const key = column.key;
        const header = column.header;

        // Special handling for specific keys
        if (key === 'ticket_id') {
            return generateTicketId(item.machine_id, item.ticket_id);
        }
        if (key === 'start_bus_stop') {
            return item.bus_fare?.start_bus_stop?.bus_stop_name || item.vehicle_route?.start_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'end_bus_stop') {
            return item.bus_fare?.end_bus_stop?.bus_stop_name || item.vehicle_route?.end_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'route_name') {
            return item.vehicle_route?.route?.route_name || 'N/A';
        }
        if (key === 'registered_name') {
            return item.registered_name || 'Anonymous';
        }
        if (key === 'staff_name') {
            return item.staff?.full_name || 'N/A';
        }
        if (key === 'machine_serial_number') {
            return item.machine?.serial_number || 'N/A';
        }
        // Handle the confusing case where key is 'machine.serial_number' but header is 'Bus Number'
        if (key === 'machine.serial_number') {
            if (header === 'Bus Number') {
                return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
            }
            return item.machine?.serial_number || 'N/A';
        }
        if (key === 'vehicle_plate_number' || key === 'bus_number') {
            return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
        }
        if (key === 'discount') {
            return item.ticket_cost * (item.discount / 100);
        }
        if (key === 'payment_method') {
            return item.payment_method ? item.payment_method.replace(/_/g, ' ') : 'N/A';
        }
        if (key === 'created_at') {
            return item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';
        }
        if (key === 'validated') {
            return item.validator_id ? 'Validated' : 'Not Validated';
        }
        if (key === 'access_decision') {
            if (item.access_decision === true) return 'Accept';
            if (item.access_decision === false) return 'Deny';
            return 'Not Set';
        }
        if (key === 'boarded') {
            return item.boarded_at ? 'Yes' : 'No';
        }

        // Default: try to get value directly from item
        return item[key] ?? 'N/A';
    };

    // Track totals for numeric columns
    const totals = {};
    exportColumns.forEach(col => {
        totals[col.key] = 0;
    });

    // Add data rows
    data.forEach((item) => {
        const rowData = exportColumns.map(col => {
            const value = getValueFromColumn(item, col);

            // Track totals for numeric columns
            if (typeof value === 'number') {
                totals[col.key] += value;
            }

            return value;
        });

        const row = worksheet.addRow(rowData);

        // Format cells
        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            const value = getValueFromColumn(item, col);

            // Apply number formatting for currency columns
            if (typeof value === 'number' &&
                ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)) {
                row.getCell(cellIndex).numFmt = '#,##0.00';
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-right')) {
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-center')) {
                row.getCell(cellIndex).alignment = { horizontal: "center", vertical: "middle" };
            } else {
                row.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    });

    // Add total row if there are numeric columns
    const hasNumericColumns = exportColumns.some(col =>
        ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)
    );

    if (hasNumericColumns) {
        const totalRowData = exportColumns.map((col, index) => {
            if (index === 0) return 'TOTAL';
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                return totals[col.key];
            }
            return '';
        });

        const totalRow = worksheet.addRow(totalRowData);
        totalRow.font = { bold: true, size: 11 };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD966' }
        };

        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                totalRow.getCell(cellIndex).numFmt = '#,##0.00';
                totalRow.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (index === 0) {
                totalRow.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    }

    // Set column widths
    exportColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= numCols; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportUsedTicketQRReport = async (data, fileName, reportType, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Used Ticket Report (QR)");

    // Helper function to generate ticket ID
    const generateTicketId = (machineId, ticketId) => {
        if (machineId == null || ticketId == null) return 'N/A';
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Filter out action columns (Print, Edit, etc.)
    const exportColumns = columns.filter(col =>
        !['edit', 'print', 'actions'].includes(col.key.toLowerCase())
    );

    const numCols = exportColumns.length;
    const lastCol = String.fromCharCode(64 + numCols); // A=65, so 64+1=A

    // Title row
    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${reportType} `;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells(`A2:${lastCol}2`);
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 11 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow(exportColumns.map(col => col.header));

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Helper function to extract text value from render function
    const getValueFromColumn = (item, column) => {
        const key = column.key;
        const header = column.header;

        // Special handling for specific keys
        if (key === 'ticket_id') {
            return generateTicketId(item.machine_id, item.ticket_id);
        }
        if (key === 'start_bus_stop') {
            return item.bus_fare?.start_bus_stop?.bus_stop_name || item.vehicle_route?.start_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'end_bus_stop') {
            return item.bus_fare?.end_bus_stop?.bus_stop_name || item.vehicle_route?.end_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'route_name') {
            return item.vehicle_route?.route?.route_name || 'N/A';
        }
        if (key === 'registered_name') {
            return item.registered_name || 'Anonymous';
        }
        if (key === 'staff_name') {
            return item.staff?.full_name || 'N/A';
        }
        if (key === 'machine_serial_number') {
            return item.machine?.serial_number || 'N/A';
        }
        // Handle the confusing case where key is 'machine.serial_number' but header is 'Bus Number'
        if (key === 'machine.serial_number') {
            if (header === 'Bus Number') {
                return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
            }
            return item.machine?.serial_number || 'N/A';
        }
        if (key === 'vehicle_plate_number' || key === 'bus_number') {
            return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
        }
        if (key === 'discount') {
            return item.ticket_cost * (item.discount / 100);
        }
        if (key === 'payment_method') {
            return item.payment_method ? item.payment_method.replace(/_/g, ' ') : 'N/A';
        }
        if (key === 'created_at') {
            return item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';
        }
        if (key === 'validated') {
            return item.validator_id ? 'Validated' : 'Not Validated';
        }
        if (key === 'access_decision') {
            if (item.access_decision === true) return 'Accept';
            if (item.access_decision === false) return 'Deny';
            return 'Not Set';
        }
        if (key === 'boarded') {
            return item.boarded_at ? 'Yes' : 'No';
        }

        // Default: try to get value directly from item
        return item[key] ?? 'N/A';
    };

    // Track totals for numeric columns
    const totals = {};
    exportColumns.forEach(col => {
        totals[col.key] = 0;
    });

    // Add data rows
    data.forEach((item) => {
        const rowData = exportColumns.map(col => {
            const value = getValueFromColumn(item, col);

            // Track totals for numeric columns
            if (typeof value === 'number') {
                totals[col.key] += value;
            }

            return value;
        });

        const row = worksheet.addRow(rowData);

        // Format cells
        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            const value = getValueFromColumn(item, col);

            // Apply number formatting for currency columns
            if (typeof value === 'number' &&
                ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)) {
                row.getCell(cellIndex).numFmt = '#,##0.00';
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-right')) {
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-center')) {
                row.getCell(cellIndex).alignment = { horizontal: "center", vertical: "middle" };
            } else {
                row.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    });

    // Add total row if there are numeric columns
    const hasNumericColumns = exportColumns.some(col =>
        ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)
    );

    if (hasNumericColumns) {
        const totalRowData = exportColumns.map((col, index) => {
            if (index === 0) return 'TOTAL';
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                return totals[col.key];
            }
            return '';
        });

        const totalRow = worksheet.addRow(totalRowData);
        totalRow.font = { bold: true, size: 11 };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD966' }
        };

        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                totalRow.getCell(cellIndex).numFmt = '#,##0.00';
                totalRow.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (index === 0) {
                totalRow.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    }

    // Set column widths
    exportColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= numCols; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportUnusedTicketQRReport = async (data, fileName, reportType, columns) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Unused Ticket Report (QR)");

    // Helper function to generate ticket ID
    const generateTicketId = (machineId, ticketId) => {
        if (machineId == null || ticketId == null) return 'N/A';
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Filter out action columns (Print, Edit, etc.)
    const exportColumns = columns.filter(col =>
        !['edit', 'print', 'actions'].includes(col.key.toLowerCase())
    );

    const numCols = exportColumns.length;
    const lastCol = String.fromCharCode(64 + numCols); // A=65, so 64+1=A

    // Title row
    worksheet.mergeCells(`A1:${lastCol}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${reportType}`;
    titleCell.alignment = { horizontal: "center", vertical: "middle" };
    titleCell.font = { bold: true, size: 16 };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    titleCell.font = { ...titleCell.font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).height = 30;

    // Date row
    worksheet.mergeCells(`A2:${lastCol}2`);
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Generated: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: "center", vertical: "middle" };
    dateCell.font = { bold: true, size: 11 };
    worksheet.getRow(2).height = 20;

    // Empty row
    worksheet.addRow([]);

    // Header row
    const headerRow = worksheet.addRow(exportColumns.map(col => col.header));

    headerRow.font = { bold: true, size: 11 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' }
    };
    headerRow.height = 25;

    // Helper function to extract text value from render function
    const getValueFromColumn = (item, column) => {
        const key = column.key;
        const header = column.header;

        // Special handling for specific keys
        if (key === 'ticket_id') {
            return generateTicketId(item.machine_id, item.ticket_id);
        }
        if (key === 'start_bus_stop') {
            return item.bus_fare?.start_bus_stop?.bus_stop_name || item.vehicle_route?.start_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'end_bus_stop') {
            return item.bus_fare?.end_bus_stop?.bus_stop_name || item.vehicle_route?.end_bus_stop?.bus_stop_name || 'N/A';
        }
        if (key === 'route_name') {
            return item.vehicle_route?.route?.route_name || 'N/A';
        }
        if (key === 'registered_name') {
            return item.registered_name || 'Anonymous';
        }
        if (key === 'staff_name') {
            return item.staff?.full_name || 'N/A';
        }
        if (key === 'machine_serial_number') {
            return item.machine?.serial_number || 'N/A';
        }
        // Handle the confusing case where key is 'machine.serial_number' but header is 'Bus Number'
        if (key === 'machine.serial_number') {
            if (header === 'Bus Number') {
                return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
            }
            return item.machine?.serial_number || 'N/A';
        }
        if (key === 'vehicle_plate_number' || key === 'bus_number') {
            return item.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A';
        }
        if (key === 'discount') {
            return item.ticket_cost * (item.discount / 100);
        }
        if (key === 'payment_method') {
            return item.payment_method ? item.payment_method.replace(/_/g, ' ') : 'N/A';
        }
        if (key === 'created_at') {
            return item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A';
        }
        if (key === 'validated') {
            return item.validator_id ? 'Validated' : 'Not Validated';
        }
        if (key === 'access_decision') {
            if (item.access_decision === true) return 'Accept';
            if (item.access_decision === false) return 'Deny';
            return 'Not Set';
        }
        if (key === 'boarded') {
            return item.boarded_at ? 'Yes' : 'No';
        }

        // Default: try to get value directly from item
        return item[key] ?? 'N/A';
    };

    // Track totals for numeric columns
    const totals = {};
    exportColumns.forEach(col => {
        totals[col.key] = 0;
    });

    // Add data rows
    data.forEach((item) => {
        const rowData = exportColumns.map(col => {
            const value = getValueFromColumn(item, col);

            // Track totals for numeric columns
            if (typeof value === 'number') {
                totals[col.key] += value;
            }

            return value;
        });

        const row = worksheet.addRow(rowData);

        // Format cells
        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            const value = getValueFromColumn(item, col);

            // Apply number formatting for currency columns
            if (typeof value === 'number' &&
                ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)) {
                row.getCell(cellIndex).numFmt = '#,##0.00';
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-right')) {
                row.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (col.className?.includes('text-center')) {
                row.getCell(cellIndex).alignment = { horizontal: "center", vertical: "middle" };
            } else {
                row.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    });

    // Add total row if there are numeric columns
    const hasNumericColumns = exportColumns.some(col =>
        ['ticket_cost', 'discount', 'net_amount', 'vat_amount', 'vat_exempt_sales', 'vatable_sales'].includes(col.key)
    );

    if (hasNumericColumns) {
        const totalRowData = exportColumns.map((col, index) => {
            if (index === 0) return 'TOTAL';
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                return totals[col.key];
            }
            return '';
        });

        const totalRow = worksheet.addRow(totalRowData);
        totalRow.font = { bold: true, size: 11 };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD966' }
        };

        exportColumns.forEach((col, index) => {
            const cellIndex = index + 1;
            if (typeof totals[col.key] === 'number' && totals[col.key] > 0) {
                totalRow.getCell(cellIndex).numFmt = '#,##0.00';
                totalRow.getCell(cellIndex).alignment = { horizontal: "right", vertical: "middle" };
            } else if (index === 0) {
                totalRow.getCell(cellIndex).alignment = { horizontal: "left", vertical: "middle" };
            }
        });
    }

    // Set column widths
    exportColumns.forEach((col, index) => {
        worksheet.getColumn(index + 1).width = 20;
    });

    // Add borders to all cells with data
    const lastRow = worksheet.lastRow.number;
    for (let i = 4; i <= lastRow; i++) {
        for (let j = 1; j <= numCols; j++) {
            const cell = worksheet.getRow(i).getCell(j);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }
    }

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}.xlsx`);
};




const exportTopUpHistoryReport = async (data, fileName, selectedDate) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Card Top-up History");

    // Title section
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nCARD TOP-UP HISTORY REPORT`;
    titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    titleCell.font = { bold: true, size: 12 };
    worksheet.getRow(1).height = 60;

    // Date generated section
    worksheet.mergeCells("I1:J1");
    const dateRangeCell = worksheet.getCell("I1");
    const dateObj = new Date();
    const formattedDate = dateObj.toISOString().split('T')[0];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    dateRangeCell.value = `Date Generated: ${formattedDate}\r\nTime: ${formattedTime}`;
    dateRangeCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    dateRangeCell.font = { bold: true, size: 12 };

    // Period
    worksheet.getCell("A2").value = selectedDate ? `For the date: ${selectedDate}` : 'All Dates';
    worksheet.getCell("A2").alignment = { horizontal: "left" };
    worksheet.getCell("A3").value = "";

    // Headers matching UI columns
    const headers = [
        "Category",
        "Card No",
        "Passenger Name",
        "Email",
        "Phone",
        "Transaction",
        "Amount",
        "Date",
        "Time"
    ];

    const headerRow = worksheet.addRow(headers);

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4CAF50" }
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    let totalAmount = 0;

    // Data rows
    data.forEach((item) => {
        const amount = item.amount || 0;
        totalAmount += amount;

        const date = new Date(item.created_at);
        const formattedDate = isNaN(date.getTime()) ? 'N/A' : formatDateToMMDDYYYY(date);
        const formattedTime = isNaN(date.getTime()) ? '' : date.toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit', hour12: true });

        const dataRow = worksheet.addRow([
            item.category || 'N/A',
            item.card_no || 'N/A',
            item.passenger_name || 'N/A',
            item.passenger_email || 'N/A',
            item.passenger_phone || 'N/A',
            item.transaction || 'N/A',
            amount,
            formattedDate,
            formattedTime
        ]);

        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

            // Format amount column
            if (colNumber === 7) {
                cell.numFmt = '₱#,##0.00';
                cell.alignment = { horizontal: "right" };
            }
        });
    });

    // Total row
    const totalRow = worksheet.addRow([
        '', '', '', '', '', 'TOTAL:',
        totalAmount,
        '', ''
    ]);

    totalRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };

        if (colNumber === 7) {
            cell.numFmt = '₱#,##0.00';
            cell.alignment = { horizontal: "right" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFFEB3B" }
            };
        }
    });

    // Column widths
    worksheet.getColumn(1).width = 20; // Category
    worksheet.getColumn(2).width = 15; // Card No
    worksheet.getColumn(3).width = 25; // Passenger Name
    worksheet.getColumn(4).width = 30; // Email
    worksheet.getColumn(5).width = 15; // Phone
    worksheet.getColumn(6).width = 30; // Transaction
    worksheet.getColumn(7).width = 15; // Amount
    worksheet.getColumn(8).width = 15; // Date
    worksheet.getColumn(9).width = 12; // Time

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `${fileName}.xlsx`);
};

const exportCardReport = async (reportData, startDate, endDate) => {
    const cards = reportData?.cards ?? [];
    const grandTotal = reportData?.grandTotal;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Card Report");

    // Title section (Row 1, merged A1:C1)
    worksheet.mergeCells("A1:C1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nCARD REPORT\nCARD NO.: All`;
    titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    titleCell.font = { bold: true, size: 12 };
    worksheet.getRow(1).height = 80;

    // Date generated & Time section (Row 1, merged D1:E1)
    worksheet.mergeCells("D1:E1");
    const dateRangeCell = worksheet.getCell("D1");
    const dateObj = new Date();
    const formattedDate = dateObj.getFullYear() + '-' +
        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
        String(dateObj.getDate()).padStart(2, '0');
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    dateRangeCell.value = `Date Generated: ${formattedDate}\nTime: ${formattedTime}`;
    dateRangeCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
    dateRangeCell.font = { bold: true, size: 10 };

    // Date info (Row 2, merged A2:E2)
    worksheet.mergeCells("A2:E2");
    const dateCell = worksheet.getCell("A2");
    dateCell.value = `Date : ${startDate}`;
    dateCell.alignment = { horizontal: "left", vertical: "center" };
    dateCell.font = { size: 10 };

    worksheet.getCell("A3").value = "";
    worksheet.getRow(3).height = 15;

    // Headers (Row 4)
    const headers = [
        "Card Number",
        "Payment Method",
        "Credit",
        "Debit",
        "Payable"
    ];

    const headerRow = worksheet.addRow(headers);
    headerRow.height = 25;

    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4CAF50" } // Material Design Green 500
        };
        cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    let totalCredit = 0;
    let totalDebit = 0;
    let totalPayable = 0;

    // Data rows
    cards.forEach((item) => {
        const credit = Number(item.credit) || 0;
        const debit = Number(item.debit) || 0;
        const payable = Number(item.payable) || 0;

        totalCredit += credit;
        totalDebit += debit;
        totalPayable += payable;

        const dataRow = worksheet.addRow([
            item.cardNo || 'N/A',
            item.paymentMethod ? (item.paymentMethod.charAt(0).toUpperCase() + item.paymentMethod.slice(1)) : 'N/A',
            credit,
            debit,
            payable
        ]);
        dataRow.height = 20;

        dataRow.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
            cell.font = { size: 10 };

            if (colNumber === 1 || colNumber === 2) {
                cell.alignment = { horizontal: "left", vertical: "middle" };
            } else {
                cell.numFmt = '#,##0.00';
                cell.alignment = { horizontal: "right", vertical: "middle" };
            }
        });
    });

    // Grand Total row (Row 12+)
    const displayCreditTotal = grandTotal ? (Number(grandTotal.credit) || 0) : totalCredit;
    const displayDebitTotal = grandTotal ? (Number(grandTotal.debit) || 0) : totalDebit;
    const displayPayableTotal = grandTotal ? (Number(grandTotal.payable) || 0) : totalPayable;

    const totalRow = worksheet.addRow([
        '',
        'Grand Total',
        displayCreditTotal,
        displayDebitTotal,
        displayPayableTotal
    ]);
    totalRow.height = 22;

    for (let col = 1; col <= 5; col++) {
        const cell = totalRow.getCell(col);
        cell.font = { bold: true, size: 10 };
        cell.border = {
            top: { style: "medium", color: { argb: "FF000000" } },
            bottom: { style: "medium", color: { argb: "FF000000" } },
            left: { style: "thin", color: { argb: "FF000000" } },
            right: { style: "thin", color: { argb: "FF000000" } }
        };

        if (col === 2) {
            cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (col >= 3) {
            cell.numFmt = '#,##0.00';
            cell.alignment = { horizontal: "right", vertical: "middle" };
        }
    }

    // Explicit Column widths
    worksheet.getColumn(1).width = 25; // Card Number
    worksheet.getColumn(2).width = 20; // Payment Method
    worksheet.getColumn(3).width = 20; // Credit
    worksheet.getColumn(4).width = 20; // Debit
    worksheet.getColumn(5).width = 20; // Payable

    // Save/Download Excel File
    try {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const fileName = `Card_Report_${startDate}_to_${endDate}`;
        saveAs(blob, `${fileName}.xlsx`);
        return { success: true };
    } catch (error) {
        console.error("Failed to generate/export Card Report Excel file:", error);
        return { success: false, error };
    }
};

const exportParkingsReport = async (data, startDate, endDate, filters = {}) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Parking Records");

        const formattedStartDate = formatDateWithTimezone(startDate);
        const formattedEndDate = formatDateWithTimezone(endDate);

        // Title row (merged A1:H1)
        worksheet.mergeCells("A1:H1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "PARK SOLUTIONS INC.\nVAT-TIN: 010-165-233-00010\nPARKING RECORDS REPORT";
        titleCell.alignment = { horizontal: "left", vertical: "top", wrapText: true };
        titleCell.font = { bold: true, size: 12 };
        worksheet.getRow(1).height = 60;

        // Date generated & Time section (Row 2, merged A2:H2)
        worksheet.mergeCells("A2:H2");
        const metaCell = worksheet.getCell("A2");
        const dateObj = new Date();
        const genDate = formatDateWithTimezone(dateObj);
        const genTime = formatTimeWithTimezone(dateObj);

        const formatPHTime = (utc) => {
            if (!utc) return 'N/A';
            const dateStr = formatDateWithTimezone(utc);
            const timeStr = formatTimeWithTimezone(utc);
            return dateStr && timeStr ? `${dateStr} ${timeStr}` : 'N/A';
        };

        let filterStr = "";
        if (filters.ticketNo || filters.plateNumber) {
            const parts = [];
            if (filters.ticketNo) parts.push(`Ticket No: ${filters.ticketNo}`);
            if (filters.plateNumber) parts.push(`Plate No: ${filters.plateNumber}`);
            filterStr = ` | Filters - ${parts.join(', ')}`;
        }

        metaCell.value = `Date Generated: ${genDate} ${genTime} | Period: ${formattedStartDate} to ${formattedEndDate}${filterStr}`;
        metaCell.alignment = { horizontal: "left", vertical: "center" };
        metaCell.font = { italic: true, size: 10 };
        worksheet.getRow(2).height = 20;

        // Blank row
        worksheet.getRow(3).height = 15;

        // Define columns
        const columns = [
            { header: 'No.', width: 8 },
            { header: 'Ticket No', width: 22 },
            { header: 'Plate No', width: 18 },
            { header: 'Check In', width: 25 },
            { header: 'Check Out', width: 25 },
            { header: 'Check In Machine', width: 22 },
            { header: 'Check Out Machine', width: 22 },
            { header: 'Vehicle Type', width: 16 },
        ];

        // Header row
        const headerRow = worksheet.getRow(4);
        headerRow.height = 25;
        columns.forEach((col, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = col.header;
            worksheet.getColumn(index + 1).width = col.width;
        });

        // Style header row
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF4CAF50" } // Material Design Green 500
            };
            cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // Data rows
        data.forEach((item, index) => {
            const checkInStr = formatPHTime(item.check_in_time);
            const checkOutStr = formatPHTime(item.check_out_time);

            const dataRow = worksheet.addRow([
                index + 1,
                item.ticket_no || 'N/A',
                item.plate_number || 'N/A',
                checkInStr,
                checkOutStr,
                item.check_in_machine_id || 'N/A',
                item.check_out_machine_id || 'N/A',
                item.vehicle_type_id || 'N/A',
            ]);
            dataRow.height = 20;

            dataRow.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
                cell.font = { size: 10 };
                
                if (colNumber === 1 || colNumber === 6 || colNumber === 7 || colNumber === 8) {
                    cell.alignment = { horizontal: "center", vertical: "middle" };
                } else {
                    cell.alignment = { horizontal: "left", vertical: "middle" };
                }
            });
        });

        // Save/Download Excel File
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const cleanStart = formattedStartDate.replace(/\//g, '-');
        const cleanEnd = formattedEndDate.replace(/\//g, '-');
        const fileName = `Parking_Report_${cleanStart}_to_${cleanEnd}`;
        saveAs(blob, `${fileName}.xlsx`);
        return { success: true };
    } catch (error) {
        console.error("Failed to generate/export Parkings Report Excel file:", error);
        return { success: false, error };
    }
};

export {
    exportAnexBReport,
    exportTransactionReports,
    exportAnexAReport,
    exportPosSaleReport,
    exportSeniorCitizenReport,
    exportDisablePersonReport,
    exportStationReport,
    exportBusTripReport,
    exportDynamicTableData,
    exportRouteAnalyticsSummary,
    exportBusAnalyticsSummary,
    exportTicketReport,
    exportUnusedTicketPOSReport,
    exportUsedTicketPOSReport,
    exportUnusedTicketQRReport,
    exportUsedTicketQRReport,
    exportTopUpHistoryReport,
    exportCardReport,
    exportParkingsReport
};

// Default export for backward compatibility
export default {
    exportAnexBReport,
    exportTransactionReports,
    exportAnexAReport,
    exportPosSaleReport,
    exportSeniorCitizenReport,
    exportDisablePersonReport,
    exportStationReport,
    exportBusTripReport,
    exportDynamicTableData,
    exportRouteAnalyticsSummary,
    exportBusAnalyticsSummary,
    exportTicketReport,
    exportTopUpHistoryReport,
    exportUnusedTicketPOSReport,
    exportUsedTicketPOSReport,
    exportUnusedTicketQRReport,
    exportUsedTicketQRReport,
    exportCardReport,
    exportParkingsReport
};
