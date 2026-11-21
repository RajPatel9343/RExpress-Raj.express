import { NextRequest, NextResponse } from 'next/server';
import { checkPincodeServiceability } from '@/lib/shipping/shiprocket';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pincode = searchParams.get('pincode');

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'Pincode parameter is required' },
        { status: 400 }
      );
    }

    const result = await checkPincodeServiceability(pincode);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to verify pincode' },
      { status: 500 }
    );
  }
}
