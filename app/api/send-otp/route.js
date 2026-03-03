import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phone } = await req.json();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const formattedPhone = phone.replace(/\D/g, "");

    const response = await fetch(
      `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: {
            body: `Your Moodygram OTP is: ${otp}`,
          },
        }),
      }
    );

    const data = await response.json();

    console.log("META FULL RESPONSE:", data);

    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}