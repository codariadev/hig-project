import { getConsultores } from "../../lib/consultores";

export async function GET() {
  const consultores = getConsultores();
  return Response.json(consultores);
}
