// 导入mysql模块
const mysql = require('mysql');

// 登录数据库方法
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'admin'
});

// 暴露登录数据库方法
module.exports = connection;