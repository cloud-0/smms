var express = require('express');
var router = express.Router();

const connection = require('./createConnect');

// 连接数据库
connection.connect(() => {
  console.log('数据库连接成功！');
});

// 接收添加账号的请求
router.post('/userAdd', (req, res) => {
  // 接收前端数据
  let { username, password, group } = req.body;
  // 创建sql语句
  const insertSql = `insert into users values(null,'${username}','${password}','${group}', null)`;
  // 执行sql语句
  connection.query(insertSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      if (data.affectedRows > 0) {
        res.send({"statusCode" : 1, "msg" : "添加成功！"});
      } else {
        res.send({"statusCode" : 0, "msg" : "添加失败！"});
      }
    }
  });

});


module.exports = router;
