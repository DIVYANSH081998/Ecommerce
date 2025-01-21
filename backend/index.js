const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();
const pool = require('./Dbpool');
const app = express();


app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.vercel\.app$/, /localhost/] 
    : 'http://localhost:3000'
}));
app.use(express.json());

app.get('/api/order', async (req, res) => {
  try {
   
    const ordersQuery = `
      SELECT o.id, o.orderdescription, o.createdat,
             COUNT(DISTINCT opm.productid) as countofproducts
      FROM orders o
      LEFT JOIN "OrderProductMap" opm ON o.id = opm.orderid
      GROUP BY o.id, o.orderdescription, o.createdat
      ORDER BY o.id DESC
    `;
   
    const { rows } = await pool.query(ordersQuery);
    
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});


app.get('/api/order/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderQuery = `
      SELECT o.*, array_agg(json_build_object(
        'id', p.id,
        'productname', p.productname,
        'productdescription', p.productdescription
      )) as products
      FROM orders o
      LEFT JOIN "OrderProductMap" opm ON o.id = opm.orderid
      LEFT JOIN products p ON opm.productid = p.id
      WHERE o.id::text = $1
       OR LOWER(o.orderdescription) LIKE LOWER($2)
      GROUP BY o.id, o.orderdescription, o.createdat
    `;
    const searchPattern = `%${id}%`;
    const { rows } = await pool.query(orderQuery, [id, searchPattern]);
    
    res.json(rows);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});


app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { orderDescription, productIds } = req.body;
    
   
    const orderResult = await client.query(
      'INSERT INTO orders (orderdescription, createdat) VALUES ($1, NOW()) RETURNING *',
      [orderDescription]
    );
    const newOrder = orderResult.rows[0];

    
    if (productIds && productIds.length > 0) {
      const mappingValues = productIds.map(productId => 
        `(${newOrder.id}, ${productId})`
      ).join(',');
      await client.query(`
        INSERT INTO "OrderProductMap" (orderid, productid)
        VALUES ${mappingValues}
      `);
    }

    await client.query('COMMIT');
    res.status(201).json(newOrder);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  } finally {
    client.release();
  }
});


app.put('/api/orders/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;
    const { orderDescription, productIds } = req.body;

   
    const updateResult = await client.query(
      'UPDATE orders SET orderdescription = $1 WHERE id = $2 RETURNING *',
      [orderDescription, id]
    );

    if (updateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }


    await client.query('DELETE FROM "OrderProductMap" WHERE orderid = $1', [id]);
    
    if (productIds && productIds.length > 0) {
      const mappingValues = productIds.map(productId => 
        `(${id}, ${productId})`
      ).join(',');
      await client.query(`
        INSERT INTO "OrderProductMap" (orderid, productid)
        VALUES ${mappingValues}
      `);
    }

    await client.query('COMMIT');
    res.json(updateResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  } finally {
    client.release();
  }
});


app.delete('/api/orders/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { id } = req.params;

   
    await client.query('DELETE FROM "OrderProductMap" WHERE orderid = $1', [id]);
    
    
    const result = await client.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Order not found' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Database error:', err);
    res.status(500).json({ error: err.message, details: err.stack });
  } finally {
    client.release();
  }
});





app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});


if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = app; 