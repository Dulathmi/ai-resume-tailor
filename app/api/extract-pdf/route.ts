import { NextResponse } from 'next/server';
// @ts-ignore
import PDFParser from 'pdf-parse-fork';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the uploaded file into a buffer that the parser can read
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await PDFParser(buffer);

    // Return the raw text extracted from the PDF
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json({ error: "Failed to extract text from PDF" }, { status: 500 });
  }
}