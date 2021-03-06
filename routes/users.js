var express = require('express');
var router = express.Router();

const connection = require('./createConnect');

// 连接数据库
connection.connect(() => {
  console.log('数据库连接成功！');
});

/* 响应登录的请求 */
router.post('/checklogin', (req, res) => {
  // 接收数据
  let { username, password } = req.body;
  // 定义sql语句
  const selectSql = `select * from users where username='${username}' and password='${password}'`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 查询到的结果是一个数组，如果有长度，就返回登录成功的数据对象，否则返回失败的数据对象
      if (data.length) {
        // 设置cookie
        res.cookie('username', data[0].username);
        res.cookie('userId', data[0].id);
        res.cookie('group', data[0].groups);
        res.send({ "statusCode": 1, "msg": "登录成功！" });
      } else {
        res.send({ "statusCode": 0, "msg": "登录失败！请检查账号和密码是否输入正确！" });
      }
    }
  });
});

/* 检测是否登录 */ 
router.get('/checkIsLogin', (req, res) => {
  // 从浏览器获取cookie值
  let username = req.cookies.username;
  // 判断是否存在，如果存在，不做任何行为，如果不存在，弹出提示并回到登录页面
  if (username) {
    res.send('');
  } else {
    res.send('alert("请先登录，嘿嘿！"); location.href="./login.html";');
  }
});

/* 响应获取用户名请求 */
router.get('/getusername', (req, res) => {
  // 获取登录后浏览器中cookie的username
  let username = req.cookies.username;
  // 将获取到的用户名响应给前端
  res.send(username);
}); 

/* 响应原密码验证的请求 */
router.post('/checkoldpwd', (req, res) => {
  // 接收前端数据（输入的原密码）
  let { oldPwd } = req.body;
  // 获取id
  let id = req.cookies.userId;
  // 定义sql语句（根据id查询数据库中的原密码）
  const selectSql = `select * from users where id=${id}`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      if (data[0].password === oldPwd) {
        res.send({ "statusCode": 1 });
      } else {
        res.send({ "statusCode": 0, "msg": "密码输入错误！" });
      }
    }
  });
});

/* 响应密码修改确认的请求 */
router.post('/savepwdedit', (req, res) => {
  // 接收数据（新密码）
  let { newPwd } = req.body;
  // 获取cookie的Id
  let id = req.cookies.userId;
  // 定义sql语句(根据id更新数据库中的密码)
  let updateSql = `update users set password='${newPwd}' where id=${id}`;
  // 执行sql语句
  connection.query(updateSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 清除cookie
      res.clearCookie('username');
      res.clearCookie('userId');
      res.clearCookie('group');
      // 响应数据对象到前端
      res.send({ "statusCode" : 1, "msg" : "修改成功！" });
    }
  });
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

/* 响应账号列表分页的请求 */
router.get('/userList', (req, res) => {
  // 接收数据（前端发送的当前页码和每页现实数据量）
  let { pageSize, currentPage } = req.query;
  // 定义sql语句，查询所有数据
  let selectSql = `select * from users`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    // 如果有错抛出错误
    if (err) {
      throw err;
    } else {    // 否则就执行以下逻辑
      // 全部数据的总数量
      let totalData = data.length;
      // 计算跳过多少条数据
      let n = (currentPage - 1) * pageSize;
      // 拼接查询所有数据的sql语句，根据页码和每页数量查询数据并且根据时间排序
      selectSql += ` order by dates desc limit ${n}, ${pageSize}`;
      // 执行拼接后的sql语句（根据条件查询）
      connection.query(selectSql, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 响应给前端数据对象
          res.send({"totalData": totalData, "pageData": data});
        }
      });
      
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

/* 响应批量删除的请求 */
router.get('/batchDel', (req, res) => {
  // 接收请求数据
  let { idArr } = req.query;    // 数据是一个id的数组
  // 定义sql语句
  const delSql = `delete from users where id in (${idArr})`;    // sql的in字句会自动把数据转换为数据对象
  // 执行sql语句
  connection.query(delSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 如果影响行数大于0，就返回给前端成功的数据对象，否则返回失败的数据对象
      if (data.affectedRows > 0) {
        res.send({ "statusCode": 1, "msg": "删除成功！" });
      } else {
        res.send({ "statusCode": 0, "msg": "删除失败！" });
      }
    }
  });
});

/* 响应账号修改的请求 */
router.get('/useredit', (req, res) => {
  // 接收id
  let { id } = req.query;
  // 定义sql语句，根据id查询数据
  const selectSql = `select * from users where id=${id}`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      res.send(data);
    }
  });
});

/* 响应保存账号修改的请求 */
router.post('/saveedit', (req, res) => {
  // 获取修改后的数据和原来的id
  let { username, password, group, id } = req.body;
  // 定义sql语句(根据id修改数据库中的数据)
  const updateSql = `update users set username='${username}', password='${password}', groups='${group}' where id=${id}`;
  // 执行sql语句
  connection.query(updateSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      // 如果受影响的行数大于0，就返回成功的数据对象
      if (data.affectedRows > 0) {
        res.send({ "statusCode": 1, "msg": "修改成功！" });
      } else {
        res.send({ "statusCode": 0, "msg": "修改失败！" });
      }
    }
  });
});

/* 响应退出管理系统请求 */
router.get('/logout', (req, res) => {
  // 清除cookie
  res.clearCookie('username');
  res.clearCookie('password');
  res.clearCookie('group');
  // 响应给前端退出提示，返回到登录页面
  res.send('<script> alert("退出管理系统成功！欢迎下次光临！"); location.href="/login.html"; </script>');
}); 

module.exports = router;
