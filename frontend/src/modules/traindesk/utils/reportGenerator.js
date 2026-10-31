/**
 * Generates and downloads a CSV report for TrainDesk schedules and attendance
 */
export function downloadCsvReport({
  trainerName,
  periodLabel,
  sessions = [],
  brief = null
}) {
  const headers = [
    'Date',
    'Trainer',
    'Session Topic',
    'Start Time',
    'End Time',
    'Room',
    'Capacity',
    'Confirmed Bookings',
    'Waitlisted',
    'Utilization (%)',
    'Has Clash'
  ];

  const rows = sessions.map((s) => {
    const conf = s.confirmedCount ?? (s.bookings?.filter(b => b.status === 'CONFIRMED').length || 0);
    const wait = s.waitlistedCount ?? (s.bookings?.filter(b => b.status === 'WAITLISTED').length || 0);
    const cap = s.capacity || 1;
    const util = Math.round((conf / cap) * 100);

    return [
      `"${s.date || periodLabel}"`,
      `"${trainerName}"`,
      `"${(s.topic || '').replace(/"/g, '""')}"`,
      `"${s.startTime || ''}"`,
      `"${s.endTime || ''}"`,
      `"${s.room || ''}"`,
      cap,
      conf,
      wait,
      `${util}%`,
      s.hasClash ? 'YES' : 'NO'
    ].join(',');
  });

  const summaryRows = brief ? [
    `# TrainDesk Schedule Report - ${trainerName} (${periodLabel})`,
    `# Generated at: ${new Date().toLocaleString()}`,
    `# Heading: "${(brief.statementHeading || '').replace(/"/g, '""')}"`,
    ''
  ] : [];

  const csvContent = '\uFEFF' + [...summaryRows, headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeTrainer = trainerName.replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `TrainDesk_Report_${safeTrainer}_${periodLabel.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Opens a clean printable PDF view of the report
 */
export function printPdfReport({
  trainerName,
  trainerSpecialization,
  periodLabel,
  sessions = [],
  brief = null
}) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    alert('Please allow popups to generate and print the report.');
    return;
  }

  const sessionRows = sessions.map((s) => {
    const conf = s.confirmedCount ?? (s.bookings?.filter(b => b.status === 'CONFIRMED').length || 0);
    const cap = s.capacity || 1;
    const util = Math.round((conf / cap) * 100);

    return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 8px; font-weight: 500;">${s.startTime} - ${s.endTime}</td>
        <td style="padding: 10px 8px;">
          <strong>${s.topic}</strong>
          ${s.hasClash ? '<span style="color: #b91c1c; font-size: 11px; margin-left: 6px; font-weight: bold;">[CLASH]</span>' : ''}
        </td>
        <td style="padding: 10px 8px;">${s.room}</td>
        <td style="padding: 10px 8px; text-align: center;">${conf} / ${cap} (${util}%)</td>
        <td style="padding: 10px 8px; text-align: center;">
          <span style="background: ${conf >= cap ? '#fee2e2' : '#dcfce7'}; color: ${conf >= cap ? '#991b1b' : '#166534'}; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600;">
            ${conf >= cap ? 'Full' : 'Available'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const statsHtml = brief?.stats ? `
    <div style="display: flex; gap: 16px; margin: 20px 0;">
      ${brief.stats.map(st => `
        <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 22px; font-weight: bold; color: ${st.variant === 'bad' ? '#b91c1c' : '#334155'};">${st.value}</div>
          <div style="font-size: 12px; color: #64748b; text-transform: uppercase;">${st.label}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>TrainDesk Report - ${trainerName} (${periodLabel})</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            padding: 30px;
            margin: 0;
            line-height: 1.5;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: flex-end; gap: 10px;">
          <button onclick="window.print()" style="background: #4F7A7A; color: white; border: none; padding: 8px 18px; border-radius: 6px; cursor: pointer; font-weight: bold;">
            🖨️ Print / Save as PDF
          </button>
        </div>

        <div style="border-bottom: 2px solid #4F7A7A; padding-bottom: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h1 style="margin: 0; color: #4F7A7A; font-size: 24px;">TrainDesk · Training & Attendance Report</h1>
            <span style="font-size: 13px; color: #64748b;">Generated on: ${new Date().toLocaleString()}</span>
          </div>
          <div style="margin-top: 10px; font-size: 14px;">
            <strong>Trainer:</strong> ${trainerName} ${trainerSpecialization ? `(${trainerSpecialization})` : ''} &nbsp;|&nbsp;
            <strong>Report Scope:</strong> ${periodLabel}
          </div>
        </div>

        ${brief?.statementHeading ? `<p style="font-size: 17px; font-weight: 500; color: #0f172a; margin-bottom: 10px;">${brief.statementHeading}</p>` : ''}

        ${statsHtml}

        <h3 style="font-size: 16px; margin-top: 24px; margin-bottom: 12px; color: #334155;">Scheduled Sessions & Capacity</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <thead>
            <tr style="background: #f1f5f9; text-align: left; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 10px 8px;">Time</th>
              <th style="padding: 10px 8px;">Topic</th>
              <th style="padding: 10px 8px;">Room</th>
              <th style="padding: 10px 8px; text-align: center;">Booked / Cap</th>
              <th style="padding: 10px 8px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${sessionRows.length > 0 ? sessionRows : '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #64748b;">No training sessions scheduled for this period.</td></tr>'}
          </tbody>
        </table>

        <div style="margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center;">
          TrainDesk Operations Management · Unified Interview Platform
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

