// Process and analyze football transfer data

export async function loadTransferData() {
  const response = await fetch('/src/data/transfers.csv');
  const text = await response.text();
  return parseCSV(text);
}

function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;

    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    data.push(row);
  }

  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

export function getTopLeagues(data) {
  return ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1'];
}

export function filterPaidTransfers(data) {
  return data.filter(d =>
    d.Transfer_type === 'fee' &&
    d.Price_numeric &&
    d.Price_numeric !== '' &&
    !isNaN(parseFloat(d.Price_numeric))
  );
}

export function getTransfersByLeague(data) {
  const leagueCounts = {};
  data.forEach(d => {
    const league = d.New_club_league || 'Unknown';
    leagueCounts[league] = (leagueCounts[league] || 0) + 1;
  });
  return Object.entries(leagueCounts)
    .map(([league, count]) => ({ league, count }))
    .sort((a, b) => b.count - a.count);
}

export function getTransfersByYear(data) {
  const yearCounts = {};
  data.forEach(d => {
    const year = d.Year;
    if (year && year !== '') {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });
  return Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
}

export function getTopTransfers(data, limit = 20) {
  const paid = filterPaidTransfers(data);
  return paid
    .map(d => ({
      ...d,
      price: parseFloat(d.Price_numeric)
    }))
    .sort((a, b) => b.price - a.price)
    .slice(0, limit);
}

export function getTransferFlows(data) {
  const flows = {};
  const topLeagues = getTopLeagues();

  data.forEach(d => {
    const from = d.Previous_club_league;
    const to = d.New_club_league;

    if (topLeagues.includes(from) && topLeagues.includes(to)) {
      const key = `${from} → ${to}`;
      flows[key] = (flows[key] || 0) + 1;
    }
  });

  return Object.entries(flows)
    .map(([flow, count]) => {
      const [source, target] = flow.split(' → ');
      return { source, target, count };
    })
    .sort((a, b) => b.count - a.count);
}

export function getNationalityStats(data) {
  const nationalities = {};

  data.forEach(d => {
    const nat = d.Nationality;
    if (nat && nat !== '' && nat !== 'nan') {
      nationalities[nat] = (nationalities[nat] || 0) + 1;
    }
  });

  return Object.entries(nationalities)
    .map(([nationality, count]) => ({ nationality, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

export function getPositionBreakdown(data) {
  const positions = {};

  data.forEach(d => {
    const pos = d.Player_position;
    if (pos && pos !== '' && pos !== 'nan') {
      positions[pos] = (positions[pos] || 0) + 1;
    }
  });

  return Object.entries(positions)
    .map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count);
}

export function getAverageTransferFeeByLeague(data) {
  const paidTransfers = filterPaidTransfers(data);
  const leagueData = {};

  paidTransfers.forEach(d => {
    const league = d.New_club_league;
    const price = parseFloat(d.Price_numeric);

    if (!leagueData[league]) {
      leagueData[league] = { sum: 0, count: 0 };
    }
    leagueData[league].sum += price;
    leagueData[league].count += 1;
  });

  return Object.entries(leagueData)
    .map(([league, data]) => ({
      league,
      average: data.sum / data.count,
      count: data.count
    }))
    .sort((a, b) => b.average - a.average);
}

export function getYearlySpending(data, league) {
  const paidTransfers = filterPaidTransfers(data);
  const filtered = league
    ? paidTransfers.filter(d => d.New_club_league === league)
    : paidTransfers;

  const yearly = {};
  filtered.forEach(d => {
    const year = d.Year;
    const price = parseFloat(d.Price_numeric);

    if (year && !isNaN(price)) {
      yearly[year] = (yearly[year] || 0) + price;
    }
  });

  return Object.entries(yearly)
    .map(([year, total]) => ({ year: parseInt(year), total }))
    .sort((a, b) => a.year - b.year);
}

// Club-specific functions
export function getAllClubs(data) {
  const clubSet = new Set();

  data.forEach(d => {
    if (d.Prev_club && d.Prev_club !== 'Free agent' && d.Prev_club !== 'Unattached') {
      clubSet.add(d.Prev_club);
    }
    if (d.New_club && d.New_club !== 'Unattached') {
      clubSet.add(d.New_club);
    }
  });

  return Array.from(clubSet).sort();
}

export function getClubTransfers(data, clubName) {
  return data.filter(d =>
    d.Prev_club === clubName || d.New_club === clubName
  );
}

export function getClubIncomingTransfers(data, clubName) {
  return data.filter(d => d.New_club === clubName);
}

export function getClubOutgoingTransfers(data, clubName) {
  return data.filter(d => d.Prev_club === clubName);
}

export function getClubTransferStats(data, clubName) {
  const incoming = getClubIncomingTransfers(data, clubName);
  const outgoing = getClubOutgoingTransfers(data, clubName);

  const incomingPaid = incoming.filter(d => d.Transfer_type === 'fee' && d.Price_numeric);
  const outgoingPaid = outgoing.filter(d => d.Transfer_type === 'fee' && d.Price_numeric);

  const totalSpent = incomingPaid.reduce((sum, d) => sum + parseFloat(d.Price_numeric || 0), 0);
  const totalReceived = outgoingPaid.reduce((sum, d) => sum + parseFloat(d.Price_numeric || 0), 0);

  return {
    totalTransfers: incoming.length + outgoing.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
    totalSpent,
    totalReceived,
    netSpend: totalSpent - totalReceived,
    incomingPaid: incomingPaid.length,
    outgoingPaid: outgoingPaid.length
  };
}

export function getClubTransfersByYear(data, clubName) {
  const transfers = getClubTransfers(data, clubName);
  const yearly = {};

  transfers.forEach(d => {
    const year = d.Year;
    if (year && year !== '') {
      if (!yearly[year]) {
        yearly[year] = { incoming: 0, outgoing: 0 };
      }
      if (d.New_club === clubName) {
        yearly[year].incoming += 1;
      }
      if (d.Prev_club === clubName) {
        yearly[year].outgoing += 1;
      }
    }
  });

  return Object.entries(yearly)
    .map(([year, counts]) => ({
      year: parseInt(year),
      incoming: counts.incoming,
      outgoing: counts.outgoing
    }))
    .sort((a, b) => a.year - b.year);
}

export function getClubTopTransfers(data, clubName, limit = 10) {
  const transfers = getClubTransfers(data, clubName);
  const paidTransfers = transfers.filter(d =>
    d.Transfer_type === 'fee' &&
    d.Price_numeric &&
    !isNaN(parseFloat(d.Price_numeric))
  );

  return paidTransfers
    .map(d => ({
      ...d,
      price: parseFloat(d.Price_numeric),
      direction: d.New_club === clubName ? 'in' : 'out'
    }))
    .sort((a, b) => b.price - a.price)
    .slice(0, limit);
}