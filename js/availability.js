document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-form');
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    function parseLocalDate(value) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day); // JS months are 0-indexed
    }

    const checkin = parseLocalDate(checkinInput.value);
    const checkout = parseLocalDate(checkoutInput.value);

    if (isNaN(checkin) || isNaN(checkout) || checkout <= checkin) {
      alert("Please enter a valid check-in and check-out date.");
      return;
    }

    try {
      const availableVillas = await findAvailableVillas(checkin, checkout);
      if (availableVillas.length > 0) {
        alert("Available Villas:\n" + availableVillas.join('\n'));
      } else {
        alert("No villas available for the selected dates.");
      }
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      alert("There was an error checking availability.");
    }
  });
});

function getDateRange(startDate, endDate) {
  const dates = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);

  while (current < endDate) {
    const day = new Date(current);
    day.setHours(0, 0, 0, 0);
    dates.push(day);
    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return dates;
}

async function findAvailableVillas(checkin, checkout) {
  const availabilityUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXTwMjfK0Y7yGHIJVqikhus-iJJNsfiGihAqIiI8S22aD5zrZMk1ySmEPOHikUAEwK5E8D808wOipL/pub?output=csv';
  const pricesUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXTwMjfK0Y7yGHIJVqikhus-iJJNsfiGihAqIiI8S22aD5zrZMk1ySmEPOHikUAEwK5E8D808wOipL/pub?gid=1320210240&single=true&output=csv';

  // Fetch availability CSV
  const response = await fetch(availabilityUrl);
  const csv = await response.text();
  const rows = csv.split('\n').map(row => row.split(','));
  const headers = rows[0];
  const data = rows.slice(1);

  const villaMap = {};
  data.forEach(row => {
    const entry = {};
    headers.forEach((h, i) => {
      entry[h.trim()] = row[i]?.trim() || '';
    });

    const { villa_name, year, month } = entry;
    if (!villa_name || !year || !month) return;

    const y = parseInt(year);
    const m = parseInt(month);
    if (!villaMap[villa_name]) villaMap[villa_name] = {};
    if (!villaMap[villa_name][y]) villaMap[villa_name][y] = {};
    villaMap[villa_name][y][m] = {};

    for (let d = 1; d <= 31; d++) {
      const value = entry[d.toString()]?.toLowerCase();
      if (value === 'x') {
        villaMap[villa_name][y][m][d] = true;
      }
    }
  });

  // Fetch prices CSV
  const priceResponse = await fetch(pricesUrl);
  const priceCsv = await priceResponse.text();
  const priceRows = priceCsv.split('\n').map(row => row.split(','));
  const priceHeaders = priceRows[0];
  const priceData = priceRows.slice(1);

  const pricesMap = {};
  priceData.forEach(row => {
    const entry = {};
    priceHeaders.forEach((h, i) => {
      entry[h.trim()] = row[i]?.trim() || '';
    });

    const { villa_name, year, month } = entry;
    if (!villa_name || !year || !month) return;

    const y = parseInt(year);
    const m = parseInt(month);
    if (!pricesMap[villa_name]) pricesMap[villa_name] = {};
    if (!pricesMap[villa_name][y]) pricesMap[villa_name][y] = {};
    pricesMap[villa_name][y][m] = {};

    for (let d = 1; d <= 31; d++) {
      const val = entry[d.toString()];
      if (val) {
        pricesMap[villa_name][y][m][d] = parseFloat(val);
      }
    }
  });

  const daysInRange = getDateRange(checkin, checkout);
  const availableVillas = [];

  for (const villa in villaMap) {
    let isFree = true;
    let totalPrice = 0;

    for (let i = 0; i < daysInRange.length; i++) {
      const date = daysInRange[i];
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const booked = villaMap[villa]?.[y]?.[m]?.[d];
      // First day can be check-in day even if booked (checkout morning)
      const allowed = i === 0 ? true : !booked;

      if (!allowed) {
        isFree = false;
        break;
      }

      const price = pricesMap[villa]?.[y]?.[m]?.[d] || 0;
      totalPrice += price;
    }

    if (isFree) {
      availableVillas.push(`${villa} (€${totalPrice.toFixed(2)} for ${daysInRange.length} nights)`);
    }
  }

  return availableVillas;
}