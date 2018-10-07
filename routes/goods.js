var express = require('express');
var router = express.Router();

const connection = require('./createConnect');

// 连接数据库
connection.connect(() => {
  console.log('数据库连接成功！');
});

// 响应商品添加的请求
router.post('/goodsadd', (req, res) => {
  // 接收前端数据
  let { classify, barCode, goodsName, price, marketPrice, enterPrice, enterNumber, weight, unit, discounts, promotion, introduce } = req.body;
  // 创建sql语句
  const insertSql = `insert into goods values(null,'${classify}','${barCode}','${goodsName}','${price}','${marketPrice}','${enterPrice}','${enterNumber}','${weight}','${unit}','${discounts}','${promotion}','${introduce}',null)`;
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

/* 响应商品列表分页的请求 */
router.get('/goodslist', (req, res) => {
  // 接收数据（前端发送的当前页码和每页现实数据量）
  let { pageSize, currentPage, classify, key } = req.query;
  // 定义sql语句，查询所有数据
  let selectSql = `select * from goods where 1=1`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    // 如果有错抛出错误
    if (err) {
      throw err;
    } else {    // 否则就执行以下逻辑
      // 全部数据的总数量
      let totalData = data.length;

      // 判断分类
      if (classify !== '' && classify != '全部') {
        // 拼接sql语句
        selectSql += ` and classify='${classify}'`;
      }
      // 判断关键字
      if (key != '') {
        selectSql += ` and (barCode like '%${key}%' or goodsName like '%${key}%')`;
      }

      connection.query(selectSql, (err, data) => {
        if (err) {
          throw err;
        } else {
          // 根据查询的结果计算的长度
          totalData = data.length;
        }
      });

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

/* 响应单条商品删除请求 */
router.get('/goodsDelOne', (req, res) => {
  // 接收前端发起请求的id
  let { id } = req.query;
  // 定义sql语句，根据id单条删除数据
  const delOneSql = `delete from goods where id=${id}`;
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
  const delSql = `delete from goods where id in (${idArr})`;    // sql的in字句会自动把数据转换为数据对象
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

/* 响应商品修改的请求 */
router.get('/goodsedit', (req, res) => {
  // 接收id
  let { id } = req.query;
  // 定义sql语句，根据id查询数据
  const selectSql = `select * from goods where id=${id}`;
  // 执行sql语句
  connection.query(selectSql, (err, data) => {
    if (err) {
      throw err;
    } else {
      res.send(data);
    }
  });
});

/* 响应商品修改保存的请求 */
router.post('/goodssaveedit', (req, res) => {
  // 获取修改后的数据和原来的id
  let { classify, barCode, goodsName, price, marketPrice, enterPrice, enterNumber, weight, unit, discounts, promotion, introduce, id } = req.body;
  // 定义sql语句(根据id修改数据库中的数据)
  const updateSql = `update goods set classify='${classify}', barCode='${barCode}', goodsName='${goodsName}', price='${price}', marketPrice='${marketPrice}', enterPrice='${enterPrice}', enterNumber='${enterNumber}', weight='${weight}', unit='${unit}', discounts='${discounts}', promotion='${promotion}', introduce='${introduce}' where id=${id}`;
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



// // 响应商品查询的请求
// router.get('/goodsselect', (req, res) => {
//   // 接收数据
//   let { classify, key } = req.body;
//   // 构建sql语句
//   let selectSql = 'select * from goods where 1=1';
//   // 判断分类
//   if (classify !== '' && classify != '全部') {
//     // 拼接sql语句
//     selectSql += ` and classify=${classify}`;
//   }
//   // 判断关键字
//   if (key != '') {
//     selectSql += ` and barCode like '%${key}%' or goodsName like '%${key}%'`;
//   }

//   console.log(selectSql);
//   // 执行sql语句
//   connection.query(selectSql, (err, data) => {
//     if (err) {
//       throw err;
//     } else {
//       res.send(data)
//     }
//   });
// });


module.exports = router;
