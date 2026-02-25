export const robustParseDate = (dateStr) => {
    if (!dateStr) return new Date(0);
    // Si ja és un objecte Date, el retornem
    if (dateStr instanceof Date) return dateStr;

    try {
        // Si és un string que sembla una data ISO
        if (typeof dateStr === 'string' && dateStr.includes('T') && !isNaN(Date.parse(dateStr))) {
            return new Date(dateStr);
        }

        // Netegem el string
        let clean = dateStr.toString().replace(/,/g, '').replace(/\./g, '').toLowerCase();

        // Busquem números: DD MM YYYY HH MM SS
        const parts = clean.split(/[^0-9]+/).filter(x => x.length > 0);

        if (parts.length >= 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1;
            const year = parts[2].length === 2 ? 2000 + parseInt(parts[2]) : parseInt(parts[2]);

            let hours = parts.length > 3 ? parseInt(parts[3]) : 0;
            const minutes = parts.length > 4 ? parseInt(parts[4]) : 0;
            const seconds = parts.length > 5 ? parseInt(parts[5]) : 0;

            // PM/AM logic fallback
            if ((clean.includes('p m') || clean.includes('pm')) && hours < 12) hours += 12;
            if ((clean.includes('a m') || clean.includes('am')) && hours === 12) hours = 0;

            const d = new Date(year, month, day, hours, minutes, seconds);
            if (!isNaN(d.getTime())) return d;
        }

        const fallback = new Date(dateStr);
        return isNaN(fallback.getTime()) ? new Date(0) : fallback;
    } catch (e) {
        return new Date(0);
    }
};

export const formatCurrentDate = () => {
    const now = new Date();
    const d = now.getDate().toString().padStart(2, '0');
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const y = now.getFullYear();
    const h = now.getHours().toString().padStart(2, '0');
    const min = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
};

export const GENERATE_YEARS = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    // User requested down to 2000
    for (let y = 2000; y <= currentYear + 1; y++) {
        years.push(y.toString());
    }
    return years.reverse();
};
