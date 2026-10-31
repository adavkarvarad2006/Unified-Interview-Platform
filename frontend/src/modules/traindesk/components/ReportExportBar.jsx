import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter } from 'lucide-react';
import { downloadCsvReport, printPdfReport } from '../utils/reportGenerator';

export default function ReportExportBar({
  trainers = [],
  selectedTrainerId,
  onSelectTrainer,
  selectedDayOffset = 0,
  dashboardData,
  heatmapData
}) {
  const [scope, setScope] = useState('day'); // 'day' | 'week' | 'month'
  const [format, setFormat] = useState('pdf'); // 'pdf' | 'csv'

  const currentTrainer = trainers.find(
    (t) => t.trainerId === selectedTrainerId || t._id === selectedTrainerId
  ) || { name: 'Trainer' };

  const handleExport = () => {
    let sessions = dashboardData?.sessions || [];
    let periodLabel = '';

    if (scope === 'day') {
      const dateLabel = dashboardData?.selectedDate
        ? new Date(dashboardData.selectedDate).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Selected Day';
      periodLabel = `Daily Report (${dateLabel})`;
    } else if (scope === 'week') {
      periodLabel = 'Weekly 7-Day Overview';
    } else if (scope === 'month') {
      const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      periodLabel = `Monthly Report (${monthName})`;
    }

    if (format === 'csv') {
      downloadCsvReport({
        trainerName: currentTrainer.name,
        periodLabel,
        sessions,
        brief: dashboardData?.brief
      });
    } else {
      printPdfReport({
        trainerName: currentTrainer.name,
        trainerSpecialization: currentTrainer.specialization,
        periodLabel,
        sessions,
        brief: dashboardData?.brief
      });
    }
  };

  return (
    <div className="report-bar">
      <div className="report-bar-left">
        <span className="report-bar-title">
          <FileText size={16} color="var(--td-accent)" />
          Schedule & Attendance Reports
        </span>
      </div>

      <div className="report-controls">
        {/* Trainer select option */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={13} color="var(--td-muted)" />
          <select
            className="report-select"
            value={selectedTrainerId}
            onChange={(e) => onSelectTrainer(e.target.value)}
            title="Choose Trainer for Report"
          >
            {trainers.map((t) => (
              <option key={t.trainerId || t._id} value={t.trainerId || t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        {/* Time Period select: Day / Week / Month */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={13} color="var(--td-muted)" />
          <select
            className="report-select"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            title="Report Scope"
          >
            <option value="day">Day (Selected Date)</option>
            <option value="week">Week (7-Day Overview)</option>
            <option value="month">Month (Full Month)</option>
          </select>
        </div>

        {/* File Format select */}
        <select
          className="report-select"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          title="Export Format"
        >
          <option value="pdf">PDF Report</option>
          <option value="csv">CSV Spreadsheet</option>
        </select>

        {/* Download action button */}
        <button
          type="button"
          className="report-btn"
          onClick={handleExport}
          title={`Download ${scope} report as ${format.toUpperCase()}`}
        >
          <Download size={14} />
          <span>Download Report</span>
        </button>
      </div>
    </div>
  );
}

