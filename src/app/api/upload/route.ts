import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      // Check for json payload with base64
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const json = await req.json();
        if (json.image && json.image.startsWith('data:image')) {
          const matches = json.image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
          if (matches) {
            const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await writeFile(path.join(uploadDir, fileName), buffer);
            return NextResponse.json({ success: true, url: `/uploads/${fileName}` });
          }
        }
      }
      return NextResponse.json({ success: false, error: 'No valid file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size must be under 5MB' }, { status: 400 });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await writeFile(path.join(uploadDir, fileName), buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${fileName}`
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
