// Waymark send-email edge function — Resend integration
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SendEmailRequest {
  to: string;
  subject: string;
  type: string;
  body?: string;
  bookingId?: string;
  listingTitle?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  totalPrice?: number;
  recipientName?: string;
}

function buildEmailHtml(params: SendEmailRequest): string {
  const {
    type,
    listingTitle = '',
    checkIn = '',
    checkOut = '',
    guests = 1,
    totalPrice = 0,
    recipientName = 'Traveler',
    subject,
  } = params;

  if (type === 'booking_confirmation') {
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FAF7F2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1B3A5C 0%, #2D5A87 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0; font-weight: 800; letter-spacing: -0.5px;">Waymark</h1>
          <p style="color: rgba(255,255,255,0.7); font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</p>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="color: #1B3A5C; font-size: 18px; margin: 0 0 4px;">Your trip is booked, ${recipientName}!</h2>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">We've reserved your spot. Here are your trip details:</p>
          <div style="background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #E5E7EB;">
            <p style="color: #6B7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 4px;">Destination</p>
            <p style="color: #1B3A5C; font-size: 16px; font-weight: 700; margin: 0 0 16px;">${listingTitle}</p>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">Check in</span>
              <span style="color: #1B3A5C; font-size: 13px; font-weight: 600;">${checkIn}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">Check out</span>
              <span style="color: #1B3A5C; font-size: 13px; font-weight: 600;">${checkOut}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #F3F4F6;">
              <span style="color: #6B7280; font-size: 13px;">Guests</span>
              <span style="color: #1B3A5C; font-size: 13px; font-weight: 600;">${guests}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 12px 0 0;">
              <span style="color: #1B3A5C; font-size: 15px; font-weight: 700;">Total Paid</span>
              <span style="color: #D4934A; font-size: 15px; font-weight: 800;">$${totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <p style="color: #6B7280; font-size: 12px; margin: 24px 0 0; text-align: center;">Need help? Reply to this email or visit our Help Center.</p>
        </div>
      </div>
    `;
  }

  if (type === 'save_notification') {
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FAF7F2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1B3A5C 0%, #2D5A87 100%); padding: 28px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 22px; margin: 0; font-weight: 800;">Waymark</h1>
        </div>
        <div style="padding: 28px 24px;">
          <h2 style="color: #1B3A5C; font-size: 18px; margin: 0 0 8px;">You saved a place</h2>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 16px;">${recipientName}, you saved <strong style="color: #1B3A5C;">${listingTitle}</strong> to your wishlist. Book it before someone else does!</p>
          <a href="#" style="display: inline-block; background: #1B3A5C; color: #fff; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-size: 14px; font-weight: 600;">View listing</a>
        </div>
      </div>
    `;
  }

  if (type === 'admin_alert') {
    return `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FAF7F2; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #A02C2C 0%, #C0392B 100%); padding: 28px 24px; text-align: center;">
          <h1 style="color: #fff; font-size: 20px; margin: 0; font-weight: 800;">Admin Alert</h1>
        </div>
        <div style="padding: 28px 24px;">
          <p style="color: #6B7280; font-size: 14px; margin: 0;">${subject}</p>
        </div>
      </div>
    `;
  }

  return params.body || `<p>${subject}</p>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const params: SendEmailRequest = await req.json();

    if (!params.to || !params.subject) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "Waymark <bookings@waymark.sbs>";

    const html = buildEmailHtml(params);

    let emailSent = false;
    let sendError: string | null = null;

    if (RESEND_API_KEY) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [params.to],
            subject: params.subject,
            html,
          }),
        });

        if (res.ok) {
          emailSent = true;
        } else {
          const errData = await res.text();
          sendError = errData;
        }
      } catch (err) {
        sendError = String(err);
      }
    } else {
      emailSent = true;
    }

    // Log to email_logs table
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("email_logs").insert({
        recipient: params.to,
        subject: params.subject,
        type: params.type || "booking_confirmation",
        body: html,
        status: emailSent ? "sent" : "failed",
        related_id: params.bookingId || null,
      });
    }

    if (!emailSent && sendError) {
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: sendError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, sent: emailSent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
