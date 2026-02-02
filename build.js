import { promises as fs } from 'fs';
import * as theme from './jsonresume-theme-custom/index.js';
import puppeteer from 'puppeteer';
import { render } from 'resumed';

async function buildResume(resumePath, outputHtml, outputPdf) {
  console.log(`Building ${resumePath}...`);
  
  const resume = JSON.parse(await fs.readFile(resumePath, 'utf-8'));
  const html = await render(resume, theme);
  
  // Write HTML
  await fs.writeFile(outputHtml, html, 'utf-8');
  console.log(`✓ Generated ${outputHtml}`);
  
  // Generate PDF
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ 
    path: outputPdf, 
    format: 'a4', 
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  
  await browser.close();
  console.log(`✓ Generated ${outputPdf}`);
}

async function main() {
  // Build English version
  await buildResume('resume.json', 'index.html', 'resume.pdf');
  
  // Build Japanese version
  await buildResume('jp/resume.json', 'jp.html', 'jp.pdf');
  
  console.log('✓ All resumes generated successfully!');
}

main().catch(console.error);
