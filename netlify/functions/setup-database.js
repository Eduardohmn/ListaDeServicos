const postgres = require('postgres');

exports.handler = async (event, context) => {
  // Conecta ao banco de dados usando a URL que o Netlify fornece
  const sql = postgres(process.env.NETLIFY_DATABASE_URL, { ssl: 'require' });

  try {
    // Comando SQL para criar a nossa tabela de avaliações
    await sql`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id SERIAL PRIMARY KEY,
        slug TEXT NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Tabela "avaliacoes" criada com sucesso!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Erro ao criar a tabela.', error: error.message }),
    };
  }
};