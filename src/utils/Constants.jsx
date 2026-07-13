export const ACCR_NO = "0516704228082025052327"
export const ISSUED_DATE = "May 20, 2025"

export const addPadding = (value) => {
    if (value === null || value === undefined) {
        return 'N/A'; // Return 10 zeros for null/undefined values
    }
    return value.toString().padStart(10, '0');
}
function getValidDate(date) {
    if (!date) return null;
    const d = (date instanceof Date) ? date : new Date(date);
    return isNaN(d.getTime()) ? null : d;
}

export function formatDateWithTimezone(date) {
    if (!date) return '';

    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    // Get UTC components
    const utcYear = d.getUTCFullYear();
    const utcMonth = String(d.getUTCMonth() + 1).padStart(2, '0');
    const utcDay = String(d.getUTCDate()).padStart(2, '0');
    const utcHours = d.getUTCHours();
    const utcMinutes = d.getUTCMinutes();
    const utcSeconds = d.getUTCSeconds();

    // Add 8 hours for Manila timezone
    let hours = utcHours + 8;
    let day = parseInt(utcDay);
    let month = parseInt(utcMonth);
    let year = utcYear;

    if (hours >= 24) {
        hours -= 24;
        day += 1;

        // Handle month/year overflow
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
            daysInMonth[1] = 29;
        }

        if (day > daysInMonth[month - 1]) {
            day = 1;
            month += 1;
            if (month > 12) {
                month = 1;
                year += 1;
            }
        }
    }

    const mm = String(month).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const yyyy = year;

    return `${mm}/${dd}/${yyyy}`;
}


export function formatTimeWithTimezone(date) {
    const d = getValidDate(date);
    if (!d) return '';

    return d.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Manila',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

export function formatDateToISO(startDate, endDate) {
    if (!startDate || !endDate) return { startDate: '', endDate: '' };

    const start = (startDate instanceof Date) ? startDate : new Date(startDate);
    const end = (endDate instanceof Date) ? endDate : new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return { startDate: '', endDate: '' };
    }

    // Format dates to YYYY-MM-DD in Manila timezone
    const startDateStr = formatDateToYYYYMMDD(start);
    const endDateStr = formatDateToYYYYMMDD(end);

    // Create PH dates at midnight UTC
    const phDateFrom = new Date(`${startDateStr}T00:00:00Z`);
    const utcStart = new Date(phDateFrom.getTime() - (8 * 60 * 60 * 1000));

    const phDateTo = new Date(`${endDateStr}T00:00:00Z`);
    const utcEnd = new Date(phDateTo.getTime() + (24 * 60 * 60 * 1000) - (8 * 60 * 60 * 1000) - 1000);

    return {
        startDate: utcStart.toISOString(),
        endDate: utcEnd.toISOString()
    };
}

export function formatDateToMMDDYYYY(date) {
    if (!date) return '';

    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });

    const parts = formatter.formatToParts(d);

    const mm = parts.find(p => p.type === 'month').value;
    const dd = parts.find(p => p.type === 'day').value;
    const yyyy = parts.find(p => p.type === 'year').value;

    return `${mm}/${dd}/${yyyy}`;
}


export function formatTIN(tin) {
    if (!tin) return '';
    const cleanTIN = tin.toString().replace(/-/g, '');

    // Match first 3, next 3, next 3, last 5
    return cleanTIN.replace(/^(\d{3})(\d{3})(\d{3})(\d{5})$/, '$1-$2-$3-$4');
}


export function formatDateToYYYYMMDD(date) {
    if (!date) return '';
    const d = (date instanceof Date) ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}
