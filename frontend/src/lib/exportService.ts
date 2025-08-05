// Export service for generating compliance reports
interface ExportOptions {
  format: string;
  type: string;
  frameworks: string[];
  includeCharts: boolean;
  includeDocuments: boolean;
  includeTasks: boolean;
  includeTeamData: boolean;
  dateRange: string;
  complianceProgress: any[];
  documents: any[];
  frameworks: any[];
}

class ExportReportService {
  async generateReport(options: ExportOptions): Promise<void> {
    const reportData = this.prepareReportData(options);
    
    switch (options.format) {
      case 'pdf':
        await this.generatePDF(reportData, options);
        break;
      case 'excel':
        await this.generateExcel(reportData, options);
        break;
      case 'csv':
        await this.generateCSV(reportData, options);
        break;
      case 'png':
        await this.generatePNG(reportData, options);
        break;
      default:
        throw new Error('Unsupported export format');
    }
  }

  private prepareReportData(options: ExportOptions) {
    const { complianceProgress, documents, frameworks } = options;
    
    // Calculate overall statistics
    const totalTasks = complianceProgress.reduce((sum, progress) => 
      sum + (progress.totalTasks || 0), 0
    );
    const completedTasks = complianceProgress.reduce((sum, progress) => 
      sum + (progress.completedTasks || 0), 0
    );
    const inProgressTasks = complianceProgress.reduce((sum, progress) => 
      sum + (progress.inProgressTasks || 0), 0
    );
    const pendingTasks = complianceProgress.reduce((sum, progress) => 
      sum + (progress.pendingTasks || 0), 0
    );

    // Document statistics
    const documentStats = documents.reduce((stats, doc) => {
      stats[doc.status] = (stats[doc.status] || 0) + 1;
      return stats;
    }, { draft: 0, review: 0, approved: 0, archived: 0 });

    // Framework-specific data
    const frameworkData = complianceProgress.map(progress => ({
      name: progress.framework?.displayName || 'Unknown',
      progress: progress.progressPercentage || 0,
      completed: progress.completedTasks || 0,
      total: progress.totalTasks || 0,
      inProgress: progress.inProgressTasks || 0,
      pending: progress.pendingTasks || 0,
    }));

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportType: options.type,
        dateRange: options.dateRange,
        frameworks: options.frameworks,
      },
      summary: {
        totalFrameworks: frameworks.length,
        totalDocuments: documents.length,
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        overallProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      },
      documentStats,
      frameworkData,
      documents: options.includeDocuments ? documents : [],
      tasks: options.includeTasks ? this.extractTasks(complianceProgress) : [],
    };
  }

  private extractTasks(complianceProgress: any[]) {
    return complianceProgress.flatMap(progress => 
      (progress.tasks || []).map((task: any) => ({
        ...task,
        framework: progress.framework?.displayName || 'Unknown',
      }))
    );
  }

  private async generatePDF(reportData: any, options: ExportOptions): Promise<void> {
    // Create HTML content for PDF
    const htmlContent = this.generateHTMLReport(reportData, options);
    
    // Use browser's print functionality to generate PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 1000);
    }
  }

  private generateHTMLReport(reportData: any, options: ExportOptions): string {
    const { metadata, summary, documentStats, frameworkData } = reportData;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Compliance Report - ${new Date().toLocaleDateString()}</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1e293b;
            margin-bottom: 10px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .summary-card h3 {
            margin: 0 0 10px 0;
            color: #475569;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .summary-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #1e293b;
          }
          .framework-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .framework-table th,
          .framework-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          .framework-table th {
            background: #f1f5f9;
            font-weight: 600;
            color: #475569;
          }
          .progress-bar {
            width: 100px;
            height: 8px;
            background: #e2e8f0;
            border-radius: 4px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: width 0.3s ease;
          }
          .section {
            margin-bottom: 40px;
          }
          .section h2 {
            color: #1e293b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Compliance Report</h1>
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>Report Type: ${options.type.replace('_', ' ').toUpperCase()}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Overall Progress</h3>
              <div class="value">${Math.round(summary.overallProgress)}%</div>
            </div>
            <div class="summary-card">
              <h3>Total Tasks</h3>
              <div class="value">${summary.totalTasks}</div>
            </div>
            <div class="summary-card">
              <h3>Completed</h3>
              <div class="value">${summary.completedTasks}</div>
            </div>
            <div class="summary-card">
              <h3>In Progress</h3>
              <div class="value">${summary.inProgressTasks}</div>
            </div>
            <div class="summary-card">
              <h3>Documents</h3>
              <div class="value">${summary.totalDocuments}</div>
            </div>
            <div class="summary-card">
              <h3>Frameworks</h3>
              <div class="value">${summary.totalFrameworks}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Framework Performance</h2>
          <table class="framework-table">
            <thead>
              <tr>
                <th>Framework</th>
                <th>Progress</th>
                <th>Completed</th>
                <th>In Progress</th>
                <th>Pending</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${frameworkData.map((framework: any) => `
                <tr>
                  <td><strong>${framework.name}</strong></td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${framework.progress}%"></div>
                    </div>
                    ${Math.round(framework.progress)}%
                  </td>
                  <td>${framework.completed}</td>
                  <td>${framework.inProgress}</td>
                  <td>${framework.pending}</td>
                  <td>${framework.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        ${options.includeDocuments ? `
        <div class="section">
          <h2>Document Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Draft</h3>
              <div class="value">${documentStats.draft || 0}</div>
            </div>
            <div class="summary-card">
              <h3>In Review</h3>
              <div class="value">${documentStats.review || 0}</div>
            </div>
            <div class="summary-card">
              <h3>Approved</h3>
              <div class="value">${documentStats.approved || 0}</div>
            </div>
            <div class="summary-card">
              <h3>Archived</h3>
              <div class="value">${documentStats.archived || 0}</div>
            </div>
          </div>
        </div>
        ` : ''}

        <div class="section">
          <p style="text-align: center; color: #64748b; font-size: 12px; margin-top: 40px;">
            This report was generated by Compliance Companion on ${new Date().toLocaleString()}
          </p>
        </div>
      </body>
      </html>
    `;
  }

  private async generateExcel(reportData: any, options: ExportOptions): Promise<void> {
    // Create CSV content that can be opened in Excel
    const csvContent = this.generateCSVContent(reportData, options);
    this.downloadFile(csvContent, `compliance-report-${Date.now()}.csv`, 'text/csv');
  }

  private async generateCSV(reportData: any, options: ExportOptions): Promise<void> {
    const csvContent = this.generateCSVContent(reportData, options);
    this.downloadFile(csvContent, `compliance-report-${Date.now()}.csv`, 'text/csv');
  }

  private generateCSVContent(reportData: any, options: ExportOptions): string {
    const { summary, frameworkData, documentStats } = reportData;
    
    let csvContent = 'Compliance Report\n\n';
    
    // Summary section
    csvContent += 'Summary\n';
    csvContent += 'Metric,Value\n';
    csvContent += `Overall Progress,${Math.round(summary.overallProgress)}%\n`;
    csvContent += `Total Tasks,${summary.totalTasks}\n`;
    csvContent += `Completed Tasks,${summary.completedTasks}\n`;
    csvContent += `In Progress Tasks,${summary.inProgressTasks}\n`;
    csvContent += `Pending Tasks,${summary.pendingTasks}\n`;
    csvContent += `Total Documents,${summary.totalDocuments}\n`;
    csvContent += `Total Frameworks,${summary.totalFrameworks}\n\n`;
    
    // Framework data
    csvContent += 'Framework Performance\n';
    csvContent += 'Framework,Progress %,Completed,In Progress,Pending,Total\n';
    frameworkData.forEach((framework: any) => {
      csvContent += `${framework.name},${Math.round(framework.progress)},${framework.completed},${framework.inProgress},${framework.pending},${framework.total}\n`;
    });
    
    if (options.includeDocuments) {
      csvContent += '\nDocument Statistics\n';
      csvContent += 'Status,Count\n';
      csvContent += `Draft,${documentStats.draft || 0}\n`;
      csvContent += `In Review,${documentStats.review || 0}\n`;
      csvContent += `Approved,${documentStats.approved || 0}\n`;
      csvContent += `Archived,${documentStats.archived || 0}\n`;
    }
    
    return csvContent;
  }

  private async generatePNG(reportData: any, options: ExportOptions): Promise<void> {
    // Create a canvas with chart visualization
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw title
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Compliance Progress Overview', canvas.width / 2, 40);
      
      // Draw progress bars for frameworks
      const { frameworkData } = reportData;
      const barHeight = 40;
      const barSpacing = 60;
      const startY = 100;
      const maxBarWidth = 400;
      
      frameworkData.forEach((framework: any, index: number) => {
        const y = startY + (index * barSpacing);
        const barWidth = (framework.progress / 100) * maxBarWidth;
        
        // Framework name
        ctx.fillStyle = '#475569';
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(framework.name, 50, y + 25);
        
        // Progress bar background
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(250, y, maxBarWidth, barHeight);
        
        // Progress bar fill
        const gradient = ctx.createLinearGradient(250, y, 250 + barWidth, y);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        ctx.fillRect(250, y, barWidth, barHeight);
        
        // Progress percentage
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(framework.progress)}%`, 250 + maxBarWidth + 30, y + 25);
      });
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `compliance-chart-${Date.now()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const exportReportService = new ExportReportService();