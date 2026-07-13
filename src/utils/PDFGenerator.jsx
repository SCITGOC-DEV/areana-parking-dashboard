import jsPDF from 'jspdf';
import { ACCR_NO, ISSUED_DATE, addPadding, formatDateToMMDDYYYY, formatTIN } from "./Constants";
import DateUtils from "./DateUtils";
import blackAndWhiteLogo from '../assets/black_and_white_logo.png';

const generateTransactionPDF = (data, fileName, startDate, endDate, serialNo) => {
    if (!Array.isArray(data)) {
        console.error('Invalid data format: expected array');
        return;
    }

    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    let yPosition = margin;
    const lineHeight = 7;
    const sectionSpacing = 10;

    // Helper functions
    const addText = (text, x, y, options = {}) => {
        const { fontSize = 12, fontStyle = 'normal', align = 'left' } = options;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.text(text, x, y, { align });
    };

    const addCenteredText = (text, y, options = {}) => {
        addText(text, pageWidth / 2, y, { ...options, align: 'center' });
    };

    const addLine = (y) => {
        doc.line(margin, y, pageWidth - margin, y);
    };

    const formatCurrency = (value) => {
        if (value === null || value === undefined || isNaN(value)) {
            return "0.00";
        }
        // Convert to positive number and format to 2 decimal places without +/- signs
        return Math.abs(Number(value)).toFixed(2);
    };

    const safe = (value) => {
        if (value === null || value === undefined) {
            return 'N/A';
        }
        return String(value);
    };

    // METRO HEADING (from X-Reading/Z-Reading reports)
    addCenteredText("METRO RAPID TRANSIT SERVICE, INC.", yPosition, { fontSize: 16, fontStyle: 'bold' });
    yPosition += lineHeight;

    addCenteredText("Transport Terminal SM Seaside City Cebu,", yPosition, { fontSize: 12 });
    yPosition += lineHeight;

    addCenteredText("South Road Properties, Mambaling, Cebu City 6000", yPosition, { fontSize: 12 });
    yPosition += lineHeight * 2;

    // Company details
    addText(`VAT-TIN: ${safe(data[0]?.vatTin || '009087728-00000')}`, margin, yPosition);
    addText(`MIN: ${safe(data[0]?.min || 'N/A')}`, margin, yPosition + lineHeight);
    addText(`S/N: ${safe(serialNo)}`, margin, yPosition + lineHeight * 2);
    yPosition += lineHeight * 4;

    // Report title
    addCenteredText("TRANSACTION REPORT", yPosition, { fontSize: 14, fontStyle: 'bold' });
    yPosition += lineHeight * 2;

    // Date range
    addText(`Report Date: ${formatDateToMMDDYYYY(new Date())}`, margin, yPosition);
    addText(`Report Time: ${formatDateToMMDDYYYY(new Date())}`, margin, yPosition + lineHeight);
    yPosition += lineHeight * 3;

    addText(`For the period: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Add separator line
    addLine(yPosition);
    yPosition += sectionSpacing;

    // TRANSACTION CONTENT (from transaction reports)
    // Headers
    const headers = [
        { text: 'Ticket ID', width: 30 },
        { text: 'Bus Number', width: 25 },
        { text: 'Passenger', width: 35 },
        { text: 'Amount', width: 20 },
        { text: 'Payment', width: 20 },
        { text: 'Time', width: 25 },
        { text: 'Type', width: 20 }
    ];

    // Calculate starting X position for table
    const tableStartX = margin;
    let currentX = tableStartX;

    // Add header row
    headers.forEach(header => {
        addText(header.text, currentX, yPosition, { fontSize: 10, fontStyle: 'bold' });
        currentX += header.width;
    });
    yPosition += lineHeight;

    // Add separator line after headers
    addLine(yPosition);
    yPosition += lineHeight;

    // Check if we need a new page
    const checkNewPage = () => {
        if (yPosition > pageHeight - 80) { // Leave space for footer
            doc.addPage();
            yPosition = margin;
            return true;
        }
        return false;
    };

    // Add transaction data
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalVAT = 0;

    data.forEach((ticket, index) => {
        // Check if we need a new page
        if (checkNewPage()) {
            // Re-add headers on new page
            currentX = tableStartX;
            headers.forEach(header => {
                addText(header.text, currentX, yPosition, { fontSize: 10, fontStyle: 'bold' });
                currentX += header.width;
            });
            yPosition += lineHeight;
            addLine(yPosition);
            yPosition += lineHeight;
        }

        // Add transaction row
        currentX = tableStartX;
        addText(ticket.ticket_id || 'N/A', currentX, yPosition, { fontSize: 9 });
        currentX += headers[0].width;

        addText(ticket?.vehicle_route?.vehicle?.vehicle_plate_number || 'N/A', currentX, yPosition, { fontSize: 9 });
        currentX += headers[1].width;

        addText(ticket.registered_name || 'Anonymous', currentX, yPosition, { fontSize: 9 });
        currentX += headers[2].width;

        addText(`₱${formatCurrency(ticket.net_amount)}`, currentX, yPosition, { fontSize: 9 });
        currentX += headers[3].width;

        addText(ticket.payment_method?.replace(/_/g, ' ') || 'N/A', currentX, yPosition, { fontSize: 9 });
        currentX += headers[4].width;

        addText(formatDateToMMDDYYYY(ticket.created_at), currentX, yPosition, { fontSize: 9 });
        currentX += headers[5].width;

        addText(ticket.passenger_type || 'N/A', currentX, yPosition, { fontSize: 9 });
        currentX += headers[6].width;

        yPosition += lineHeight;

        // Track totals
        totalAmount += ticket.ticket_cost || 0;
        totalDiscount += ticket.discount || 0;
        totalVAT += ticket.vat_amount || 0;
    });

    // Add separator line before summary
    addLine(yPosition);
    yPosition += sectionSpacing;

    // Summary section
    addText("SUMMARY:", margin, yPosition, { fontSize: 12, fontStyle: 'bold' });
    yPosition += lineHeight * 2;

    addText(`Total Amount: ₱${formatCurrency(totalAmount)}`, margin, yPosition);
    yPosition += lineHeight;

    addText(`Total Discount: ₱${formatCurrency(totalDiscount)}`, margin, yPosition);
    yPosition += lineHeight;

    addText(`Total VAT: ₱${formatCurrency(totalVAT)}`, margin, yPosition);
    yPosition += lineHeight;

    addText(`Net Amount: ₱${formatCurrency(totalAmount - totalDiscount)}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Add separator line before footer
    addLine(yPosition);
    yPosition += sectionSpacing;

    // ORO FOOTER (from X-Reading/Z-Reading reports)
    addCenteredText("OROSYSTEM, INC.", yPosition, { fontSize: 12, fontStyle: 'bold' });
    yPosition += lineHeight;

    addCenteredText("230 (NP) NORTH PARKING BLDG PACIFIC DRIVE", yPosition, { fontSize: 10 });
    yPosition += lineHeight;

    addCenteredText("SM MALL OF ASIA BARANGAY 76 1300 PASAY CITY", yPosition, { fontSize: 10 });
    yPosition += lineHeight;

    addCenteredText("NCR FOURTH DISTRICT PHILIPPINES", yPosition, { fontSize: 10 });
    yPosition += lineHeight * 2;

    // Footer details
    addText(`Date Issued: ${ISSUED_DATE}`, margin, yPosition);
    addText(`BIR PTU No.: ${safe(data[0]?.ptuNo || 'N/A')}`, margin, yPosition + lineHeight);
    addText(`ACCR NO: ${ACCR_NO}`, margin, yPosition + lineHeight * 2);

    // Save the PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const finalFileName = `${fileName || 'transaction_report'}_${timestamp}.pdf`;
    doc.save(finalFileName);

    return { success: true, message: "PDF generated successfully", filename: finalFileName };
};

// Helper functions used by PDF generation
const safe = (value) => value ?? "N/A";
const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
        return "0.00";
    }
    return Math.abs(Number(value)).toFixed(2);
};

const generateTransactionItemPDF = async (ticket, fileName) => {
    if (!ticket) {
        console.error('No ticket data provided');
        return;
    }

    // Helper function to generate ticket ID (same as in TransactionsScreen)
    const generateTicketId = (machineId, ticketId) => {
        const paddedMachineId = String(machineId).padStart(2, '0');
        const paddedTicketId = String(ticketId).padStart(8, '0');
        return paddedMachineId + paddedTicketId;
    };

    // Helper functions for data formatting
    const safe = (value) => {
        return value !== null && value !== undefined ? String(value) : 'N/A';
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0.00';
        return parseFloat(amount).toFixed(2);
    };

    const addPadding = (ticketId) => {
        if (!ticketId) return "N/A";
        return String(ticketId).padStart(10, '0');
    };

    // Create new PDF document with custom narrow size (55mm x 150mm)
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [55, 150]
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 4;

    let yPosition = margin;
    const lineHeight = 3.5;

    // Helper functions
    const addText = (text, x, y, options = {}) => {
        const { fontSize = 6, fontStyle = 'normal', align = 'left', maxWidth = pageWidth - 2 * margin } = options;
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.text(text, x, y, { align, maxWidth });
    };

    const addCenteredText = (text, y, options = {}) => {
        addText(text, pageWidth / 2, y, { ...options, align: 'center' });
    };

    const addLine = (y) => {
        doc.setLineWidth(0.1);
        doc.line(margin, y, pageWidth - margin, y);
    };

    const addDashedLine = (y) => {
        const dashLength = 1;
        const gapLength = 0.5;
        const totalWidth = pageWidth - 2 * margin;
        let currentX = margin;

        doc.setLineWidth(0.1);
        while (currentX < pageWidth - margin) {
            const endX = Math.min(currentX + dashLength, pageWidth - margin);
            doc.line(currentX, y, endX, y);
            currentX += dashLength + gapLength;
        }
    };

    // Move addImage here so it can access doc
    const addImage = async (imagePath, x, y, width, height) => {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            return new Promise((resolve, reject) => {
                img.onload = () => {
                    try {
                        doc.addImage(img, 'PNG', x, y, width, height);
                        resolve();
                    } catch (error) {
                        console.warn('Error adding image:', error);
                        resolve(); // Continue without image
                    }
                };
                img.onerror = () => {
                    console.warn('Error loading image:', imagePath);
                    resolve();
                };
                img.src = imagePath;
            });
        } catch (error) {
            console.warn('Error in addImage function:', error);
        }
    };

    // Helper to check if a new page is needed
    const checkNewPage = () => {
        if (yPosition > pageHeight - 10) { // 10mm margin at bottom
            doc.addPage();
            yPosition = margin;
        }
    };

    // Add logo at the top (centered, smaller) - use imported black and white logo
    const logoWidth = 12;
    const logoHeight = 12;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = yPosition;
    try {
        checkNewPage();
        await addImage(blackAndWhiteLogo, logoX, logoY, logoWidth, logoHeight);
        yPosition += logoHeight + 2;
    } catch (error) {
        console.warn('Logo could not be loaded:', error);
        yPosition += 2;
    }

    // METRO HEADING - exact match to image
    checkNewPage();
    addCenteredText("METRO RAPID TRANSIT SERVICE, INC.", yPosition, { fontSize: 7, fontStyle: 'bold' });
    yPosition += lineHeight + 0.5;
    checkNewPage();
    addCenteredText("Transport Terminal SM Seaside City Cebu,", yPosition, { fontSize: 6 });
    yPosition += lineHeight;
    checkNewPage();
    addCenteredText("South Road Properties, Mambaling,", yPosition, { fontSize: 6 });
    yPosition += lineHeight;
    checkNewPage();
    addCenteredText("Cebu City 6000", yPosition, { fontSize: 6 });
    yPosition += lineHeight + 1;

    // Company details - left aligned
    checkNewPage();
    addText(`VAT Reg. TIN:`, margin, yPosition, { fontSize: 6 });
    addText(`009-087-728-00000`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`MIN:`, margin, yPosition, { fontSize: 6 });
    addText(`N/A`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`S/N:`, margin, yPosition, { fontSize: 6 });
    addText(`${safe(ticket.machine?.serial_number)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight + 3;

    // Sales Invoice Title - centered and bold
    checkNewPage();
    addCenteredText("Sales Invoice".toUpperCase(), yPosition, { fontSize: 10, fontStyle: 'bold' });
    yPosition += lineHeight + 3;

    // Helper to format date and time
    const formatDateTime = (value) => {
        if (!value) return 'N/A';
        const date = new Date(value);
        const pad = (n) => n.toString().padStart(2, '0');
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = pad(date.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = pad(hours);

        return `${month}/${day}/${year} ${hoursStr}:${minutes} ${ampm}`;
    };

    // Transaction Details Section - left aligned with colons
    checkNewPage();
    addText(`Invoice Number:`, margin, yPosition, { fontSize: 6 });
    addText(`${addPadding(ticket.ticket_id)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Plate No.:`, margin, yPosition, { fontSize: 6 });
    addText(`${safe(ticket.vehicle_route?.vehicle?.vehicle_plate_number)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Date/Time In:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatDateTime(ticket.created_at)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Date/Time Out:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatDateTime(ticket.boarded_at)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight + 2;

    // Equals line separator
    const equalsLine = "=".repeat(38);
    checkNewPage();
    addCenteredText(equalsLine, yPosition, { fontSize: 6 });
    yPosition += lineHeight + 2;

    // Payment details section - using actual ticket data
    checkNewPage();
    // Replace 'cash' with 'Paper Ticket' for payment method
    let paymentType = safe(ticket.payment_method)?.replace(/_/g, ' ') || 'Cash';
    if (paymentType.toLowerCase() === 'cash') paymentType = 'Paper Ticket';
    addText(`Payment Type:`, margin, yPosition, { fontSize: 6 });
    addText(`${paymentType}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    // Remove 'PHP' from all currency/amount fields and right-align numbers
    addText(`Qty:`, margin, yPosition, { fontSize: 6 });
    addText(`1`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Unit Cost/Price:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.ticket_cost || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Discount Type:`, margin, yPosition, { fontSize: 6 });
    addText(`${ticket.passenger_type || 'None'}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    // Calculate discount value from percent and show net price
    const ticketCostValue = parseFloat(ticket.ticket_cost || 0);
    const discountPercent = parseFloat(ticket.discount || 0);
    const discountValue = ticketCostValue * discountPercent / 100;
    const netPrice = ticketCostValue - discountValue;
    addText(`Discount:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(discountValue)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Net Price:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(netPrice)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Passenger Name:`, margin, yPosition, { fontSize: 6 });
    addText(`${safe(ticket.registered_name) || 'N/A'}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Passenger ID No.:`, margin, yPosition, { fontSize: 6 });
    addText(`${safe(ticket.passenger_id_no) || 'N/A'}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Total:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.net_amount || ticket.ticket_cost || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Cash Tendered:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.cash_tendered || ticket.net_amount || ticket.ticket_cost || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    const change = parseFloat(ticket.cash_tendered || ticket.net_amount || ticket.ticket_cost || 0) - parseFloat(ticket.net_amount || ticket.ticket_cost || 0);
    checkNewPage();
    addText(`Change:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(Math.max(0, change))}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight + 2;

    // Equals line separator
    checkNewPage();
    addCenteredText(equalsLine, yPosition, { fontSize: 6 });
    yPosition += lineHeight + 2;

    // VAT/Tax Section - using actual ticket data
    checkNewPage();
    addText(`VAT Sales:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.vatable_sales || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`VAT:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.vat_amount || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`VAT-Exempt:`, margin, yPosition, { fontSize: 6 });
    addText(`${formatCurrency(ticket.net_amount || 0)}`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Zero Rated:`, margin, yPosition, { fontSize: 6 });
    addText(`0.00`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight + 2;

    // Equals line separator
    checkNewPage();
    addCenteredText(equalsLine, yPosition, { fontSize: 6 });
    yPosition += lineHeight + 3;

    // Footer - OROSYSTEM section (centered headers)
    checkNewPage();
    addCenteredText("OROSYSTEM, INC.", yPosition, { fontSize: 7, fontStyle: 'bold' });
    yPosition += lineHeight + 0.5;
    checkNewPage();
    addCenteredText("230 (NP) NORTH PARKING BLDG", yPosition, { fontSize: 6 });
    yPosition += lineHeight;
    checkNewPage();
    addCenteredText("PACIFIC DRIVE SM MALL OF ASIA", yPosition, { fontSize: 6 });
    yPosition += lineHeight;
    checkNewPage();
    addCenteredText("BARANGAY 76 1300 PASAY CITY NCR", yPosition, { fontSize: 6 });
    yPosition += lineHeight;
    checkNewPage();
    addCenteredText("FOURTH DISTRICT PHILIPPINES", yPosition, { fontSize: 6 });
    yPosition += lineHeight + 1;

    // Footer details - right aligned
    checkNewPage();
    addText(`VAT Reg. TIN:`, margin, yPosition, { fontSize: 6 });
    addText(`670-422-808-00000`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`ACCR NO:`, margin, yPosition, { fontSize: 6 });
    addText(`0516704228082025052327`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Date Issued:`, margin, yPosition, { fontSize: 6 });
    addText(`May 20, 2025`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`BIR PTU No.:`, margin, yPosition, { fontSize: 6 });
    addText(`N/A`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });
    yPosition += lineHeight;
    checkNewPage();
    addText(`Date Issued:`, margin, yPosition, { fontSize: 6 });
    addText(`N/A`, pageWidth - margin, yPosition, { fontSize: 6, align: 'right' });

    // Save the PDF
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    doc.save(fileName || `transaction_item_${timestamp}.pdf`);
};

export default {
    generateTransactionPDF,
    generateTransactionItemPDF
};
