export type ParsedCsv = {
  header: string[];
  rows: string[][];
};

/**
 * Minimal CSV parser that supports RFC4180 style quoted fields and commas.
 * Returns the header row (first row) and remaining data rows.
 */
export function parseCsv(input: string): ParsedCsv {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i]!;

    if (inQuotes) {
      if (char === '"') {
        const next = input[i + 1];
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ',') {
      row.push(cell);
      cell = '';
      continue;
    }

    if (char === '\r') {
      // Ignore carriage returns; newlines will handle row termination.
      continue;
    }

    if (char === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (inQuotes) {
    throw new Error('Unterminated quoted field in CSV input');
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  if (rows.length === 0) {
    return { header: [], rows: [] };
  }

  const [header, ...dataRows] = rows;
  return {
    header: header.map((value) => value.trim()),
    rows: dataRows,
  };
}
