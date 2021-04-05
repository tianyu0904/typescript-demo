import fs from 'fs';

const date = Date.now();

const info = {
  fileName: "testfile.json",
  createtime: date,
  data: [
    {
      firstname: "aaa",
      lastname: "aaa"
    },
    {
      firstname: "bbb",
      lastname: "bbb"
    }
  ]
}

// 异步写入
console.log("异步文件写入开始");
fs.writeFile('./public/file_saved/write_1.json', JSON.stringify(info), function (err) {
  if (err) {
    return console.error(err);
  }
  console.log("异步写入成功！");
});
console.log("异步文件写入结束");

// 同步写入
console.log("同步文件写入开始");
fs.writeFileSync('./public/file_saved/write_2.json', JSON.stringify(info));
console.log("同步写入成功！");
console.log("同步文件写入结束");