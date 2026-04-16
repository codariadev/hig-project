import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

function formatarData(dataISO) {
  if (!dataISO) return "Não informada";
  
  const data = new Date(dataISO);
  if (isNaN(data.getTime())) {
    console.error("Data inválida recebida:", dataISO);
    return dataISO;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function formatarHora(horaStr) {
  return horaStr || "Não informada";
}

export async function enviarEmailConfirmacao(consultor, agendamento) {
  try {
    const htmlContent = `
      <h2>Agendamento Confirmado! ✅</h2>
      <p>Olá ${consultor.nome || 'Consultor'},</p>
      <p>Seu agendamento de higienização foi finalizado com sucesso!</p>
      
      <h3>Detalhes do Agendamento:</h3>
      <ul>
        <li><strong>Consultor:</strong> ${consultor.nome || 'N/I'}</li>
        <li><strong>Modelo:</strong> ${agendamento.modelo || 'N/I'}</li>
        <li><strong>Cor:</strong> ${agendamento.cor || 'N/I'}</li>
        <li><strong>Placa:</strong> ${agendamento.placa || 'N/I'}</li>
        <li><strong>Data de Entrega:</strong> ${formatarData(agendamento.dataEntrega)}</li>
        <li><strong>Hora de Entrega:</strong> ${formatarHora(agendamento.horaEntrega)}</li>
        <li><strong>ID:</strong> ${agendamento.id}</li>
      </ul>
      
      <p>Obrigado por usar nossos serviços!</p>
    `;

    await transporter.sendMail({
      from: `"Higienização" <${process.env.SMTP_FROM_EMAIL}>`,
      to: consultor.email,
      subject: `✅ Agendamento ${agendamento.id} Finalizado`,
      html: htmlContent,
    });

    console.log(`✅ Email enviado para ${consultor.email} (ID: ${agendamento.id})`);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar email:", error);
    return false;
  }
}