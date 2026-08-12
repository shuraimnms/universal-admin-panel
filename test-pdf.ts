import fs from 'fs';
import path from 'path';
import { runDocxPipeline } from './src/lib/docxPipeline';

async function test() {
  console.log("Starting test...");
  const filePath = 'C:\\projects\\websites\\gaddam shirisha research paper 1.docx';
  const outPath = 'C:\\projects\\websites\\test_output.pdf';
  const outDocxPath = 'C:\\projects\\websites\\test_output.docx';

  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // We will simulate the same data structure that the frontend sends
    console.log("Running pipeline...");
    const result = await runDocxPipeline({
      fileBuffer,
      title: "EFFECTIVENESS OF SKILLS DEVELOPMENT AND VOCATIONAL EDUCATION", // dummy title
      authors: [
        { name: "Kavita", affiliation: "Department of Education; Swami Vivekanand Subharti University, Meerut", email: "Kavita.061@gmail.com" },
        { name: "Dr. Mumtaz Sheikh", affiliation: "Department of Education; Swami Vivekanand Subharti University, Meerut", email: "Y2kmumtaz@gmail.com" }
      ],
      category: "Education",
      journalName: "Global Insights",
      issn: "XXXX-XXXX",
      website: "https://globalinsights.com",
      issue: {
        volume: "32",
        issueNumber: "1",
        year: 2026,
        publishDate: new Date("2026-07-01").toISOString()
      }
    });

    console.log("Pipeline complete.");
    
    if (result.pdfBuffer) {
      fs.writeFileSync(outPath, result.pdfBuffer);
      console.log(`PDF saved to: ${outPath}`);
    } else {
      console.log("No PDF buffer returned.");
    }

    if (result.docxBuffer) {
      fs.writeFileSync(outDocxPath, result.docxBuffer);
      console.log(`DOCX saved to: ${outDocxPath}`);
    } else {
      console.log("No DOCX buffer returned.");
    }
    
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
