import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import OpenAI from "openai";
import { SettingsService } from "../settings/settings.service";

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private settingsService: SettingsService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>("OPENAI_API_KEY"),
    });
  }

  async generateComplianceDocument(
    framework: string,
    requirements: string[],
    title?: string,
    description?: string,
    companyContext?: string
  ): Promise<string> {
    try {
      // Get company context from settings if not provided
      const contextToUse =
        companyContext || (await this.settingsService.getCompanyContext());

      // Get AI settings from database
      const aiSettings = await this.settingsService.getAISettings();
      const model = aiSettings.ai_model || "gpt-3.5-turbo";
      const temperature = aiSettings.ai_temperature || 0.3;
      const maxTokens = aiSettings.ai_max_tokens || 4000;

      const prompt = this.buildDocumentPrompt(
        framework,
        requirements,
        title,
        description,
        contextToUse
      );

      // Get system prompt and custom instructions from settings
      const systemPrompt =
        aiSettings.system_prompt ||
        `You are a compliance expert specializing in ${framework} documentation. Generate comprehensive, professional compliance documents in HTML format. Use proper HTML tags like <h1>, <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em> for formatting. Make the content detailed, actionable, and specific to the organization's context.`;
      const customInstructions = aiSettings.custom_instructions || "";

      // Combine system prompt with custom instructions if available
      const finalSystemPrompt = customInstructions
        ? `${systemPrompt}\n\nAdditional Instructions: ${customInstructions}`
        : systemPrompt;

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: finalSystemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: temperature,
      });

      const generatedContent = completion.choices[0]?.message?.content || "";

      // Ensure the content is properly formatted HTML
      return this.formatAsHTML(generatedContent, framework, title);
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fallback to enhanced mock document with company context
      const contextToUse =
        companyContext || (await this.settingsService.getCompanyContext());
      return this.generateEnhancedMockDocument(
        framework,
        requirements,
        title,
        description,
        contextToUse
      );
    }
  }

  private buildDocumentPrompt(
    framework: string,
    requirements: string[],
    title?: string,
    description?: string,
    companyContext?: string
  ): string {
    const documentTitle = title || `${framework} Compliance Documentation`;

    let prompt = `Generate a comprehensive compliance document for ${framework} framework.

Document Details:
- Title: ${documentTitle}
- Framework: ${framework}
${description ? `- Description: ${description}` : ""}

${
  companyContext
    ? `
Company Context:
${companyContext}

Please tailor the document to this specific company context, including relevant industry considerations, company size implications, and specific business needs.
`
    : ""
}

Requirements to Address:
${requirements.map((req, index) => `${index + 1}. ${req}`).join("\n")}

Please generate a detailed, professional compliance document that includes:

1. Executive Summary (2-3 paragraphs)
2. Document Purpose and Scope
3. Compliance Framework Overview
4. Detailed Requirements Implementation (for each requirement listed above):
   - Requirement description
   - Implementation approach
   - Key controls and procedures
   - Roles and responsibilities
   - Monitoring and measurement
5. Risk Management Approach
6. Training and Awareness Program
7. Incident Response Procedures
8. Continuous Improvement Process
9. Appendices (if relevant)

Make the document:
- Professional and comprehensive (aim for 3000-4000 words)
- Specific to the ${framework} framework
- Actionable with clear implementation steps
- Include specific examples and best practices
- Format in clean HTML with proper headings and structure
${companyContext ? "- Tailored to the provided company context" : ""}

Use proper HTML formatting with headings (h1, h2, h3), paragraphs (p), lists (ul, ol, li), and emphasis (strong, em) tags.`;

    return prompt;
  }

  private formatAsHTML(
    content: string,
    framework: string,
    title?: string
  ): string {
    // If content doesn't start with HTML tags, wrap it properly
    if (!content.trim().startsWith("<")) {
      const lines = content.split("\n");
      let htmlContent = "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith("#")) {
          // Convert markdown-style headers to HTML
          const level = (trimmedLine.match(/^#+/) || [""])[0].length;
          const text = trimmedLine.replace(/^#+\s*/, "");
          htmlContent += `<h${Math.min(level, 6)}>${text}</h${Math.min(level, 6)}>\n`;
        } else if (trimmedLine.startsWith("-") || trimmedLine.startsWith("*")) {
          // Convert to list items (simplified)
          const text = trimmedLine.replace(/^[-*]\s*/, "");
          htmlContent += `<li>${text}</li>\n`;
        } else {
          htmlContent += `<p>${trimmedLine}</p>\n`;
        }
      }

      return htmlContent;
    }

    return content;
  }

  private generateEnhancedMockDocument(
    framework: string,
    requirements: string[],
    title?: string,
    description?: string,
    companyContext?: string
  ): string {
    const currentDate = new Date().toLocaleDateString();
    const documentTitle = title || `${framework} Compliance Documentation`;

    return `<h1>${documentTitle}</h1>

<p><strong>Document Version:</strong> 1.0<br>
<strong>Created:</strong> ${currentDate}<br>
<strong>Framework:</strong> ${framework}<br>
<strong>Status:</strong> Draft</p>

${
  description
    ? `<h2>Document Description</h2>
<p>${description}</p>`
    : ""
}

${
  companyContext
    ? `<h2>Company Context</h2>
<p>${companyContext}</p>

<h2>Framework Application to Our Organization</h2>
<p>This ${framework} compliance documentation has been specifically tailored to our organization's context, taking into account our industry, size, and specific business requirements as outlined above.</p>`
    : ""
}

<h2>Executive Summary</h2>

<p>This comprehensive document outlines our organization's approach to ${framework} compliance, ensuring adherence to industry standards and regulatory requirements. Our compliance strategy is designed to protect sensitive data, maintain operational integrity, and demonstrate our commitment to security and privacy best practices.</p>

<p>The implementation of ${framework} controls will strengthen our security posture, reduce operational risks, and provide stakeholders with confidence in our data protection capabilities. This document serves as the foundation for our compliance program and will be regularly updated to reflect evolving requirements and organizational changes.</p>

<h2>Document Purpose and Scope</h2>

<h3>Purpose</h3>
<p>This document establishes the framework for ${framework} compliance within our organization, defining policies, procedures, and controls necessary to meet regulatory requirements and industry best practices.</p>

<h3>Scope</h3>
<p>This document applies to all systems, processes, personnel, and third-party relationships that handle, process, or store sensitive data within our organization. The scope includes:</p>
<ul>
<li>All information systems and databases</li>
<li>Network infrastructure and security controls</li>
<li>Personnel with access to sensitive information</li>
<li>Third-party service providers and vendors</li>
<li>Physical facilities and access controls</li>
</ul>

<h2>Compliance Framework Overview</h2>

<p>The ${framework} framework provides a comprehensive set of requirements designed to ensure the security and privacy of sensitive information. Our implementation approach focuses on:</p>

<ul>
<li><strong>Risk-Based Approach:</strong> Prioritizing controls based on risk assessment and business impact</li>
<li><strong>Continuous Monitoring:</strong> Implementing ongoing monitoring and assessment processes</li>
<li><strong>Documentation and Evidence:</strong> Maintaining comprehensive documentation for audit purposes</li>
<li><strong>Training and Awareness:</strong> Ensuring all personnel understand their compliance responsibilities</li>
</ul>

<h2>Detailed Requirements Implementation</h2>

${requirements
  .map(
    (requirement, index) => `
<h3>${index + 1}. ${requirement}</h3>

<h4>Requirement Overview</h4>
<p>${this.getRequirementDescription(requirement, framework)}</p>

<h4>Implementation Approach</h4>
<ol>
<li><strong>Assessment and Planning:</strong> Conduct thorough evaluation of current state and develop implementation roadmap</li>
<li><strong>Policy Development:</strong> Create or update relevant policies and procedures</li>
<li><strong>Technical Implementation:</strong> Deploy necessary technical controls and security measures</li>
<li><strong>Training and Communication:</strong> Educate staff on new requirements and procedures</li>
<li><strong>Testing and Validation:</strong> Verify effectiveness of implemented controls</li>
<li><strong>Documentation:</strong> Maintain comprehensive documentation for audit purposes</li>
</ol>

<h4>Key Controls and Procedures</h4>
<ul>
<li>Policy documentation and management approval</li>
<li>Technical control implementation and configuration</li>
<li>Access control and user management procedures</li>
<li>Monitoring and logging mechanisms</li>
<li>Incident response and escalation procedures</li>
<li>Regular review and update processes</li>
</ul>

<h4>Roles and Responsibilities</h4>
<ul>
<li><strong>Compliance Officer:</strong> Overall oversight and coordination of compliance activities</li>
<li><strong>IT Security Team:</strong> Technical implementation and ongoing monitoring</li>
<li><strong>Department Managers:</strong> Ensuring team compliance and training</li>
<li><strong>All Personnel:</strong> Following established procedures and reporting issues</li>
</ul>

<h4>Monitoring and Measurement</h4>
<ul>
<li>Implementation status tracking and reporting</li>
<li>Regular compliance assessments and audits</li>
<li>Key performance indicators and metrics</li>
<li>Continuous improvement identification and implementation</li>
</ul>
`
  )
  .join("")}

<h2>Risk Management Approach</h2>

<h3>Risk Assessment Process</h3>
<ol>
<li><strong>Risk Identification:</strong> Systematic identification of potential compliance risks</li>
<li><strong>Risk Analysis:</strong> Assessment of likelihood and potential impact</li>
<li><strong>Risk Evaluation:</strong> Determination of risk significance and priority</li>
<li><strong>Risk Treatment:</strong> Development and implementation of mitigation strategies</li>
<li><strong>Risk Monitoring:</strong> Ongoing monitoring and review of risk status</li>
</ol>

<h3>Key Risk Areas</h3>
<ul>
<li>Data protection and privacy violations</li>
<li>Unauthorized access to sensitive information</li>
<li>System vulnerabilities and security breaches</li>
<li>Third-party vendor compliance failures</li>
<li>Regulatory changes and compliance gaps</li>
</ul>

<h2>Training and Awareness Program</h2>

<h3>Training Components</h3>
<ul>
<li><strong>New Employee Orientation:</strong> Introduction to compliance requirements and responsibilities</li>
<li><strong>Role-Specific Training:</strong> Detailed training based on job functions and access levels</li>
<li><strong>Annual Refresher Training:</strong> Regular updates on policies and procedures</li>
<li><strong>Specialized Training:</strong> Advanced training for key personnel and system administrators</li>
<li><strong>Awareness Campaigns:</strong> Ongoing communication about compliance importance and updates</li>
</ul>

<h3>Training Delivery Methods</h3>
<ul>
<li>In-person training sessions and workshops</li>
<li>Online training modules and e-learning platforms</li>
<li>Documentation and reference materials</li>
<li>Regular communication and updates</li>
<li>Hands-on exercises and simulations</li>
</ul>

<h2>Incident Response Procedures</h2>

<h3>Incident Classification</h3>
<ul>
<li><strong>Critical:</strong> Immediate threat to compliance or data security</li>
<li><strong>High:</strong> Significant compliance impact requiring urgent attention</li>
<li><strong>Medium:</strong> Moderate compliance concern with defined response timeframe</li>
<li><strong>Low:</strong> Minor compliance issue with standard resolution process</li>
</ul>

<h3>Response Process</h3>
<ol>
<li><strong>Detection and Reporting:</strong> Identification and immediate reporting of incidents</li>
<li><strong>Initial Assessment:</strong> Rapid evaluation of incident scope and impact</li>
<li><strong>Response Team Activation:</strong> Mobilization of appropriate response resources</li>
<li><strong>Investigation and Analysis:</strong> Detailed investigation to determine root cause</li>
<li><strong>Containment and Mitigation:</strong> Actions to limit impact and prevent recurrence</li>
<li><strong>Recovery and Restoration:</strong> Return to normal operations and service restoration</li>
<li><strong>Post-Incident Review:</strong> Analysis of response effectiveness and improvement opportunities</li>
</ol>

<h2>Continuous Improvement Process</h2>

<h3>Improvement Activities</h3>
<ul>
<li><strong>Regular Reviews:</strong> Periodic assessment of compliance program effectiveness</li>
<li><strong>Internal Audits:</strong> Systematic evaluation of controls and procedures</li>
<li><strong>External Assessments:</strong> Third-party validation and certification activities</li>
<li><strong>Benchmarking:</strong> Comparison with industry best practices and standards</li>
<li><strong>Feedback Integration:</strong> Incorporation of stakeholder feedback and lessons learned</li>
</ul>

<h3>Performance Metrics</h3>
<ul>
<li>Compliance assessment scores and ratings</li>
<li>Incident frequency and resolution times</li>
<li>Training completion rates and effectiveness</li>
<li>Audit findings and remediation status</li>
<li>Cost-benefit analysis of compliance investments</li>
</ul>

<h2>Conclusion</h2>

<p>This ${framework} compliance documentation provides a comprehensive framework for maintaining regulatory compliance and protecting our organization's critical assets. The successful implementation of these requirements will strengthen our security posture, reduce operational risks, and demonstrate our commitment to data protection and privacy.</p>

<p>Regular review and updates of this document ensure continued effectiveness and alignment with evolving regulatory requirements and business needs. All personnel are expected to familiarize themselves with these requirements and contribute to our organization's compliance success.</p>

<hr>

<h2>Document Control</h2>

<p><strong>Document Owner:</strong> Compliance Team<br>
<strong>Approved By:</strong> Chief Compliance Officer<br>
<strong>Next Review Date:</strong> ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}<br>
<strong>Distribution:</strong> All Personnel<br>
<strong>Classification:</strong> Internal Use</p>

${companyContext ? `<p><strong>Company-Specific Customization:</strong> This document has been customized based on our organization's specific context and requirements.</p>` : ""}`;
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
      "Information Security Policy":
        "Develop and maintain comprehensive information security policies and procedures aligned with business objectives.",
      "Access Control":
        "Implement robust access control mechanisms including user authentication, authorization, and privilege management.",
      "Business Continuity":
        "Establish business continuity and disaster recovery procedures to ensure operational resilience.",
      "Confidentiality Controls":
        "Implement controls to protect the confidentiality of sensitive information and data.",
      "Privacy Controls":
        "Establish privacy protection measures and controls for personal data processing.",
      "Consent Management":
        "Implement systems and procedures for managing data subject consent and preferences.",
      "Data Breach Procedures":
        "Establish procedures for detecting, reporting, and responding to personal data breaches.",
      "Privacy by Design":
        "Implement privacy-by-design principles in system development and data processing activities.",
      "Network Monitoring":
        "Implement continuous network monitoring and intrusion detection systems.",
      "Security Testing":
        "Conduct regular security testing including vulnerability assessments and penetration testing.",
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a compliance expert specializing in generating comprehensive compliance reports. Provide detailed, actionable insights based on the provided data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 3000,
        temperature: 0.3,
      });

      const aiAnalysis = completion.choices[0]?.message?.content || "";

      return {
        analysis: aiAnalysis,
        recommendations: this.extractRecommendations(aiAnalysis),
        riskAreas: this.identifyRiskAreas(reportData.complianceData),
        complianceScore: this.calculateComplianceScore(
          reportData.complianceData
        ),
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fallback to mock data for demo purposes
      return this.generateMockReportAnalysis(reportData);
    }
  }

  private buildReportPrompt(reportData: any): string {
    const { reportType, frameworks, complianceData, includeRecommendations } =
      reportData;

    return `
Generate a ${reportType} compliance report for the following frameworks: ${frameworks.join(", ")}.

Compliance Data Summary:
- Total Tasks: ${complianceData.totalTasks || 0}
- Completed Tasks: ${complianceData.completedTasks || 0}
- In Progress Tasks: ${complianceData.inProgressTasks || 0}
- Pending Tasks: ${complianceData.pendingTasks || 0}
- Overall Progress: ${complianceData.overallProgress || 0}%

Framework Performance:
${
  complianceData.frameworkData
    ?.map(
      (f: any) =>
        `- ${f.name}: ${f.progress}% complete (${f.completed}/${f.total} tasks)`
    )
    .join("\n") || "No framework data available"
}

Please provide:
1. Executive summary of compliance status
2. Key findings and insights
3. Critical areas requiring attention
4. Progress trends and patterns
${includeRecommendations ? "5. Specific actionable recommendations" : ""}

Focus on actionable insights and practical next steps for improving compliance posture.
    `;
  }

  private extractRecommendations(analysis: string): string[] {
    // Simple extraction logic - in production, this could be more sophisticated
    const lines = analysis.split("\n");
    const recommendations: string[] = [];

    let inRecommendationsSection = false;
    for (const line of lines) {
      if (
        line.toLowerCase().includes("recommendation") ||
        line.toLowerCase().includes("action")
      ) {
        inRecommendationsSection = true;
      }
      if (inRecommendationsSection && line.trim().startsWith("-")) {
        recommendations.push(line.trim().substring(1).trim());
      }
    }

    return recommendations.length > 0
      ? recommendations
      : [
          "Prioritize completion of pending tasks",
          "Implement regular compliance monitoring",
          "Enhance documentation and training programs",
        ];
  }

  private identifyRiskAreas(complianceData: any): any[] {
    const riskAreas = [];

    if (complianceData.pendingTasks > complianceData.completedTasks) {
      riskAreas.push({
        area: "Task Completion",
        severity: "High",
        description: "High number of pending tasks relative to completed ones",
      });
    }

    if (complianceData.overallProgress < 50) {
      riskAreas.push({
        area: "Overall Progress",
        severity: "Critical",
        description:
          "Overall compliance progress is below acceptable threshold",
      });
    }

    return riskAreas;
  }

  private calculateComplianceScore(complianceData: any): number {
    if (!complianceData.totalTasks || complianceData.totalTasks === 0) return 0;

    const completedWeight = 1.0;
    const inProgressWeight = 0.5;

    const weightedScore =
      (complianceData.completedTasks * completedWeight +
        complianceData.inProgressTasks * inProgressWeight) /
      complianceData.totalTasks;

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
        "Prioritize completion of pending tasks",
        "Implement automated compliance monitoring",
        "Enhance staff training programs",
        "Establish regular review cycles",
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
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a compliance expert specializing in gap analysis. Provide detailed, actionable gap analysis with specific recommendations.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      });

      const analysis = completion.choices[0]?.message?.content || "";

      return {
        analysis,
        gaps: this.parseGapsFromAnalysis(analysis),
        recommendations: this.extractRecommendations(analysis),
        priority: "high",
        estimatedEffort: "3-6 months",
        complianceScore: Math.floor(Math.random() * 30) + 60, // Mock score between 60-90
      };
    } catch (error) {
      console.error("OpenAI API error:", error);
      // Fallback to mock data
      return {
        gaps: [
          {
            area: "Access Control",
            severity: "High",
            description:
              "Multi-factor authentication not implemented for all users",
            recommendation: "Deploy MFA solution across all user accounts",
          },
          {
            area: "Data Encryption",
            severity: "Medium",
            description: "Data at rest encryption partially implemented",
            recommendation:
              "Complete encryption implementation for all sensitive data stores",
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
    const lines = analysis.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (
        line.includes("gap") ||
        line.includes("missing") ||
        line.includes("incomplete")
      ) {
        gaps.push({
          area: this.extractAreaFromLine(lines[i]),
          severity: this.extractSeverityFromLine(lines[i]),
          description: lines[i].trim(),
          recommendation:
            lines[i + 1]?.trim() || "Address this gap as soon as possible",
        });
      }
    }

    return gaps.length > 0
      ? gaps
      : [
          {
            area: "General Compliance",
            severity: "Medium",
            description: "Some compliance areas need attention",
            recommendation: "Conduct detailed compliance assessment",
          },
        ];
  }

  private extractAreaFromLine(line: string): string {
    // Simple extraction - could be enhanced with NLP
    const areas = [
      "Access Control",
      "Data Protection",
      "Network Security",
      "Incident Response",
    ];
    for (const area of areas) {
      if (line.toLowerCase().includes(area.toLowerCase())) {
        return area;
      }
    }
    return "General";
  }

  private extractSeverityFromLine(line: string): string {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes("critical") || lowerLine.includes("high"))
      return "High";
    if (lowerLine.includes("medium") || lowerLine.includes("moderate"))
      return "Medium";
    return "Low";
  }
}
