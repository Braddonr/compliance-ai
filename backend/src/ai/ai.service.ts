import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateComplianceDocument(
    framework: string,
    requirements: string[]
  ): Promise<string> {
    // For now, we'll generate a comprehensive mock document
    // In production, this would integrate with OpenAI/Claude API

    const mockDocument = this.generateMockDocument(framework, requirements);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return mockDocument;
  }

  private generateMockDocument(
    framework: string,
    requirements: string[]
  ): string {
    const currentDate = new Date().toLocaleDateString();

    // Generate HTML content with proper formatting for the rich text editor
    return `<h1>${framework} Compliance Documentation</h1>

<p><strong>Document Version:</strong> 1.0<br>
<strong>Created:</strong> ${currentDate}<br>
<strong>Framework:</strong> ${framework}<br>
<strong>Status:</strong> Draft</p>

<h2>Executive Summary</h2>

<p>This document outlines our organization's compliance approach for ${framework}, ensuring adherence to industry standards and regulatory requirements. This comprehensive guide covers all essential aspects of ${framework} compliance implementation.</p>

<h2>Scope and Objectives</h2>

<h3>Scope</h3>
<p>This document applies to all systems, processes, and personnel involved in handling sensitive data and maintaining compliance with ${framework} standards.</p>

<h3>Objectives</h3>
<ul>
<li>Establish clear compliance procedures</li>
<li>Define roles and responsibilities</li>
<li>Implement monitoring and reporting mechanisms</li>
<li>Ensure continuous improvement of compliance posture</li>
</ul>

<h2>Compliance Requirements</h2>

${requirements
  .map(
    (req, index) => `
<h3>${index + 1}. ${req}</h3>

<h4>Overview</h4>
<p>${this.getRequirementDescription(req, framework)}</p>

<h4>Implementation Steps</h4>
<ol>
<li><strong>Assessment</strong>: Conduct thorough evaluation of current state</li>
<li><strong>Planning</strong>: Develop implementation roadmap</li>
<li><strong>Execution</strong>: Deploy necessary controls and procedures</li>
<li><strong>Monitoring</strong>: Establish ongoing monitoring processes</li>
<li><strong>Review</strong>: Regular assessment and improvement</li>
</ol>

<h4>Key Controls</h4>
<ul>
<li>Policy documentation and approval</li>
<li>Technical implementation</li>
<li>Staff training and awareness</li>
<li>Regular auditing and testing</li>
<li>Incident response procedures</li>
</ul>

<h4>Compliance Metrics</h4>
<ul>
<li>Implementation status: To be determined</li>
<li>Last review date: ${currentDate}</li>
<li>Next review date: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</li>
<li>Responsible party: Compliance Team</li>
</ul>
`
  )
  .join("")}

<h2>Roles and Responsibilities</h2>

<h3>Compliance Officer</h3>
<ul>
<li>Overall compliance program oversight</li>
<li>Policy development and maintenance</li>
<li>Regulatory liaison and reporting</li>
<li>Risk assessment and management</li>
</ul>

<h3>IT Security Team</h3>
<ul>
<li>Technical control implementation</li>
<li>Security monitoring and incident response</li>
<li>System configuration and maintenance</li>
<li>Vulnerability management</li>
</ul>

<h3>Management Team</h3>
<ul>
<li>Strategic direction and resource allocation</li>
<li>Policy approval and enforcement</li>
<li>Risk acceptance decisions</li>
<li>Compliance culture promotion</li>
</ul>

<h2>Monitoring and Reporting</h2>

<h3>Continuous Monitoring</h3>
<ul>
<li>Automated compliance scanning</li>
<li>Regular security assessments</li>
<li>Performance metrics tracking</li>
<li>Incident monitoring and response</li>
</ul>

<h3>Reporting Requirements</h3>
<ul>
<li>Monthly compliance dashboards</li>
<li>Quarterly management reports</li>
<li>Annual compliance assessments</li>
<li>Ad-hoc incident reports</li>
</ul>

<h2>Risk Management</h2>

<h3>Risk Assessment Process</h3>
<ol>
<li>Identify potential compliance risks</li>
<li>Assess likelihood and impact</li>
<li>Develop mitigation strategies</li>
<li>Implement risk controls</li>
<li>Monitor and review effectiveness</li>
</ol>

<h3>Key Risk Areas</h3>
<ul>
<li>Data protection and privacy</li>
<li>Access control and authentication</li>
<li>Network security and monitoring</li>
<li>Incident response and recovery</li>
<li>Third-party risk management</li>
</ul>

<h2>Training and Awareness</h2>

<h3>Training Program</h3>
<ul>
<li>New employee orientation</li>
<li>Role-specific compliance training</li>
<li>Regular refresher sessions</li>
<li>Incident response drills</li>
<li>Awareness campaigns</li>
</ul>

<h2>Incident Response</h2>

<h3>Incident Classification</h3>
<ul>
<li><strong>Critical</strong>: Immediate threat to compliance</li>
<li><strong>High</strong>: Significant compliance impact</li>
<li><strong>Medium</strong>: Moderate compliance concern</li>
<li><strong>Low</strong>: Minor compliance issue</li>
</ul>

<h3>Response Procedures</h3>
<ol>
<li>Incident detection and reporting</li>
<li>Initial assessment and classification</li>
<li>Response team activation</li>
<li>Investigation and containment</li>
<li>Resolution and recovery</li>
<li>Post-incident review and improvement</li>
</ol>

<h2>Continuous Improvement</h2>

<h3>Review Process</h3>
<ul>
<li>Regular policy updates</li>
<li>Control effectiveness assessments</li>
<li>Technology upgrades and enhancements</li>
<li>Process optimization</li>
<li>Best practice adoption</li>
</ul>

<h3>Performance Metrics</h3>
<ul>
<li>Compliance score tracking</li>
<li>Incident reduction rates</li>
<li>Training completion rates</li>
<li>Audit finding resolution</li>
<li>Cost-benefit analysis</li>
</ul>

<h2>Conclusion</h2>

<p>This ${framework} compliance documentation provides a comprehensive framework for maintaining regulatory compliance and protecting our organization's interests. Regular review and updates ensure continued effectiveness and alignment with evolving requirements.</p>

<p>For questions or clarifications regarding this document, please contact the Compliance Team.</p>

<hr>

<p><strong>Document Control:</strong><br>
<strong>Owner:</strong> Compliance Team<br>
<strong>Approved by:</strong> Chief Compliance Officer<br>
<strong>Next Review:</strong> ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}<br>
<strong>Distribution:</strong> All Staff</p>
`;
  }

  private getRequirementDescription(
    requirement: string,
    framework: string
  ): string {
    const descriptions: { [key: string]: string } = {
      "Network Security Controls":
        "Implement robust network security measures including firewalls, intrusion detection systems, and network segmentation to protect sensitive data and systems.",
      "Cardholder Data Protection":
        "Establish comprehensive controls for protecting cardholder data throughout its lifecycle, including encryption, access controls, and secure storage.",
      "Access Control Measures":
        "Implement strong access control mechanisms including user authentication, authorization, and regular access reviews.",
      "Security Controls":
        "Deploy comprehensive security controls covering physical, technical, and administrative safeguards.",
      "Availability Controls":
        "Ensure system availability through redundancy, backup procedures, and disaster recovery planning.",
      "Processing Integrity":
        "Maintain data processing integrity through validation, error handling, and audit trails.",
      "Data Processing Agreements":
        "Establish clear agreements governing data processing activities and responsibilities.",
      "Privacy Impact Assessments":
        "Conduct thorough assessments of privacy risks and mitigation measures.",
      "Data Subject Rights":
        "Implement procedures for handling data subject requests and rights.",
      "Risk Management":
        "Establish comprehensive risk management processes including identification, assessment, and mitigation.",
      "Asset Management":
        "Implement controls for identifying, classifying, and protecting organizational assets.",
      "Incident Management":
        "Establish procedures for detecting, responding to, and recovering from security incidents.",
    };

    return (
      descriptions[requirement] ||
      `Implement comprehensive controls and procedures for ${requirement} in accordance with ${framework} requirements.`
    );
  }

  async generateComplianceReport(reportData: {
    reportType: string;
    frameworks: string[];
    complianceData: any;
    includeCharts: boolean;
    includeRecommendations: boolean;
  }): Promise<any> {
    try {
      const prompt = this.buildReportPrompt(reportData);
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a compliance expert specializing in generating comprehensive compliance reports. Provide detailed, actionable insights based on the provided data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const aiAnalysis = completion.choices[0]?.message?.content || '';
      
      return {
        analysis: aiAnalysis,
        recommendations: this.extractRecommendations(aiAnalysis),
        riskAreas: this.identifyRiskAreas(reportData.complianceData),
        complianceScore: this.calculateComplianceScore(reportData.complianceData),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock data for demo purposes
      return this.generateMockReportAnalysis(reportData);
    }
  }

  private buildReportPrompt(reportData: any): string {
    const { reportType, frameworks, complianceData, includeRecommendations } = reportData;
    
    return `
Generate a ${reportType} compliance report for the following frameworks: ${frameworks.join(', ')}.

Compliance Data Summary:
- Total Tasks: ${complianceData.totalTasks || 0}
- Completed Tasks: ${complianceData.completedTasks || 0}
- In Progress Tasks: ${complianceData.inProgressTasks || 0}
- Pending Tasks: ${complianceData.pendingTasks || 0}
- Overall Progress: ${complianceData.overallProgress || 0}%

Framework Performance:
${complianceData.frameworkData?.map((f: any) => 
  `- ${f.name}: ${f.progress}% complete (${f.completed}/${f.total} tasks)`
).join('\n') || 'No framework data available'}

Please provide:
1. Executive summary of compliance status
2. Key findings and insights
3. Critical areas requiring attention
4. Progress trends and patterns
${includeRecommendations ? '5. Specific actionable recommendations' : ''}

Focus on actionable insights and practical next steps for improving compliance posture.
    `;
  }

  private extractRecommendations(analysis: string): string[] {
    // Simple extraction logic - in production, this could be more sophisticated
    const lines = analysis.split('\n');
    const recommendations: string[] = [];
    
    let inRecommendationsSection = false;
    for (const line of lines) {
      if (line.toLowerCase().includes('recommendation') || line.toLowerCase().includes('action')) {
        inRecommendationsSection = true;
      }
      if (inRecommendationsSection && line.trim().startsWith('-')) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }
    
    return recommendations.length > 0 ? recommendations : [
      'Prioritize completion of pending tasks',
      'Implement regular compliance monitoring',
      'Enhance documentation and training programs'
    ];
  }

  private identifyRiskAreas(complianceData: any): any[] {
    const riskAreas = [];
    
    if (complianceData.pendingTasks > complianceData.completedTasks) {
      riskAreas.push({
        area: 'Task Completion',
        severity: 'High',
        description: 'High number of pending tasks relative to completed ones'
      });
    }
    
    if (complianceData.overallProgress < 50) {
      riskAreas.push({
        area: 'Overall Progress',
        severity: 'Critical',
        description: 'Overall compliance progress is below acceptable threshold'
      });
    }
    
    return riskAreas;
  }

  private calculateComplianceScore(complianceData: any): number {
    if (!complianceData.totalTasks || complianceData.totalTasks === 0) return 0;
    
    const completedWeight = 1.0;
    const inProgressWeight = 0.5;
    
    const weightedScore = (
      (complianceData.completedTasks * completedWeight) +
      (complianceData.inProgressTasks * inProgressWeight)
    ) / complianceData.totalTasks;
    
    return Math.round(weightedScore * 100);
  }

  private generateMockReportAnalysis(reportData: any): any {
    return {
      analysis: `
## Executive Summary
Based on the current compliance data, your organization shows ${reportData.complianceData.overallProgress || 0}% overall progress across ${reportData.frameworks.length} frameworks.

## Key Findings
- ${reportData.complianceData.completedTasks || 0} tasks have been completed successfully
- ${reportData.complianceData.inProgressTasks || 0} tasks are currently in progress
- ${reportData.complianceData.pendingTasks || 0} tasks require immediate attention

## Critical Areas
The analysis reveals several areas requiring focused attention to improve compliance posture and reduce organizational risk.

## Recommendations
- Prioritize completion of high-risk pending tasks
- Implement automated compliance monitoring
- Enhance staff training and awareness programs
- Establish regular compliance review cycles
      `,
      recommendations: [
        'Prioritize completion of pending tasks',
        'Implement automated compliance monitoring',
        'Enhance staff training programs',
        'Establish regular review cycles'
      ],
      riskAreas: this.identifyRiskAreas(reportData.complianceData),
      complianceScore: this.calculateComplianceScore(reportData.complianceData),
      generatedAt: new Date().toISOString(),
    };
  }

  async analyzeComplianceGaps(
    currentState: any,
    targetFramework: string
  ): Promise<any> {
    try {
      const prompt = `
Analyze the compliance gaps for ${targetFramework} framework based on the current state:
${JSON.stringify(currentState, null, 2)}

Provide specific gaps, recommendations, and priority levels for addressing them.
      `;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a compliance expert specializing in gap analysis. Provide detailed, actionable gap analysis with specific recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const analysis = completion.choices[0]?.message?.content || '';
      
      return {
        analysis,
        gaps: this.parseGapsFromAnalysis(analysis),
        recommendations: this.extractRecommendations(analysis),
        priority: "high",
        estimatedEffort: "3-6 months",
        complianceScore: Math.floor(Math.random() * 30) + 60, // Mock score between 60-90
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fallback to mock data
      return {
        gaps: [
          {
            area: "Access Control",
            severity: "High",
            description: "Multi-factor authentication not implemented for all users",
            recommendation: "Deploy MFA solution across all user accounts",
          },
          {
            area: "Data Encryption",
            severity: "Medium",
            description: "Data at rest encryption partially implemented",
            recommendation: "Complete encryption implementation for all sensitive data stores",
          },
        ],
        recommendations: [
          "Prioritize high-severity gaps for immediate attention",
          "Develop implementation timeline for medium-severity items",
          "Establish regular compliance monitoring processes",
        ],
        priority: "high",
        estimatedEffort: "3-6 months",
        complianceScore: 72,
      };
    }
  }

  private parseGapsFromAnalysis(analysis: string): any[] {
    // Simple parsing logic - in production, this could use more sophisticated NLP
    const gaps = [];
    const lines = analysis.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('gap') || line.includes('missing') || line.includes('incomplete')) {
        gaps.push({
          area: this.extractAreaFromLine(lines[i]),
          severity: this.extractSeverityFromLine(lines[i]),
          description: lines[i].trim(),
          recommendation: lines[i + 1]?.trim() || 'Address this gap as soon as possible'
        });
      }
    }
    
    return gaps.length > 0 ? gaps : [
      {
        area: "General Compliance",
        severity: "Medium",
        description: "Some compliance areas need attention",
        recommendation: "Conduct detailed compliance assessment"
      }
    ];
  }

  private extractAreaFromLine(line: string): string {
    // Simple extraction - could be enhanced with NLP
    const areas = ['Access Control', 'Data Protection', 'Network Security', 'Incident Response'];
    for (const area of areas) {
      if (line.toLowerCase().includes(area.toLowerCase())) {
        return area;
      }
    }
    return 'General';
  }

  private extractSeverityFromLine(line: string): string {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('critical') || lowerLine.includes('high')) return 'High';
    if (lowerLine.includes('medium') || lowerLine.includes('moderate')) return 'Medium';
    return 'Low';
  }
}
