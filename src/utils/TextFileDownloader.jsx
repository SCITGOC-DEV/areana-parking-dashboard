import {ACCR_NO, ISSUED_DATE, formatTIN, addPadding} from "./Constants";
import DateUtils from "./DateUtils";

const downloadXReadingReportTxt = (data, date, dispatchTime, arrivalTime, serialNo, filenamePrefix = "x_reading_report") => {
    if (!data) {
        console.warn("No report data provided");
        return;
    }

    const {
        accreditationNo,
        beginningOr,
        closingBalance,
        dateIssued,
        endDateTime,
        endingOr,
        footerSubTitle,
        footerTitle,
        totalCostOfPaperTicket,
        totalNetAmountOfPaperTicket,
        headerSubTitle,
        headerTitle,
        min,
        paymentMethod = [],
        openingBalance,
        ptuNo,
        refund,
        reportDate,
        reportTime,
        shortOver,
        sn,
        startDateTime,
        totalPayment,
        validUntil,
        vatTin,
        void: voidAmount,
        withdrawal
    } = data;

    const now = new Date();
    const formattedDate = now.toISOString().replace(/[:.]/g, "-");
    const filename = `${filenamePrefix}_${formattedDate}.txt`;

    const lineWidth = 50;

    const center = (text) => {
        const space = Math.max(0, Math.floor((lineWidth - text.length) / 2));
        return ' '.repeat(space) + text;
    };

    const formatLine = (label, value) => {
        const valueStr = String(value);
        const labelStr = label.padEnd(lineWidth - valueStr.length, ' ');
        return `${labelStr}${valueStr}`;
    };

    // Payment method rows for PAYMENTS RECEIVED section
    const paymentReceivedRows = [];

// Get amounts for Paper Ticket and Card
    const paperTicket = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'paper ticket');
    const cardPayment = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'card');
    const mobileQRTicketPayment = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'mobile qr ticket');

// Always show Paper Ticket and Card
    paymentReceivedRows.push(
        formatLine('Card :', safe(cardPayment?.amount) || '0.00'),
        formatLine('Mobile QR Ticket :', safe(mobileQRTicketPayment?.amount) || '0.00'),
        formatLine('Paper Ticket :', safe(paperTicket?.amount) || '0.00'),
    );

// Add other payment methods except Paper Ticket (Cash) and Card
    paymentMethod
        .filter(pm =>
            pm && pm.paymentType &&
            !['paper ticket', 'card','mobile qr ticket'].includes(pm.paymentType.toLowerCase()) &&
            pm.amount != null
        )
        .forEach(pm => {
            paymentReceivedRows.push(
                formatLine(`${pm.paymentType} :`, safe(pm.amount))
            );
        });


    // Transaction summary rows
    const transactionSummaryRows = [];

// Get amounts for Paper Ticket and Card
    const paperTicketSum = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'paper ticket');
    const cardPaymentSum = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'card');
    const mobileQRTicketPaymentSum = paymentMethod.find(pm => pm.paymentType?.toLowerCase() === 'mobile qr ticket');


// Always show Paper Ticket and Card
    transactionSummaryRows.push(
        formatLine('Card :', safe(cardPaymentSum?.amount) || '0.00'),
        formatLine('Mobile QR Ticket :', safe(mobileQRTicketPaymentSum?.amount) || '0.00'),
        formatLine('Paper Ticket :',  safe(paperTicketSum?.amount) || '0.00'),
    );

// Add other payment methods except Paper Ticket (Cash) and Card
    paymentMethod
        .filter(pm =>
            pm && pm.paymentType &&
            !['paper ticket', 'card','mobile qr ticket'].includes(pm.paymentType.toLowerCase()) &&
            pm.amount != null
        )
        .forEach(pm => {
            transactionSummaryRows.push(
                formatLine(`${pm.paymentType} :`, safe(pm.amount))
            );
        });


    const text = [
        center('METRO RAPID TRANSIT SERVICE, INC.'),
        center('Transport Terminal SM Seaside City Cebu,'),
        center('South Road Properties, Mambaling, Cebu City 6000'),
        '',
        formatLine("VAT-TIN: ", formatTIN(safe(vatTin))),
        formatLine("MIN:",safeNumber(min)),
        formatLine("S/N:", safeNumber(serialNo)),
        '',
        center('X-READING REPORT'),
        '',
        formatLine('Report Date:', safe(reportDate)),
        formatLine('Report Time:', safe(reportTime)),
        '',
        formatLine('Start Date & Time:', safe(startDateTime)),
        formatLine('End Date & Time:', safe(endDateTime)),
        '',
        formatLine('Beg. SI #:', safeNumber(beginningOr)),
        formatLine('End. SI #:', safeNumber(endingOr)),
        '',
        formatLine('Opening Fund:', safe(openingBalance)),
        '='.repeat(lineWidth),
        center('PAYMENTS RECEIVED'),
        ...paymentReceivedRows,
        '='.repeat(lineWidth),
        center('TRANSACTION SUMMARY'),
        ...transactionSummaryRows,
        '='.repeat(lineWidth),
        '',
        center('OROSYSTEM, INC.'),
        center('230 (NP) NORTH PARKING BLDG PACIFIC DRIVE'),
        center('SM MALL OF ASIA BARANGAY 76 1300 PASAY CITY'),
        center('NCR FOURTH DISTRICT PHILIPPINES'),
        formatLine('VAT Reg. TIN :', formatTIN('670-422-808-00000')),
        formatLine('ACCR No. :', ACCR_NO),
        formatLine('Date Issued :', ISSUED_DATE),
        formatLine('BIR PTU No. :', safeNumber(ptuNo) || 'N/A'),
        formatLine('Date Issued :', 'N/A'),
    ].join('\n');

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};



const safe = (value) => {
    if (value === null || value === undefined || value === '0' || value === 0) {
        return '0.00';
    }

    const num = Number(value);
    if (isNaN(num)) return String(value);

    // Format to 2 decimal places if not already
    return num.toFixed(2);
};


const safeNumber = (value) => {
    if (value === null || value === undefined || value === '0' || value === 0) {
        return '0';
    }
    return String(value);
}

const safeOrNumber = (value) => {
    if (value === null || value === undefined || value === '0' || value === 0) {
        return '0000000000'
    }
    return addPadding(value);
}

const lineWidth = 50;

const center = (text) => {
    const space = Math.max(0, Math.floor((lineWidth - text.length) / 2));
    return ' '.repeat(space) + text;
};

const formatLine = (label, value) => {
    const valueStr = String(value);
    const labelStr = label.padEnd(lineWidth - valueStr.length, ' ');
    return `${labelStr}${valueStr}`;
};

const downloadZReadingReportTxt = (data, date, machineName, serialNo, zReadingCount, resetCount, filenamePrefix = "z_reading_report") => {
    if (!data) {
        console.warn("No Z-Reading data provided");
        //return;
    }

    console.log('resetcount: ', resetCount);

    // Sanitize machine name (remove special characters/spaces)
    const cleanMachineName = machineName?.replace(/[^a-zA-Z0-9_-]/g, "_") || "unknown_machine";

    // Timestamp
    const now = new Date();
    const formattedTime = now.toISOString().replace(/[:.]/g, "-");

    // Final filename
    const filename = `${filenamePrefix}_${DateUtils.fileDate(date)}_${cleanMachineName}_${formattedTime}.txt`;

    const {
        accreditationNo,
        reportData,
        beginningOr,
        dateIssued,
        endingOr,
        endDateTime,
        footerSubTitle,
        footerTitle,
        grossSales,
        headerSubTitle,
        headerTitle,
        min,
        netSales,
        newGrandTotal,
        oldGrandTotal,
        passengerData = [],
        paymentMethod = [],
        ptuNo,
        pwdDiscount,
        reportDate,
        reportTime,
        seniorCitizenDiscount,
        sn,
        startDateTime,
        studentDiscount,
        totalDiscount,
        totalPayment,
        transactionDate,
        validUntil,
        totalCostOfPaperTicket,
        totalNetAmountOfPaperTicket,
        vatTin,
        vatableAmount,
        vatableExemptSales,
        vatableSales,
        zCounterNo,
        zeroRatedSales,
        cityOrdinanceDiscount,
        otherDiscount,
        naacDiscount,
        soloParentDiscount,
        vatAdjustment,
    } = data;

    console.log('beginningOr', beginningOr);
    console.log('endingOr', endingOr);

    // Helper for table-like alignment
    const pad = (str, len, align = 'left') => {
        // Handle null/undefined with appropriate defaults
        if (str === null || str === undefined) {
            str = '0.00'; // Default for numeric values
        } else {
            str = String(str);
        }

        if (align === 'right') return str.padStart(len);
        if (align === 'center') {
            const total = len - str.length;
            const left = Math.floor(total / 2);
            const right = total - left;
            return ' '.repeat(left) + str + ' '.repeat(right);
        }
        return str.padEnd(len);
    };

    // Breakdown of sales using formatLine for consistent alignment
    const breakdownRows = [
        formatLine('VATABLE SALES :', safe(vatableSales)),
        formatLine('VAT AMOUNT :', safe(vatableAmount)),
        formatLine('VAT EXEMPT SALES :', safe(grossSales)),
        formatLine('ZERO RATED SALES :', safe(zeroRatedSales)),
    ];

    // Discount summary using formatLine for consistent alignment
    const discountRows = [
        formatLine('SC Disc. :', safe(seniorCitizenDiscount)),
        formatLine('PWD Disc. :', safe(pwdDiscount)),
        formatLine('Student Disc. :', safe(studentDiscount)),
        formatLine('NAAC Disc. :', safe(naacDiscount) || '0.00'),
        formatLine('Solo Parent Disc. :', safe(soloParentDiscount) || '0.00'),
        formatLine('City Ordinance Disc. :', safe(cityOrdinanceDiscount) || '0.00'),
        formatLine('Other Disc. :', safe(otherDiscount) || '0.00'),
    ];

    // VAT adjustment using formatLine for consistent alignment
    const vatAdjRows = [
        formatLine('SC TRANS. :', '0.00'),
        formatLine('PWD TRANS. :', '0.00'),
        formatLine('REG. Disc. TRANS. :', '0.00'),
        formatLine('ZERO RATED TRANS. :', '0.00'),
        formatLine('Other VAT Adjustments :', '0.00'),
    ];

    // Transaction summary using formatLine for consistent alignment
    const paperTicket = paymentMethod.find(pm => pm?.paymentType?.toLowerCase() === 'cash');
    const cardPayment = paymentMethod.find(pm => pm?.paymentType?.toLowerCase() === 'card');

    const transRows = [
        formatLine('CARD :', safe(cardPayment?.amount) || '0.00'),
        formatLine('PAPER TICKET :', safe(paperTicket?.amount) || '0.00'),
        ...paymentMethod
            .filter(pm => pm && pm.paymentType &&
                pm.paymentType.toLowerCase() !== 'cash' &&
                pm.paymentType.toLowerCase() !== 'card'
            )
            .map(pm => formatLine(`${pm.paymentType.toUpperCase()} :`, safe(pm.amount)))
    ];



    const text = [
        center('METRO RAPID TRANSIT SERVICE, INC.'),
        center('Transport Terminal SM Seaside City Cebu,'),
        center('South Road Properties, Mambaling, Cebu City 6000'),
        '',
        formatLine("VAT-TIN:" ,formatTIN(safe(vatTin))),
        formatLine(`MIN:`, safeNumber(min)),
        formatLine("S/N:" , safeNumber(serialNo)),
        '',
        center('Z-READING REPORT'),
        '',
        formatLine('Report Date:', safe(reportDate)),
        formatLine('Report Time:', safe(reportTime)),
        '',
        formatLine('Start Date & Time:', safe(startDateTime)),
        formatLine('End Date & Time:', safe(endDateTime)),
        '',
        formatLine('Beg. SI #:', safeOrNumber(beginningOr)),
        formatLine('End. SI #:', safeOrNumber(endingOr)),
        '',
        formatLine('Reset Counter No.:', resetCount),
        formatLine('Z Counter No.:', zReadingCount),
        '-'.repeat(lineWidth),
        formatLine('Present Accumulated Sales :', safe(newGrandTotal)),
        formatLine('Previous Accumulated Sales :', safe(oldGrandTotal)),
        formatLine('Sales of the Day :', safe(grossSales)),
        '-'.repeat(lineWidth),
        center('BREAKDOWN OF SALES'),
        ...breakdownRows,
        '-'.repeat(lineWidth),
        formatLine('Gross Amount :', safe(grossSales)),
        formatLine('Less Discount :', safe(totalDiscount)),
        formatLine('Less VAT Adjustment :', safe(vatAdjustment) || '0.00'),
        formatLine('Net Amount :', safe(netSales)),
        '-'.repeat(lineWidth),
        center('DISCOUNT SUMMARY'),
        ...discountRows,
        '-'.repeat(lineWidth),
        center('VAT ADJUSTMENT'),
        ...vatAdjRows,
        '-'.repeat(lineWidth),
        center('TRANSACTION SUMMARY'),
        ...transRows,
        '-'.repeat(lineWidth),
        center('OROSYSTEM, INC.'),
        center('230 (NP) NORTH PARKING BLDG PACIFIC DRIVE'),
        center('SM MALL OF ASIA BARANGAY 76 1300 PASAY CITY'),
        center('NCR FOURTH DISTRICT PHILIPPINES'),
        formatLine('VAT Reg. TIN :', formatTIN('670-422-808-00000')),
        formatLine('ACCR NO :', ACCR_NO),
        formatLine('Date Issued :', ISSUED_DATE),
        formatLine('BIR PTU No. :', safeNumber(ptuNo) || 'N/A'),
        formatLine('Date Issued :', 'N/A'),
    ].join('\n');

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};
const downloadTicketingReportTxt = (ticket, filenamePrefix = "ticketing_report") => {
    if (!ticket) {
        console.warn("No ticket data provided.");
        return;
    }

    const safe = (v) => v ?? "null";

    const now = new Date();
    const formattedTime = now.toISOString().replace(/[:.]/g, "-");
    const filename = `${filenamePrefix}_${formattedTime}.txt`;

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "null";
        const date = new Date(dateStr);
        const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const day = days[date.getDay()];
        const month = months[date.getMonth()];
        const dateNum = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${month}${dateNum}${day}@${hours}:${minutes}*${year}`;
    };

    const centerText = (text, width = 40) => {
        const pad = Math.max(0, Math.floor((width - text.length) / 2));
        return ' '.repeat(pad) + text;
    };

    const vehiclePlate = safe(ticket.vehicle_route?.vehicle?.vehicle_plate_number);
    const driverName = safe(ticket.vehicle_route?.driver?.full_name);
    const startStop = safe(ticket.vehicle_route?.start_bus_stop?.bus_stop_name);
    const endStop = safe(ticket.vehicle_route?.end_bus_stop?.bus_stop_name);
    const ticketCost = safe(ticket.ticket_cost);
    const created = formatDateTime(ticket.created_at);

    const text = `
${centerText("EASY PARK USER TICKET")}
Invoice No          :   ${safe(ticket.ticket_id)}
Car No.             :   ${vehiclePlate}
Driver Name         :   ${driverName}
Bus Fare            :   PHP ${ticketCost}
Destination         :   ${startStop} - ${endStop}
Date Time           :   ${created}
    `.trim();

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

export default {
    downloadXReadingReportTxt,
    downloadZReadingReportTxt,
    downloadTicketingReportTxt
}
