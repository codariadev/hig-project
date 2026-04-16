import { getConsultorByNome } from "../../../lib/consultores";
import { enviarEmailConfirmacao } from "../../../lib/email";
import { db } from "../../../../firebase-env/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.callback_query) {
      const { data, id: callbackId } = body.callback_query;

      if (data.startsWith("confirm_")) {
        const agendamentoId = data.replace("confirm_", "");
        
        const agendamentoRef = doc(db, 'agendamentos', agendamentoId);
        const agendamentoSnap = await getDoc(agendamentoRef);
        
        if (!agendamentoSnap.exists()) {
          console.log("Agendamento não encontrado no Firestore:", agendamentoId);

          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackId,
              text: "❌ Agendamento não encontrado!",
              show_alert: true,
            }),
          });
          return Response.json({ error: "Agendamento não encontrado" });
        }

        const agendamento = { id: agendamentoId, ...agendamentoSnap.data() };
        console.log("Agendamento encontrado:", agendamento);

        const consultor = getConsultorByNome(agendamento.consultor);
        if (!consultor) {
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              callback_query_id: callbackId,
              text: "❌ Consultor não encontrado!",
              show_alert: true,
            }),
          });
          return Response.json({ error: "Consultor não encontrado" });
        }

        await enviarEmailConfirmacao(consultor, agendamento);

        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callback_query_id: callbackId,
            text: "✅ E-mail de confirmação enviado ao consultor!",
            show_alert: true,
          }),
        });

        return Response.json({ success: true });
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Erro no webhook:", error);
    return Response.json({ error: "Erro ao processar webhook" }, { status: 500 });
  }
}