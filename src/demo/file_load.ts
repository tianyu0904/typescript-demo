import fs from 'fs';

// 异步读取
const readfileAsync = (path: string) => {
  fs.readFile(path, 'utf-8', (err, data) => {
    if (err) {
      console.error(err.message);
    }
    console.log(data);
  });
}

console.log('异步读取文件');
readfileAsync('./public/file_saved/config.json');
console.log('异步读取结束');

// 同步读取
console.log('同步读取文件');
const data = fs.readFileSync('./public/file_saved/config.json');
console.log("同步读取: " + data.toString());
console.log('同步读取结束');

console.log("程序执行完毕。");