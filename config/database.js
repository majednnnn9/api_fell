const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// التحقق من الاتصال
pool.getConnection()
    .then(connection => {
        console.log('تم الاتصال بنجاح بقاعدة البيانات!');
        connection.release();
    })
    .catch(error => {
        console.error('حدث خطأ في الاتصال بقاعدة البيانات: ', error);
        if (error.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('تم فقد الاتصال بقاعدة البيانات');
        }
    });

module.exports = pool;
