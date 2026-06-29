import { NextRequest } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'copa2026@';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = 'arthurluciano-prog/bolao-inprima';
const FILE_PATH = 'data/resultados-ko.json';

export async function POST(request: NextRequest) {
  try {
    const { password, resultados } = await request.json();

    if (password !== ADMIN_PASSWORD) {
      return Response.json({ error: 'Senha incorreta' }, { status: 401 });
    }

    if (!GITHUB_TOKEN) {
      return Response.json(
        { error: 'GITHUB_TOKEN não configurado nas variáveis de ambiente do Vercel' },
        { status: 500 }
      );
    }

    const getRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getRes.ok) {
      return Response.json({ error: 'Erro ao acessar arquivo no GitHub' }, { status: 500 });
    }

    const fileData = await getRes.json();
    const newContent = JSON.stringify(resultados, null, 2);
    const encoded = Buffer.from(newContent, 'utf-8').toString('base64');

    const putRes = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'admin: atualiza resultados 2ª fase via painel',
          content: encoded,
          sha: fileData.sha,
        }),
      }
    );

    if (!putRes.ok) {
      const err = await putRes.json();
      return Response.json(
        { error: err.message ?? 'Erro ao atualizar GitHub' },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
