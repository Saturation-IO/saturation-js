'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { ActualStatus, CreateActualInput, Project } from '@saturation-api/js';
import { useSaturation } from '@/contexts/SaturationContext';
import { CsvDropzone, type CsvData } from '@/components/import/CsvDropzone';
import { ProjectPicker } from '@/components/import/ProjectPicker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';

type ActualFieldKey =
  | 'description'
  | 'amount'
  | 'date'
  | 'accountId'
  | 'ref'
  | 'payId'
  | 'status'
  | 'notes'
  | 'tags'
  | 'purchaseOrderId';

type ActualFieldConfig = {
  key: ActualFieldKey;
  label: string;
  description: string;
};

type ActualFieldMapping = Record<ActualFieldKey, number | null>;

type StoredMappingPreference = {
  columns: string[];
  mapping: ActualFieldMapping;
  importFirstRow: boolean;
  replaceExistingActuals: boolean;
};

type StoredMappingPreferences = Record<string, StoredMappingPreference>;

const STORAGE_KEY = 'actuals-import-preferences';

const ACTUAL_FIELD_CONFIG: ActualFieldConfig[] = [
  {
    key: 'description',
    label: 'Description',
    description: 'Text that will appear on the actual line item.',
  },
  {
    key: 'amount',
    label: 'Amount',
    description: 'Numeric amount in the project currency (e.g. 1234.56).',
  },
  {
    key: 'date',
    label: 'Date',
    description: 'Transaction date. Use ISO format (YYYY-MM-DD) for best results.',
  },
  {
    key: 'accountId',
    label: 'Account ID',
    description: 'Budget account identifier or code to attribute the spend.',
  },
  {
    key: 'ref',
    label: 'Reference',
    description: 'Reference or invoice number tied to this actual.',
  },
  {
    key: 'payId',
    label: 'Payment ID',
    description: 'Payment, check, or transaction identifier.',
  },
  {
    key: 'status',
    label: 'Status',
    description: 'Status string such as paid, pending, or submitted.',
  },
  {
    key: 'notes',
    label: 'Notes',
    description: 'Any freeform notes or memo text you want to store.',
  },
  {
    key: 'tags',
    label: 'Tags',
    description: 'Comma-separated tags, categories, or classes.',
  },
  {
    key: 'purchaseOrderId',
    label: 'Purchase Order ID',
    description: 'Associated purchase order identifier.',
  },
];

const FIELD_HINTS: Record<ActualFieldKey, string[]> = {
  description: ['description', 'desc', 'detail', 'details', 'memo', 'item', 'name', 'summary', 'narrative'],
  amount: ['amount', 'amt', 'total', 'net', 'value', 'cost', 'actualamount', 'gross', 'expense', 'spend'],
  date: ['date', 'txndate', 'transactiondate', 'posteddate', 'postingdate', 'entrydate', 'perioddate'],
  accountId: ['account', 'accountid', 'accountcode', 'accountnumber', 'acct', 'glcode', 'ledgercode', 'accountref', 'lineaccount'],
  ref: ['ref', 'reference', 'invoice', 'docno', 'documentnumber', 'billnumber', 'voucher', 'number', 'receipt'],
  payId: ['payment', 'paymentid', 'paymentnumber', 'checknumber', 'chequenumber', 'cheque', 'payid', 'transactionid', 'transid', 'wire'],
  status: ['status', 'state', 'stage', 'approvalstatus'],
  notes: ['note', 'notes', 'comment', 'comments', 'memo', 'remarks'],
  tags: ['tags', 'tag', 'category', 'categories', 'label', 'labels', 'dept', 'department', 'class'],
  purchaseOrderId: ['ponumber', 'purchaseorder', 'purchaseorderid', 'po'],
};

const normalizeColumnName = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');

const normalizeHeaderValue = (value: string) => value.trim().toLowerCase();

const createEmptyMapping = (): ActualFieldMapping =>
  ACTUAL_FIELD_CONFIG.reduce<ActualFieldMapping>((acc, field) => {
    acc[field.key] = null;
    return acc;
  }, {} as ActualFieldMapping);

const matchesHint = (normalized: string, hint: string) => {
  if (!hint) {
    return false;
  }
  if (normalized === hint) {
    return true;
  }
  if (hint.length <= 2) {
    return normalized.endsWith(hint);
  }
  return normalized.includes(hint);
};

const guessMapping = (columns: string[]): ActualFieldMapping => {
  const mapping = createEmptyMapping();
  const normalizedColumns = columns.map((column) => normalizeColumnName(column));
  const usedIndexes = new Set<number>();

  const assignField = (fieldKey: ActualFieldKey, hints: string[]) => {
    for (let index = 0; index < normalizedColumns.length; index++) {
      if (usedIndexes.has(index)) {
        continue;
      }
      const normalized = normalizedColumns[index];
      if (!normalized) {
        continue;
      }
      if (hints.some((hint) => matchesHint(normalized, hint))) {
        mapping[fieldKey] = index;
        usedIndexes.add(index);
        return true;
      }
    }
    return false;
  };

  ACTUAL_FIELD_CONFIG.forEach((field) => {
    const hints = FIELD_HINTS[field.key] ?? [];
    assignField(field.key, hints);
  });

  if (mapping.description === null) {
    const assigned = assignField('description', ['description', 'detail', 'memo', 'name', 'item']);
    if (!assigned && normalizedColumns.length > 0 && !usedIndexes.has(0)) {
      mapping.description = 0;
      usedIndexes.add(0);
    }
  }

  if (mapping.amount === null) {
    assignField('amount', ['amount', 'total', 'value', 'cost', 'net']);
  }

  if (mapping.date === null) {
    assignField('date', ['date', 'txndate', 'postingdate', 'period']);
  }

  return mapping;
};

const getColumnsSignature = (columns: string[]) => columns.map((value) => normalizeHeaderValue(value)).join('|');

const sanitizeStoredMapping = (input: ActualFieldMapping, columnCount: number): ActualFieldMapping => {
  const safeMapping = createEmptyMapping();
  (Object.keys(safeMapping) as ActualFieldKey[]).forEach((fieldKey) => {
    const value = input[fieldKey];
    if (typeof value === 'number' && value >= 0 && value < columnCount) {
      safeMapping[fieldKey] = value;
    }
  });
  return safeMapping;
};

const STATUS_NORMALIZATION: Record<string, ActualStatus> = {
  unpaid: 'Unpaid',
  pending: 'Pending',
  awaitingpayment: 'Pending',
  awaiting: 'Pending',
  paid: 'Paid',
  complete: 'Paid',
  completed: 'Paid',
  refund: 'Refund',
  refunded: 'Refund',
  needsreview: 'NeedsReview',
  review: 'NeedsReview',
  'needs review': 'NeedsReview',
};

const normalizeStatusValue = (value: string): ActualStatus | undefined => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const key = trimmed.toLowerCase();
  if (STATUS_NORMALIZATION[key]) {
    return STATUS_NORMALIZATION[key];
  }
  return (['Unpaid', 'Pending', 'Paid', 'Refund', 'NeedsReview'] as ActualStatus[]).find(
    (status) => status.toLowerCase() === key,
  );
};

export default function ActualImportPage() {
  const router = useRouter();
  const saturation = useSaturation();

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [csvData, setCsvData] = useState<CsvData | null>(null);
  const [mapping, setMapping] = useState<ActualFieldMapping>(() => createEmptyMapping());
  const [importFirstRow, setImportFirstRow] = useState(false);
  const [replaceExistingActuals, setReplaceExistingActuals] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  useEffect(() => {
    const apiKey = localStorage.getItem('saturation_api_key');
    if (!apiKey) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await saturation.listProjects();
        const list = res.projects || [];
        const sorted = [...list].sort((a, b) => {
          const nameA = (a.name ?? a.id ?? '').toLowerCase();
          const nameB = (b.name ?? b.id ?? '').toLowerCase();
          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });
        setProjects(sorted);
        if (sorted.length > 0) {
          setSelectedProjectId(sorted[0].id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load projects');
        console.error('Error loading projects', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [saturation]);

  const handleCsvLoaded = (data: CsvData) => {
    setCsvData(data);
    setImportFirstRow(false);
    setReplaceExistingActuals(false);
  };

  const handleClearCsv = () => {
    setCsvData(null);
    setMapping(createEmptyMapping());
    setImportFirstRow(false);
    setReplaceExistingActuals(false);
  };

  useEffect(() => {
    if (!csvData) {
      return;
    }

    const signature = getColumnsSignature(csvData.columns);
    let storedPreferences: StoredMappingPreferences | undefined;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        storedPreferences = JSON.parse(raw) as StoredMappingPreferences;
      }
    } catch (err) {
      console.warn('Failed to read stored mapping preferences', err);
    }

    const storedEntry = storedPreferences?.[signature];
    if (storedEntry) {
      const sanitized = sanitizeStoredMapping(storedEntry.mapping, csvData.columns.length);
      setMapping((prev) => {
        const mappingChanged = (Object.keys(sanitized) as ActualFieldKey[]).some(
          (field) => sanitized[field] !== prev[field],
        );
        return mappingChanged ? sanitized : prev;
      });
      setImportFirstRow((prev) => {
        const next = Boolean(storedEntry.importFirstRow);
        return prev === next ? prev : next;
      });
      setReplaceExistingActuals((prev) => {
        const next = Boolean(storedEntry.replaceExistingActuals);
        return prev === next ? prev : next;
      });
      return;
    }

    const guessed = guessMapping(csvData.columns);
    setMapping((prev) => {
      const mappingChanged = (Object.keys(guessed) as ActualFieldKey[]).some(
        (field) => guessed[field] !== prev[field],
      );
      return mappingChanged ? guessed : prev;
    });
    setImportFirstRow((prev) => (prev ? false : prev));
    setReplaceExistingActuals((prev) => (prev ? false : prev));
  }, [csvData]);

  useEffect(() => {
    if (!csvData) {
      return;
    }

    const signature = getColumnsSignature(csvData.columns);
    let storedPreferences: StoredMappingPreferences = {};
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        storedPreferences = JSON.parse(raw) as StoredMappingPreferences;
      }
    } catch (err) {
      console.warn('Failed to parse stored mapping preferences', err);
    }

    storedPreferences[signature] = {
      columns: csvData.columns,
      mapping: sanitizeStoredMapping(mapping, csvData.columns.length),
      importFirstRow,
      replaceExistingActuals,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storedPreferences));
    } catch (err) {
      console.warn('Failed to persist mapping preferences', err);
    }
  }, [csvData, mapping, importFirstRow, replaceExistingActuals]);

  const previewRows = useMemo(() => {
    if (!csvData) {
      return [];
    }
    return importFirstRow ? [csvData.columns, ...csvData.rows] : csvData.rows;
  }, [csvData, importFirstRow]);

  const rowsAvailableForImport = useMemo(() => {
    return Math.min(5, previewRows.length);
  }, [previewRows]);

  const canImport = useMemo(() => {
    return Boolean(
      selectedProjectId &&
        csvData &&
        rowsAvailableForImport > 0 &&
        !isImporting,
    );
  }, [csvData, isImporting, rowsAvailableForImport, selectedProjectId]);

  const importDisabledReason = useMemo(() => {
    if (!csvData) {
      return 'Upload a CSV file before importing.';
    }
    if (!selectedProjectId) {
      return 'Select a project to choose an import destination.';
    }
    if (rowsAvailableForImport === 0) {
      return 'The uploaded CSV does not contain any data rows.';
    }
    return undefined;
  }, [csvData, rowsAvailableForImport, selectedProjectId]);

  const mappingPreview = useMemo(() => {
    if (previewRows.length === 0) {
      return null;
    }
    const firstRow = previewRows[0] ?? [];
    const preview: Partial<Record<ActualFieldKey, string>> = {};

    ACTUAL_FIELD_CONFIG.forEach((field) => {
      const columnIndex = mapping[field.key];
      if (columnIndex === null || columnIndex === undefined) {
        return;
      }
      preview[field.key] = firstRow[columnIndex] ?? '';
    });

    return preview;
  }, [mapping, previewRows]);

  const handleImportActuals = useCallback(async () => {
    if (!csvData || !selectedProjectId) {
      toast.error('Select a project and upload a CSV before importing.');
      return;
    }

    const rows = previewRows.slice(0, 5);
    if (rows.length === 0) {
      toast.error('No rows available to import.');
      return;
    }

    const getCellValue = (row: string[], field: ActualFieldKey) => {
      const index = mapping[field];
      if (index === null || index === undefined) {
        return '';
      }
      return row[index] ?? '';
    };

    const parseAmount = (value: string) => {
      const sanitized = value.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
      if (!sanitized) {
        return Number.NaN;
      }
      return Number.parseFloat(sanitized);
    };

    const toIsoDate = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }

      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }

      const parsed = new Date(trimmed);
      if (Number.isNaN(parsed.getTime())) {
        return trimmed;
      }
      return parsed.toISOString().slice(0, 10);
    };

    const actuals: CreateActualInput[] = [];
    rows.forEach((row, rowIndex) => {
      const description = getCellValue(row, 'description').trim();
      const amountRaw = getCellValue(row, 'amount');
      const amount = parseAmount(amountRaw);
      const date = toIsoDate(getCellValue(row, 'date'));

      if (!description || !date || !Number.isFinite(amount)) {
        console.warn('Skipping row due to missing required fields', { rowIndex, description, amountRaw, date });
        return;
      }

      const actual: CreateActualInput = {
        description,
        amount,
        date,
      };

      const accountRaw = getCellValue(row, 'accountId').trim();
      if (accountRaw) {
        const accountId = accountRaw.split(/[;,]/)[0]?.trim();
        if (accountId) {
          actual.accountId = accountId;
        }
      }

      const referenceNumber = getCellValue(row, 'ref').trim();
      if (referenceNumber) {
        actual.number = referenceNumber;
      }

      const payId = getCellValue(row, 'payId').trim();
      if (payId) {
        actual.payId = payId;
      }

      const status = getCellValue(row, 'status').trim();
      if (status) {
        const normalized = normalizeStatusValue(status);
        if (normalized) {
          actual.status = normalized;
        }
      }

      const notes = getCellValue(row, 'notes').trim();
      if (notes) {
        actual.notes = notes;
      }

      const tagsRaw = getCellValue(row, 'tags').trim();
      if (tagsRaw) {
        const tags = tagsRaw
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean);
        if (tags.length > 0) {
          actual.tags = tags;
        }
      }
      actuals.push(actual);
    });

    if (actuals.length === 0) {
      toast.error('No valid rows found in the first five rows of the CSV.');
      return;
    }

    setIsImporting(true);

    try {
      const response = await saturation.batchCreateActuals(selectedProjectId, {
        replace: replaceExistingActuals,
        actuals,
      });

      const summary = response?.summary;
      if (summary) {
        toast.success(
          `Imported ${summary.inserted} of ${summary.received} actual${summary.received === 1 ? '' : 's'} (processed ${summary.processed}, errors ${summary.errors}).`,
        );
      } else {
        toast.success(`Imported ${actuals.length} actual${actuals.length === 1 ? '' : 's'} (first 5 rows).`);
      }
    } catch (error) {
      console.error('Failed to import actuals', error);
      toast.error(error instanceof Error ? error.message : 'Failed to import actuals.');
    } finally {
      setIsImporting(false);
    }
  }, [
    csvData,
    mapping,
    previewRows,
    saturation,
    replaceExistingActuals,
    selectedProjectId,
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/favicon.svg"
                alt="Saturation Logo"
                width={40}
                height={40}
                className="flex-shrink-0"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Actuals Import</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a project and map your CSV columns to actual properties.
                </p>
              </div>
            </div>
            <ProjectPicker
              projects={projects}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              loading={loading}
              error={error}
              className="max-w-full sm:max-w-xl"
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Upload Actuals CSV</CardTitle>
              <CardDescription>
                {selectedProject ? (
                  <span>
                    Preparing import for project{' '}
                    <span className="font-medium text-foreground">
                      {selectedProject.name}
                    </span>
                  </span>
                ) : (
                  'Select a project to enable the upload dropzone.'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <CsvDropzone onLoaded={handleCsvLoaded} disabled={!selectedProjectId} />
              {csvData && (
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{csvData.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {csvData.rows.length.toLocaleString()} rows ·{' '}
                        {csvData.columns.length} columns
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleClearCsv}>
                      Replace file
                    </Button>
                  </div>

                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Detected columns
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {csvData.columns.map((column) => (
                        <span
                          key={column || 'unnamed'}
                          className="rounded-full border px-3 py-1 text-xs text-foreground"
                        >
                          {column || '(unnamed)'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {previewRows.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Preview
                      </p>
                      <div className="mt-2 max-h-[420px] overflow-auto rounded-md border">
                        <table className="min-w-full divide-y divide-border text-sm">
                          <thead className="sticky top-0 bg-muted">
                            <tr>
                              {csvData.columns.map((column) => (
                                <th key={column} className="px-3 py-2 text-left font-medium text-foreground">
                                  {column}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border bg-background">
                            {previewRows.map((row, rowIndex) => (
                              <tr key={`preview-row-${rowIndex}`}>
                                {csvData.columns.map((_, columnIndex) => (
                                  <td
                                    key={`cell-${rowIndex}-${columnIndex}`}
                                    className="px-3 py-2 text-muted-foreground"
                                  >
                                    {row[columnIndex] ?? ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {csvData && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Column Mapping</CardTitle>
                <CardDescription>
                  Map the detected columns to the Actual fields required by Saturation.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {ACTUAL_FIELD_CONFIG.map((field) => (
                    <div key={field.key} className="space-y-2">
                      <Label htmlFor={`mapping-${field.key}`} className="flex items-center gap-2 text-sm font-medium">
                        {field.label}
                      </Label>
                      <select
                        id={`mapping-${field.key}`}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={
                          mapping[field.key] === null || mapping[field.key] === undefined
                            ? ''
                            : String(mapping[field.key])
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          setMapping((current) => ({
                            ...current,
                            [field.key]: value === '' ? null : Number.parseInt(value, 10),
                          }));
                        }}
                      >
                        <option value="">Not mapped</option>
                        {csvData.columns.map((column, index) => (
                          <option key={`${column || 'column'}-${index}`} value={index}>
                            {column ? column : `(Column ${index + 1})`}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">{field.description}</p>
                    </div>
                  ))}
                </div>
                {mappingPreview && Object.keys(mappingPreview).length > 0 && (
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sample actual (first CSV row)
                    </p>
                    <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                      {ACTUAL_FIELD_CONFIG.filter(
                        (field) => mappingPreview[field.key] !== undefined,
                      ).map((field) => (
                        <div key={`preview-${field.key}`}>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            {field.label}
                          </dt>
                          <dd className="text-sm text-foreground">
                            {mappingPreview[field.key] !== ''
                              ? mappingPreview[field.key]
                              : '—'}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        id="import-first-row"
                        type="checkbox"
                        className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                        checked={importFirstRow}
                        onChange={(event) => setImportFirstRow(event.target.checked)}
                      />
                      <Label htmlFor="import-first-row" className="text-sm font-medium">
                        Import first CSV row
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep unchecked when the first row is a header. Turn on if your file does not include column
                      headings.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        id="replace-existing-actuals"
                        type="checkbox"
                        className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200"
                        checked={replaceExistingActuals}
                        onChange={(event) => setReplaceExistingActuals(event.target.checked)}
                      />
                      <Label htmlFor="replace-existing-actuals" className="text-sm font-medium">
                        Replace existing actuals
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Leave unchecked to append new actuals. Turn on to remove the project&apos;s current actuals
                      before importing.
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="text-xs text-muted-foreground">
                      Imports the first {rowsAvailableForImport || 0} row{rowsAvailableForImport === 1 ? '' : 's'} for testing.
                    </div>
                    <Button type="button" onClick={handleImportActuals} disabled={!canImport}>
                      {isImporting
                        ? 'Importing…'
                        : `Import ${rowsAvailableForImport || 0} Actual${rowsAvailableForImport === 1 ? '' : 's'}`}
                    </Button>
                  </div>
                  {importDisabledReason && !isImporting && (
                    <p className="mt-2 text-xs text-amber-600">{importDisabledReason}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
