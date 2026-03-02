import { NextResponse } from "next/server";

const otpStore = new Map(); // same memory store

export async function POST(req) {
  try {
    const { phone, otp } = await req.json();

    const record = otpStore.get(phone);

    if (!record) {
      return NextResponse.json(
        { error: "OTP expired. Please resend." },
        { status: 400 }
      );
    }

    if (Date.now() > record.expires) {
      otpStore.delete(phone);
      return NextResponse.json(
        { error: "OTP expired. Please resend." },
        { status: 400 }
      );
    }

    if (record.otp.toString() !== otp) {
      return NextResponse.json(
        { error: "Invalid OTP" },
        { status: 400 }
      );
    }

    otpStore.delete(phone);

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}