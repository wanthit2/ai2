const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres.kphjykhlpvpqwwufwekl:Booss.28555@aws-1-ap-south-1.pooler.supabase.com:6543/postgres'
});

module.exports = pool;
