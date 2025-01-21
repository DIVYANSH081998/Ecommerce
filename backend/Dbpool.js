const { Pool } = require('pg');
require('dotenv').config();


const pool = new Pool(
  process.env.NODE_ENV === 'production'
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
      }
);


pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
  } else {
    console.log('Connected to database successfully!');
    release();
  }
});

const setupDatabase = async () => {
  const client = await pool.connect();
  try {

    await client.query('BEGIN');

  
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'orders' 
        AND table_schema = 'public'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('Tables already exist, skipping setup');
      await client.query('COMMIT');
      return;
    }


    console.log('Creating new tables...');

   
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        orderdescription VARCHAR(100) NOT NULL,
        createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created orders table');

  
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY,
        productname VARCHAR(100) NOT NULL,
        productdescription TEXT
      )
    `);
    console.log('Created products table');


    
    await client.query(`
      CREATE TABLE IF NOT EXISTS "OrderProductMap" (
        id SERIAL PRIMARY KEY,
        orderid INT NOT NULL,
        productid INT NOT NULL,
        FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productid) REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log('Created OrderProductMap table');


    const productCount = await client.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {

      await client.query(`
        INSERT INTO products (id, productname, productdescription) VALUES
          (1, 'HP laptop', 'This is HP laptop'),
          (2, 'lenovo laptop', 'This is lenovo'),
          (3, 'Car', 'This is Car'),
          (4, 'Bike', 'This is Bike')
        ON CONFLICT (id) DO NOTHING
      `);
      console.log('Inserted initial product data');
    } else {
      console.log('Products already exist, skipping initial data insertion');
    }


    await client.query('COMMIT');
    console.log('Database setup completed successfully');
  } catch (err) {
 
    await client.query('ROLLBACK');
    console.error('Error setting up database:', err);
    throw err;
  } finally {
    client.release();
  }
};


if (process.env.SETUP_DATABASE === 'true') {
  setupDatabase();
}

module.exports = pool;