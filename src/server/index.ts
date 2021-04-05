import Koa from 'koa';
import Router from "koa-router";
import KoaBody from "koa-body";
import md5 from 'md5';
import fs from "fs";
import path from "path";

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
    const filePath = getUploadDirName();
    checkDirExist(filePath);
    // 新的文件名
    const fileName = getNewFileName(`${element.name}`);
    // 创建可写流
    const upStream = fs.createWriteStream(`${filePath}/${fileName}`);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  });
  return ctx.body = "上传成功！";
});

app.use(router.routes());

app.listen(3000);

console.log("Server is running on port 3000");

const getUploadDirName: () => string = (): string => {
  const date = new Date();
  const monthNumber: number = date.getMonth() + 1;
  const month: string = monthNumber.toString().length > 1 ? monthNumber.toString() : `0${monthNumber}`;
  const dir: string = `${date.getFullYear()}${month}${date.getDate()}`;
  return path.join('./public/file_upload/', dir);
}

const checkDirExist: (dir: string) => void = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
}

const getNewFileName: (name: string) => string = (name: string): string => {
  const now = Date.now();
  const ext = name.split('.');
  const newname = md5(`${name}|${now}`);
  const filename = `${newname}.${ext[ext.length - 1]}`;
  return filename;
}