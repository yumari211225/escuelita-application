const mysql = require('mysql2')
const database = require('./db_keys')
const {promisify} = require('util')

const pool = mysql.createPool(database)

pool.getConnection((err, connection) =>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('Conexion Interrumpida');
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.error('Conexion Interrumpida');
        }
        if(err.code === 'ECONNREFUSED'){
            console.error('Conexion Rechazada');
        }
    }

    if(connection) connection.release();
    console.log('Conectado a la DB');
    return;
})

pool.query = promisify(pool.query)
module.exports = pool;