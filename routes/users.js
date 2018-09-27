var express = require('express');
var router = express.Router();

const connection = require('./createConnect');

// 连接数据库
connection.connect(() => {
  console.log('数据库连接成功！');
});

/* 响应添加账号的请求*/
router.post('/userAdd', (req, res) => {
  // 接收前端数据
  let { username, password, group } = req.body;
  // 创建sql语句
  const insertSql = `insert into users values(null,'${username}','${password}','${group}', null)`;
  // 执行sql语句
  connection.query(insertSql, (err, data) => {
    if (err) {
      throw err;   // 如果错误就抛出错误
    } else {    // 否则就执行以下逻辑
      if (data.affectedRows > 0) {    // 如果影响行数至少有一行，就往前端响应成功的数据对象
        res.send({"statusCode" : 1, "msg" : "添加成功！"});
      } else {    // 如果没有响应行数就往前端响应失败的数据对象
        res.send({"statusCode" : 0, "msg" : "添加失败！"});
      }
    }
  });
});

/* 响应账号列表的请求 */
router.get('/userList', (req, res) => {
  // 定义sql语句，查询所有数据
  const selectSql = `select * from users order by dates desc`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    // 如果有错抛出错误
    if (err) {
      throw err;
    } else {    // 否则就执行以下逻辑
      // 将查询到的所有数据响应给前端
      res.send(data)
    }
  });
});

/* 响应单条数据删除请求 */
router.get('/userDelOne', (req, res) => {
  // 接收前端发起请求的id
  let { id } = req.query;
  // 定义sql语句，根据id单条删除数据
  const delOneSql = `delete from users where id=${id}`;
  // 执行sql语句
  connection.query(delOneSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 如果受影响行数至少有一行（执行删除成功）
      if (data.affectedRows > 0) {
        // 向前端响应成功的数据对象
        res.send({"statusCode": 1, "msg": "删除成功！"});
      } else {
        // 否则响应失败的数据对象
        res.send({ "statusCode": 0, "msg": "删除失败！" });
      }
    }
  });
});

module.exports = router;
