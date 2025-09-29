// functions/get-reviews.js
import postgres from 'postgres';

export async function handler(event) {
  const { slug } = event.queryStringParameters;
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    const reviews = await sql`
      SELECT rating, comment, user_email, created_at
      FROM reviews
      WHERE provider_slug = ${slug}
      ORDER BY created_at DESC
    `;
    return {
      statusCode: 200,
      body: JSON.stringify(reviews),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao buscar avaliações.' }),
    };
  }
}