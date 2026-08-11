type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput) {
  const provider = process.env.EMAIL_PROVIDER || "log";

  if (provider === "resend" && process.env.RESEND_API_KEY) {
    const from =
      process.env.EMAIL_FROM || "Jornada SAP EWM <noreply@jornadaewm.com.br>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Falha ao enviar e-mail: ${text}`);
    }
    return { ok: true as const, provider: "resend" };
  }

  console.log("[email:log]", {
    to: input.to,
    subject: input.subject,
    html: input.html.slice(0, 500),
  });
  return { ok: true as const, provider: "log" };
}

export function welcomeEmailHtml(name: string) {
  return `<p>Olá ${name},</p><p>Sua conta na Jornada SAP EWM Academy foi criada.</p>`;
}

export function purchaseEmailHtml(name: string, orderId: string) {
  return `<p>Olá ${name},</p><p>Seu pedido <strong>${orderId}</strong> foi confirmado e o acesso liberado.</p>`;
}

export function resetPasswordEmailHtml(name: string, link: string) {
  return `<p>Olá ${name},</p><p>Redefina sua senha: <a href="${link}">${link}</a></p>`;
}
