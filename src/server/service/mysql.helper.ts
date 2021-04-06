import mysql from 'mysql';
import mysqlConf from '../config/mysql.config';

const createAsyncAction = async (conn: mysql.Connection, sql: string) => {
  return new Promise((resolve, reject) => {
    conn.query(sql, function (err, data) {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    })
  })
}

export class MysqlHelper {
  private conn;
  private table;
  constructor(database: string, table: string) {
    this.conn = mysql.createConnection(mysqlConf);
    this.table = table;
  }
  // 初始化后需执行该方法建立连接
  connect() {
    this.conn.connect((err) => {
      if (err) {
        console.log(this.table + " 连接失败");
        // 重新连接
        setTimeout(this.conn.connect, 2000);
        return;
      }
      console.log(this.table + " 连接成功");
      // 定时监控
      setInterval(() => {
        console.log('ping...');
        this.conn.ping((err) => {
          if (err) {
            console.log('ping error: ' + JSON.stringify(err));
          }
        });
      }, 600000);
    });
  }

  insert(insertObj: any) {
    var addKey = [];
    var addVal = [];
    //解析insertObj对象，拆分为数组方便后续处理
    for (let i in insertObj) {
      addKey.push(i);
      addVal.push(insertObj[i]);
    }
    //键值对不匹配，返回错误文档。
    if (addKey.length != addVal.length) {
      throw new Error('insert错误，列和值数目不匹配');
    }
    //拼接SQL字符串
    var str = `insert into ${this.table} (`;
    for (let i = 0; i < addKey.length; i++) {
      str += addKey[i] + ",";
    }
    str = str.substr(0, str.length - 1);
    str += ") values (";
    //判断value类型，Mysql区分数字和字符
    for (let i = 0; i < addVal.length; i++) {
      if (typeof (addVal[i]) == "string")
        str += "'" + addVal[i] + "',";
      else
        str += +addVal[i] + ",";
    }
    str = str.substr(0, str.length - 1);
    str += ");";
    //真查询+异步回调
    return createAsyncAction(this.conn, str)
  }

  select(queryObj: any) {
    var str = "";
    if (queryObj == {}) {
      str = `select * from ${this.table}`
    }
    else {
      str = `select * from ${this.table} where `;
      // 区分类型
      for (var i in queryObj) {
        if (typeof (queryObj[i]) == "string") {
          str += `${i}='${queryObj[i]}' and `;
        }
        else {
          str += `${i}=${queryObj[i]} and `;
        }
      }
      // 清除最后的多余字段
      str = str.substr(0, str.length - 4);
    }
    //返回promise
    return createAsyncAction(this.conn, str)
  }
}
