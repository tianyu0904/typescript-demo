import Koa from 'koa';
import Router from "koa-router";
import KoaBody from "koa-body";
import md5 from 'md5';
import fs from "fs";
import path from "path";
import {MysqlHelper} from "./service/mysql.helper"

const app = new Koa();
const router = new Router();

app.use(KoaBody({
  multipart: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024 * 1024
  }
}));

router.get('/', async (ctx) => {
  ctx.body = "Hi TS";
});

router.post('/api/upload', async (ctx) => {
  if (!ctx.request.files) {
    console.log('上传的文件为空！');
    return;
  }
  const data = ctx.request.files.file;
  let files = [];
  if (!Array.isArray(data)) {
    files.push(data);
  } else {
    files = data
  }
  files.forEach((element) => {
    // 创建可读流
    const reader = fs.createReadStream(element.path);
    // 确认文件存储位置
    const rootPath = path.join('./public/file_upload/');
    checkDirExist(rootPath);
    const filePath = path.join(rootPath, getDirName());
    checkDirExist(filePath);
    // 新的文件名
    const fileName = getFileName(`${element.name}`);
    // 创建可写流
    const upStream = fs.createWriteStream(`${filePath}/${fileName}`);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  });
  return ctx.body = "上传成功！";
});

router.post('/api/uploadsingle', async (ctx) => {
  if (!ctx.request.files || JSON.stringify(ctx.request.files.file) == '{}' || !ctx.request.files.file) {
    throw new Error('未读取到文件');
  }
  const file = ctx.request.files.file;
  if (Array.isArray(file)) {
    throw new Error('仅支持单文件上传');
  }
  if (file.size < 1000) {
    throw new Error('文件小于1kb');
  }
  const rootPath = path.join('./public/file_upload/');
  checkDirExist(rootPath);
  const filePath = path.join(rootPath, getDirName());
  const fileName = getFileName(file.name ? file.name : '');
  checkDirExist(filePath);
  await saveFile(file, `${filePath}/${fileName}`).then(() => {
    // do something like upload file to cloud.
    ctx.body = '上传成功';
  }).catch((err) => {
    throw new Error(err.message);
  });
});

router.get('/api/getdata', async (ctx) => {
  const mysqlConn = new MysqlHelper('test', 'user1');
  mysqlConn.connect();
  await mysqlConn.insert({
    "firstname": "first",
    "lastname": "last"
  })
  const result = await mysqlConn.select({"id": 1});
  console.log(result);

  ctx.body = result;
});

app.use(router.routes());

app.listen(3000);

console.log("Server is running on port 3000");

const saveFile = (file: any, path: string) => {
  return new Promise((resolve, reject) => {
    const reader = fs.createReadStream(file.path);
    // console.log({ name: file.name, size: file.size, path: `${filePath}/${fileName}` });
    const writeStream = fs.createWriteStream(path);
    reader.pipe(writeStream);
    writeStream.on('finish', () => {
      resolve(true);
    });
    writeStream.on('error', (err) => {
      reject(err);
    });
  });
}

const getDirName: () => string = (): string => {
  const date = new Date();
  const monthNumber: number = date.getMonth() + 1;
  const month: string = monthNumber.toString().length > 1 ? monthNumber.toString() : `0${monthNumber}`;
  const dir: string = `${date.getFullYear()}${month}${date.getDate()}`;
  return dir;
}

const getFileName: (name: string) => string = (name: string): string => {
  const now = Date.now();
  const ext = name.split('.');
  const newname = md5(`${name}|${now}`);
  const filename = `${newname}.${ext[ext.length - 1]}`;
  return filename;
}

const checkDirExist: (dir: string) => void = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}
