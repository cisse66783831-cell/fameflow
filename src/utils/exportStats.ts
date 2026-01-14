import { saveAs } from 'file-saver';

interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

// Format date for filenames
const getFormattedDate = () => {
  return new Date().toISOString().split('T')[0];
};

// Escape CSV values
const escapeCSVValue = (value: string | number | boolean | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, newline or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Export data to CSV
export const exportToCSV = (data: ExportableData[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(escapeCSVValue).join(',');
  
  const rows = data.map(row => 
    headers.map(header => escapeCSVValue(row[header])).join(',')
  );
  
  const csv = [headerRow, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}_${getFormattedDate()}.csv`);
};

// Export data to Excel (TSV format that Excel can open)
export const exportToExcel = (data: ExportableData[], filename: string) => {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.join('\t');
  
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      return String(value).replace(/\t/g, ' ').replace(/\n/g, ' ');
    }).join('\t')
  );
  
  const tsv = [headerRow, ...rows].join('\n');
  
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + tsv], { type: 'application/vnd.ms-excel;charset=utf-8' });
  saveAs(blob, `${filename}_${getFormattedDate()}.xls`);
};

// Prepare download stats for export
export const prepareDownloadStatsForExport = (stats: {
  id: string;
  campaign_id: string | null;
  event_id: string | null;
  media_type: string;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  referrer?: string | null;
  created_at: string | null;
}[], campaignTitles: Record<string, string>) => {
  return stats.map(stat => ({
    'Date': stat.created_at ? new Date(stat.created_at).toLocaleString('fr-FR') : '',
    'Campagne': stat.campaign_id ? campaignTitles[stat.campaign_id] || stat.campaign_id : '',
    'Type de média': stat.media_type,
    'Appareil': stat.device_type || 'Unknown',
    'Navigateur': stat.browser || 'Unknown',
    'OS': stat.os || 'Unknown',
    'Pays': stat.country || 'Unknown',
    'Ville': stat.city || 'Unknown',
    'Source': stat.referrer || 'Direct',
  }));
};

// Prepare summary stats for export
export const prepareSummaryForExport = (summary: {
  totalDownloads: number;
  uniqueVisitors: number;
  dailyAverage: number;
  conversionRate: number;
  avgTimeOnPage: number;
  topCountry: string;
  topBrowser: string;
  topDevice: string;
}) => {
  return [{
    'Métrique': 'Total Téléchargements',
    'Valeur': summary.totalDownloads,
  }, {
    'Métrique': 'Visiteurs Uniques',
    'Valeur': summary.uniqueVisitors,
  }, {
    'Métrique': 'Moyenne Journalière',
    'Valeur': summary.dailyAverage,
  }, {
    'Métrique': 'Taux de Conversion (%)',
    'Valeur': summary.conversionRate,
  }, {
    'Métrique': 'Temps Moyen sur Page (s)',
    'Valeur': summary.avgTimeOnPage,
  }, {
    'Métrique': 'Pays #1',
    'Valeur': summary.topCountry,
  }, {
    'Métrique': 'Navigateur #1',
    'Valeur': summary.topBrowser,
  }, {
    'Métrique': 'Appareil #1',
    'Valeur': summary.topDevice,
  }];
};