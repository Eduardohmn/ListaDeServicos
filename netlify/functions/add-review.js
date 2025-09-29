// functions/add-review.js
import postgres from 'postgres';

export async function handler(event, context) {
  // Protege a função: só permite requisições POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Protege a função: verifica se o usuário está logado
  const { user } = context.clientContext;
  if (!user) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Você precisa estar logado para avaliar.' }),
    };
  }

  const { provider_slug, rating, comment } = JSON.parse(event.body);

  if (!provider_slug || !rating) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Prestador e avaliação são obrigatórios.' }),
    };
  }

  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    await sql`
      INSERT INTO reviews (provider_slug, user_id, user_email, rating, comment)
      VALUES (${provider_slug}, ${user.sub}, ${user.email}, ${rating}, ${comment})
    `;
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Avaliação enviada!' }),
    };
  } catch (error) {
    console.error(error);
    // Trata o caso de o usuário já ter avaliado
    if (error.code === '23505') { // unique_violation
        return {
            statusCode: 409,
            body: JSON.stringify({ error: 'Você já avaliou este serviço.' }),
        };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Não foi possível registrar a avaliação.' }),
    };
  }
}