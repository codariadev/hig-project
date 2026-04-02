import { getConsultorByNome } from "../../../lib/consultores";
import { enviarEmailConfirmacao } from "../../../lib/email";
import { agendamentos } from "../../agendamento/route";

export async function POST(request) {
  try {
    const body = await request.json();

    // Verificar se é um callback_query (botão clicado)
    if (body.callback_query) {
      const { data, id: callbackId, from } = body.callback_query;

      // Extrair agendamento ID do callback_data
      if (data.startsWith("confirm_")) {
        const agendamentoId = data.replace("confirm_", "");
        const agendamento = agendamentos.get(agendamentoId);

        if (!agendamento) {
          return Response.json({ error: "Agendamento não encontrado" });
        }

        const consultor = getConsultorByNome(agendamento.consultor);

        // Enviar e-mail
        await enviarEmailConfirmacao(consultor, agendamento);

        // Responder ao Telegram
        await fetch(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackId,
              text: "✅ E-mail enviado ao consultor!",
              show_alert: true,
            } ),
          }
        );

        return Response.json({ success: true });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return Response.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}
