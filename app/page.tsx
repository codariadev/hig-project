"use client";

import { useState, useEffect } from "react";

const HORAS_DISPONIVEIS = Array.from({ length: 11 }, (_, i) => {
  const hora = 9 + i;
  return `${hora.toString().padStart(2, '0')}:00`;
});

export default function App() {
  const [consultores, setConsultores] = useState<{ id: string; nome: string }[]>([]);
  const [formData, setFormData] = useState({
    consultor: "",
    modelo: "",
    cor: "",
    placa: "",
    dataEntrega: "",
    horaEntrega: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");


  useEffect(() => {
    fetch("/api/consultores")
      .then((res) => res.json())
      .then((data) => setConsultores(data))
      .catch((err) => console.error("Erro ao carregar consultores:", err));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/agendamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Agendamento enviado com sucesso!");
        setFormData({
          consultor: "",
          modelo: "",
          cor: "",
          placa: "",
          dataEntrega: "",
          horaEntrega: "",
        });
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Erro ao enviar agendamento");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-row justify-center items-center">
      <div className="mt-4 flex flex-col bg-gray-900 rounded-lg p-4 shadow-sm max-w-200 max-h-min">
        <h2 className="text-white font-bold text-lg text-center">
          Agendamento
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="text-white" htmlFor="consultor">
              Consultor
            </label>
            <select
              className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
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

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <label className="text-white" htmlFor="modelo">
                Modelo
              </label>
              <input
                placeholder="Modelo"
                className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
                id="modelo"
                name="modelo"
                type="text"
                value={formData.modelo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex-1">
              <label className="text-white" htmlFor="cor">
                Cor
              </label>
              <input
                placeholder="Cor"
                className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
                id="cor"
                name="cor"
                type="text"
                value={formData.cor}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mt-4 flex flex-row space-x-2">
            <div className="flex-1">
              <label className="text-white" htmlFor="placa">
                Placa
              </label>
              <input
                placeholder="ABC-1234"
                className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
                id="placa"
                name="placa"
                type="text"
                value={formData.placa}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-white" htmlFor="dataEntrega">
                Data de entrega
              </label>
              <input
                className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
                id="dataEntrega"
                name="dataEntrega"
                type="date"
                value={formData.dataEntrega}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1">
              <label className="text-white" htmlFor="horaEntrega">
                Hora de entrega
              </label>
              <select
                className="w-full bg-gray-800 rounded-md border-gray-700 text-white px-2 py-1"
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

          <div className="mt-4 flex justify-center">
            <button
              className="bg-white text-black rounded-md px-4 py-1 hover:bg-blue-500 hover:text-white transition-all duration-200 disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Enviando..." : "Submit"}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-4 text-center text-white text-sm bg-gray-800 p-2 rounded">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
