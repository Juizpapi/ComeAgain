import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Come Again Restaurant <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Resend Error:", error);
      throw new Error(error.message);
    }

    console.log("✅ Email sent successfully");
    console.log(data);

    return data;
  } catch (err) {
    console.error("❌ Email Error:", err);
    throw err;
  }
};