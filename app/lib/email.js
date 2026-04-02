import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function enviarEmailConfirmacao(consultor, agendamento) {
  try {
    const htmlContent = `
      <h2>Agendamento Confirmado! ✅</h2>
      <p>Olá ${consultor.nome},</p>
      <p>Seu agendamento de higienização foi confirmado com sucesso!</p>
      
      <h3>Detalhes do Agendamento:</h3>
      <ul>
        <li><strong>Modelo:</strong> ${agendamento.modelo}</li>
        <li><strong>Cor:</strong> ${agendamento.cor}</li>
        <li><strong>Placa:</strong> ${agendamento.placa}</li>
        <li><strong>Data de Entrega:</strong> ${agendamento.dataEntrega || "Não informada"}</li>
      </ul>
      
      <p>Obrigado!</p>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: consultor.email,
      subject: "✅ Agendamento Confirmado - Higienização de Veículo",
      html: htmlContent,
    });

    console.log(`Email enviado para ${consultor.email}`);
    return true;
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return false;
  }
}
