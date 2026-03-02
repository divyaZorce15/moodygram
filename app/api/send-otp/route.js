import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { phone } = await req.json();

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
          to: phone.replace("+", ""),
          type: "template",
          template: {
            name: "hello_world",   // must exist in Meta dashboard
            language: {
              code: "en_US",
            },
          },
        }),
      }
    );

    const metaData = await response.json();

    console.log("META RESPONSE:", metaData);

    if (!response.ok) {
      return NextResponse.json(metaData, { status: response.status });
    }

    return NextResponse.json(metaData);

  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}