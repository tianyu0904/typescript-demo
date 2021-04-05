import mysql from 'mysql';

class MysqlHelper {
  private conn;
  private table;
  constructor(database: string, table: string) {
    this.conn = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      port: 3306,
      database: database
    });
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
    })
  }
}

exports.MysqlHelper = MysqlHelper;