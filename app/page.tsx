"use client";

import { useEffect, useState } from "react";
import CalendarioSemanal from "./components/CalendarioSemanal";

const HORAS_DISPONIVEIS = Array.from({ length: 11 }, (_, i) => {
  const hora = 9 + i;
  return `${hora.toString().padStart(2, "0")}:00`;
});

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [consultores, setConsultores] = useState<{ id: string; nome: string }[]>([]);
  const [formData, setFormData] = useState({
    consultor: "",
    modelo: "",
    cor: "",
    placa: "",
    dataEntrega: "",
    horaEntrega: "",
    obs: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/consultores")
      .then((res) => res.json())
      .then((data) => setConsultores(data))
      .catch((err) => console.error("Erro ao carregar consultores:", err));
  }, []);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Agendamento enviado com sucesso!");
        setMessageType("success");
        setFormData({
          consultor: "",
          modelo: "",
          cor: "",
          placa: "",
          dataEntrega: "",
          horaEntrega: "",
          obs: "",
        });
        setTimeout(() => setMessage(""), 5000);
      } else {
        setMessageType("error");
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessageType("error");
      setMessage("❌ Erro ao enviar agendamento");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Higienização de Veículos
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Agende a higienização do seu veículo de forma rápida e simples
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl border border-slate-700/50 sticky top-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📋</span> Novo Agendamento
              </h2>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Consultor
                  </label>
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                    id="consultor"
                    name="consultor"
                    value={formData.consultor}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione o consultor</option>
                    {consultores.map((c) => (
                      <option key={c.id} value={c.nome}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Modelo
                    </label>
                    <input
                      placeholder="Ex: Honda Civic"
                      className=" text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      id="modelo"
                      name="modelo"
                      type="text"
                      value={formData.modelo}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Cor
                    </label>
                    <input
                      placeholder="Ex: Preto"
                      className="text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      id="cor"
                      name="cor"
                      type="text"
                      value={formData.cor}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Placa
                  </label>
                  <input
                    placeholder="ABC-1234"
                    className="text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 uppercase"
                    id="placa"
                    name="placa"
                    type="text"
                    value={formData.placa}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Data de entrega
                    </label>
                    <input
                      className="text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      id="dataEntrega"
                      name="dataEntrega"
                      type="date"
                      value={formData.dataEntrega}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Hora de entrega
                    </label>
                    <select
                      className="text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                      id="horaEntrega"
                      name="horaEntrega"
                      value={formData.horaEntrega}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione a hora</option>
                      {HORAS_DISPONIVEIS.map((hora) => (
                        <option key={hora} value={hora}>
                          {hora}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Observações
                  </label>
                  <textarea
                    className="text-sm w-full bg-slate-900 border border-slate-700 rounded-lg text-white px-4 py-3 placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none"
                    id="obs"
                    name="obs"
                    placeholder="Adicione observações importantes..."
                    value={formData.obs}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <button
                  className="text-sm w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Enviando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span> Agendar Agora
                    </span>
                  )}
                </button>

                {message && (
                  <div
                    className={`p-4 rounded-lg text-sm font-medium animate-fadeIn ${
                      messageType === "success"
                        ? "bg-green-500/20 text-green-300 border border-green-500/30"
                        : "bg-red-500/20 text-red-300 border border-red-500/30"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <CalendarioSemanal />
          </div>
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            ⏱️ Informações Importantes
          </h3>
          <p className="text-slate-400 mb-4">
            Cada agendamento leva aproximadamente <strong>1 hora</strong> para ser concluído
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
            <span>📅 Segunda a Sexta: 9h - 17h</span>
            <span>•</span>
            <span>📅 Sábado: 10h - 13h</span>
          </div>
        </div>
      </div>
    </div>
  );
}