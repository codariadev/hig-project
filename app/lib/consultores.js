export function getConsultores() {
  try {
    const json = process.env.CONSULTORES_JSON;
    if (!json) return [];
    return JSON.parse(json);
  } catch (error) {
    console.error("Erro ao parsear CONSULTORES_JSON:", error);
    return [];
  }
}

export function getConsultorById(id) {
  const consultores = getConsultores();
  return consultores.find((c) => c.id === id);
}

export function getConsultorByNome(nome) {
  const consultores = getConsultores();
  return consultores.find((c) => c.nome === nome);
}
