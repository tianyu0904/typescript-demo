import mysql from 'mysql';
import mysqlConf from '../config/mysql.config';

const sqlQuery = (sql: string) => {
  const conn = mysql.createConnection(mysqlConf);
  conn.connect()
  return new Promise((resolved, rejected) => {
    conn.query(sql, (result) => {
      if (result === null) {
        rejected(null);
      } else {
        resolved(result);
      }
    });
  });
}
