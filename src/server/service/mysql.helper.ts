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

  async insert(insertObj: any): Promise<number> {
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
    const result: any = await createAsyncAction(this.conn, str);
    return result.insertId;
  }

  async select(selectObj: any): Promise<string> {
    var str = "";
    if (selectObj == {}) {
      str = `select * from ${this.table}`
    }
    else {
      str = `select * from ${this.table} where `;
      // 区分类型
      for (var i in selectObj) {
        if (typeof (selectObj[i]) == "string") {
          str += `${i}='${selectObj[i]}' and `;
        }
        else {
          str += `${i}=${selectObj[i]} and `;
        }
      }
      // 清除最后的多余字段
      str = str.substr(0, str.length - 4);
    }
    //返回promise
    const result = await createAsyncAction(this.conn, str)
    return JSON.stringify(result);
  }

  async update(selectObj: any, updateObj: any): Promise<number> {
    //注意，这里的updateObj没必要把所有参数穿进去，只要把需要更新的字段和值传进来就可以，Kid就可以帮你补全剩下的数据了
    const data: any = JSON.parse(await this.select(selectObj));
    if (data.length == 0) {
      throw new Error('update错误，没有匹配到数据');
    }
    const oldData = data[0];
    //获取旧数据，比较新旧数据的键是否匹配
    var str = `update ${this.table} set `;
    for (let u in updateObj) {
      //用旧数据的键比对传参的键
      if (oldData[u] === undefined)
        throw new Error('update错误，输入键和源数据不匹配');
    }
    //区分类型
    for (let o in updateObj) {
      if (typeof (updateObj[o]) == 'string')
        str += `${o} = '${updateObj[o]}',`;
      else
        str += `${o} = ${oldData[o]},`;
    }
    str = str.substr(0, str.length - 1);
    str += ` where `;
    for (var i in selectObj) {
      if (typeof (selectObj[i]) == "string") {
        str += `${i}='${selectObj[i]}' and `;
      }
      else {
        str += `${i}=${selectObj[i]} and `;
      }
    }
    // 清除最后的多余字段
    str = str.substr(0, str.length - 4);
    const result: any = await createAsyncAction(this.conn, str);
    return result.affectedRows;
  }

  async delete(delObj: any): Promise<number> {
    var str = `delete from ${this.table} where `;
    for (var i in delObj) {
      if (typeof (delObj[i]) == "string") {
        str += `${i}='${delObj[i]}' and `;
      }
      else {
        str += `${i}=${delObj[i]} and `;
      }
    }
    // 清除最后的多余字段
    str = str.substr(0, str.length - 4);
    const result: any = await createAsyncAction(this.conn, str);
    return result.affectedRows;
  }
}
