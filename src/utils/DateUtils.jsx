import dayjs from "dayjs";

export function getStartOfDay(dateInput) {
    return dayjs(dateInput).startOf('day').toDate();
}

export function getEndOfDay(dateInput) {
    return dayjs(dateInput).endOf('day').toDate();
}

const formatDate = (datetime) => {
    return datetime !== null ? dayjs(datetime).format("MMMM D, YYYY h:mm A") : "N/A";
};

const fileDate = (date) => {
    const formattedDate = `${date.getFullYear()}_${String(date.getMonth() + 1).padStart(2, '0')}_${String(date.getDate()).padStart(2, '0')}`;
    return formattedDate
}

const getFormattedDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
};

const getFormattedTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })
}

const getFormattedDateTime = (date) => {
    if (!date) return "N/A";

    const updatedDate = new Date(date);
    return isNaN(updatedDate.getTime())
        ? "N/A"
        : updatedDate.toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
};


export default {
    formatDate,
    fileDate,
    getFormattedDate,
    getFormattedTime,
    getFormattedDateTime,
    getStartOfDay,
    getEndOfDay,
}
