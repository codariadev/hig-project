"use client";

import { useEffect, useState } from "react";

interface Agendamento {
  id: string;
  consultor: string;
  modelo: string;
  cor: string;
  placa: string;
  dataEntrega: string;
  horaEntrega: string;
  obs?: string;
}

const HORAS_DISPONIVEIS = Array.from({ length: 11 }, (_, i) => {
  const hora = 8 + i;
  return `${hora.toString().padStart(2, "0")}:00`;
});

export default function CalendarioSemanal() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [semana, setSemana] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAgendamento, setHoveredAgendamento] = useState<string | null>(null);
  const [dataAtual, setDataAtual] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDataAtual(new Date());

    const interval = setInterval(() => {
      setDataAtual(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    carregarAgendamentos();
    gerarSemana();

    const interval = setInterval(carregarAgendamentos, 30000);
    return () => clearInterval(interval);
  }, []);

  const carregarAgendamentos = async () => {
    try {
      const response = await fetch("/api/agendamento");
      if (response.ok) {
        const data = await response.json();
        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarSemana = () => {
    const hoje = new Date();
    const diaSemana = hoje.getDay();

    const segundaFeira = new Date(hoje);
    segundaFeira.setDate(hoje.getDate() - (diaSemana === 0 ? 5 : diaSemana - 1));

    const dias = [];
    for (let i = 0; i < 6; i++) {
      const data = new Date(segundaFeira);
      data.setDate(segundaFeira.getDate() + i);
      dias.push(data);
    }

    setSemana(dias);
  };

  const horaPassou = (data: Date, hora: string) => {
    if (!dataAtual) return false;

    if (data < dataAtual) {
      return true;
    }

    if (data.toDateString() !== dataAtual.toDateString()) {
      return false;
    }

    const [horaNum] = hora.split(":").map(Number);
    const horaAtual = dataAtual.getHours();
    const minutoAtual = dataAtual.getMinutes();

    return horaNum < horaAtual || (horaNum === horaAtual && minutoAtual >= 5);
  };

  const obterHorariosPorDia = (indexDia: number) => {
    if (indexDia >= 0 && indexDia <= 4) {
      return HORAS_DISPONIVEIS;
    } else if (indexDia === 5) {
      return HORAS_DISPONIVEIS.slice(1, 5);
    }
    return [];
  };

  const verificarAgendamento = (data: Date, hora: string) => {
    return agendamentos.find((a) => {
      const dataAgendamento = new Date(a.dataEntrega);
      return (
        dataAgendamento.toDateString() === data.toDateString() &&
        a.horaEntrega === hora
      );
    });
  };

  const nomeDia = (index: number) => {
    const dias = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    return dias[index];
  };

  const formatarData = (data: Date) => {
    const dia = String(data.getDate()).padStart(2, "0");
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    return `${dia}/${mes}`;
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-700 rounded-lg w-48 mb-6"></div>
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-shrink-0 h-64 w-32 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700/50 w-full">
        <div className="mb-8 flex justify-between items-center border">
          <h3 className="text-2xl font-bold text-white">📅 Agenda da Semana</h3>
          <p className="text-slate-400 text-sm">Visualize os horários disponíveis e agendados</p>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {semana.map((data, indexDia) => {
              const horarios = obterHorariosPorDia(indexDia);

              return (
                <div
                  key={indexDia}
                  className="flex-shrink-0 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 flex-1 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 min-w-max shadow-lg"
                >
                  <div className="mb-4 border-b border-slate-700 pb-3">
                    <p className="text-white font-bold text-lg">{nomeDia(indexDia)}</p>
                    <p className="text-slate-400 text-xs mt-1">{formatarData(data)}</p>
                  </div>

                  {horarios.length > 0 ? (
                    <div className="space-y-2">
                      {horarios.map((hora) => {
                        const agendado = verificarAgendamento(data, hora);
                        const agendamentoId = agendado?.id || "";

                        return (
                          <div
                            key={hora}
                            className="relative"
                            onMouseEnter={() => setHoveredAgendamento(agendamentoId)}
                            onMouseLeave={() => setHoveredAgendamento(null)}
                          >
                            <div
                              className={`p-2 rounded-lg text-xs font-semibold transition-all duration-300 cursor-pointer ${
                                horaPassou(data, hora)
                                  ? "bg-slate-700/80 text-slate-500 border border-slate-600 hover:bg-slate-600/80 hover:shadow-lg hover:shadow-slate-500/20"
                                  : agendado
                                  ? "bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30 hover:shadow-lg hover:shadow-red-500/20"
                                  : "bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30 hover:shadow-lg hover:shadow-green-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-center">
                                <span>{hora}</span>
                                {agendado && <span className="text-xs opacity-90">✓</span>}
                              </div>
                            </div>

                            {agendado && !horaPassou(data, hora) && hoveredAgendamento === agendamentoId && (
                              <div className="absolute left-0 bottom-full mb-2 bg-slate-950 border border-slate-600 rounded-lg p-3 text-white text-xs whitespace-nowrap opacity-100 z-10 shadow-xl">
                                <p className="font-bold text-blue-400 mb-1">{agendado.consultor}</p>
                                <p className="text-slate-300">{agendado.modelo}</p>
                                <p className="text-slate-400">Placa: {agendado.placa}</p>
                                {agendado.obs && (
                                  <p className="text-slate-400 mt-1">Obs: {agendado.obs.substring(0, 30)}...</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-slate-500 text-sm">Fechado</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700 flex gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500/50"></div>
            <span className="text-slate-400">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500/50"></div>
            <span className="text-slate-400">Agendado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-slate-600"></div>
            <span className="text-slate-400">Passada</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">⏱️ Cada agendamento leva 1 hora</span>
          </div>
        </div>
      </div>
    </div>
  );
}