import { getConsultorByNome } from "../../lib/consultores";

// Armazenar agendamentos em memória (temporário)
const agendamentos = new Map();

export async function POST(request) {

    function formatarData(dataISO) {
  if (!dataISO) return "Não informada";

  const data = new Date(dataISO);

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}
  try {
    const { consultor, modelo, cor, placa, dataEntrega } = await request.json();

    if (!consultor || !modelo || !cor || !placa) {
      return Response.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const consultorData = getConsultorByNome(consultor);
    if (!consultorData) {
      return Response.json(
        { error: "Consultor não encontrado" },
        { status: 400 }
      );
    }

    const agendamentoId = `agd-${Date.now()}`;
    const agendamentoData = {
      id: agendamentoId,
      consultor,
      consultorEmail: consultorData.email,
      modelo,
      cor,
      placa,
      dataEntrega,
    };

    // Armazenar agendamento
    agendamentos.set(agendamentoId, agendamentoData);

    const mensagem = `
📋 *Novo Agendamento de Higienização*

👤 *Consultor:* ${consultor}
🚗 *Modelo:* ${modelo}
🎨 *Cor:* ${cor}
🔢 *Placa:* ${placa}
📅 📅 *Data de Entrega:* ${formatarData(dataEntrega)}

ID: \`${agendamentoId}\`
    `.trim();

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CLEANER_CHAT_ID,
          text: mensagem,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Concluir Agendamento",
                  callback_data: `confirm_${agendamentoId}`,
                },
              ],
            ],
          },
        } ),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao enviar para Telegram");
    }

    return Response.json({ success: true, message: "Agendamento enviado!" });
  } catch (error) {
    console.error("Erro:", error);
    return Response.json(
      { error: "Erro ao processar agendamento" },
      { status: 500 }
    );
  }
}

// Exportar função para webhook
export { agendamentos };
