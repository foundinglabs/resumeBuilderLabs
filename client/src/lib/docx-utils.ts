import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType } from 'docx';
import { saveAs } from 'file-saver';
import { ResumeData } from '@/pages/builder';

export async function generateDOCX(resumeData: ResumeData, fileName: string = 'Resume') {
  try {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header with name
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`,
                  bold: true,
                  size: 32,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 200,
              },
            }),

            // Contact information
            new Paragraph({
              children: [
                new TextRun({
                  text: `${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}`,
                  size: 22,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: {
                after: 400,
              },
            }),

            // Professional Summary
            ...(resumeData.summary ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "PROFESSIONAL SUMMARY",
                    bold: true,
                    size: 24,
                    underline: {
                      type: UnderlineType.SINGLE,
                    },
                  }),
                ],
                spacing: {
                  before: 200,
                  after: 200,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeData.summary,
                    size: 22,
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
            ] : []),

            // Work Experience
            ...(resumeData.experience.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "WORK EXPERIENCE",
                    bold: true,
                    size: 24,
                    underline: {
                      type: UnderlineType.SINGLE,
                    },
                  }),
                ],
                spacing: {
                  before: 200,
                  after: 200,
                },
              }),
              ...resumeData.experience.flatMap(exp => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.title,
                      bold: true,
                      size: 22,
                    }),
                    new TextRun({
                      text: ` | ${exp.company}`,
                      size: 22,
                    }),
                  ],
                  spacing: {
                    before: 200,
                    after: 100,
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${exp.startDate} - ${exp.endDate}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                  spacing: {
                    after: 100,
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: exp.description,
                      size: 22,
                    }),
                  ],
                  spacing: {
                    after: 300,
                  },
                }),
              ]),
            ] : []),

            // Education
            ...(resumeData.education.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "EDUCATION",
                    bold: true,
                    size: 24,
                    underline: {
                      type: UnderlineType.SINGLE,
                    },
                  }),
                ],
                spacing: {
                  before: 200,
                  after: 200,
                },
              }),
              ...resumeData.education.flatMap(edu => [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: edu.degree,
                      bold: true,
                      size: 22,
                    }),
                    new TextRun({
                      text: ` | ${edu.school}`,
                      size: 22,
                    }),
                  ],
                  spacing: {
                    before: 200,
                    after: 100,
                  },
                }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Class of ${edu.graduationYear}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`,
                      italics: true,
                      size: 20,
                    }),
                  ],
                  spacing: {
                    after: 300,
                  },
                }),
              ]),
            ] : []),

            // Skills
            ...(resumeData.skills.length > 0 ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "SKILLS",
                    bold: true,
                    size: 24,
                    underline: {
                      type: UnderlineType.SINGLE,
                    },
                  }),
                ],
                spacing: {
                  before: 200,
                  after: 200,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: resumeData.skills.join(' • '),
                    size: 22,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              }),
            ] : []),
          ],
        },
      ],
    });

    // Generate the document
    const blob = await Packer.toBlob(doc);
    
    // Save the file
    saveAs(blob, `${fileName}.docx`);
    
    console.log('DOCX generated successfully');
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX file');
  }
}