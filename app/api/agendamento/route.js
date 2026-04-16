import { addDoc, collection, getDocs } from "firebase/firestore";
import { getConsultorByNome } from "../../lib/consultores";
import { db } from "../../../firebase-env/firebaseConfig";

// Armazenar agendamentos em memória (temporário)
const agendamentos = await getDocs(collection(db, 'agendamentos')).then((querySnapshot) => {
  const agendamentoMap = new Map();
  querySnapshot.forEach((doc) => {
    agendamentoMap.set(doc.id, doc.data());
  });
  return agendamentoMap;
});

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

    if (!consultor || !modelo || !cor || !placa || !dataEntrega) {
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
    // agendamentos.set(agendamentoId, agendamentoData);
    console.log("Agendamento recebido:", agendamentoData);
    await addDoc(collection(db, 'agendamentos'), agendamentoData);
    console.log("Agendamento salvo no Firestore:");


    const mensagem = `
📋 <b>Novo Agendamento de Higienização</b>

👤 <b>Consultor:</b> ${consultor.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
✉️ <b>Email:</b> ${consultorData.email.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
🚗 <b>Modelo:</b> ${modelo}
🎨 <b>Cor:</b> ${cor}
🔢 <b>Placa:</b> ${placa}
📅 <b>Data de Entrega:</b> ${formatarData(dataEntrega)}

ID: <code>${agendamentoId}</code>
`.trim();;

    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CLEANER_CHAT_ID,
          text: mensagem,
          parse_mode: "HTML",
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
        }),
      }
    );

    console.log("Resposta do Telegram status:", response.status);
    console.log("Resposta do Telegram body:", await response.text());

    if (!response.ok) {
      throw new Error( `Erro ao enviar para o Telegram: ${response.status} - ${await response.text()}`)
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
