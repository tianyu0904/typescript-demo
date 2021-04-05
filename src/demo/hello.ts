console.log('Hello World!');

function sayHello1(person: string) {
  return 'Hello, ' + person;
}

let user1 = 'Tom';
console.log(sayHello1(user1));

function sayHello2(person: string) {
  if (typeof person === 'string') {
    return 'Hello, ' + person;
  } else {
    throw new Error('person is not a string');
  }
}

let user2 = 'Tom';
console.log(sayHello2(user2));

// 函数声明（Function Declaration）
function sum(x: number, y: number): number {
  return x + y;
}

// 函数表达式（Function Expression）
let mysum: (x: number, y: number) => number = function (x: number, y: number): number {
  return x + y;
}

// ES6 箭头函数
let mysum2: (x: number, y: number) => number = (x: number, y: number): number => {
  return x + y;
}

console.log(sum(1, 2), mysum(2, 3), mysum2(3, 4));

function reverse(x: number): number;
function reverse(x: string): string;
function reverse(x: number | string): number | string {
  if (typeof x === 'number') {
    return Number(x.toString().split('').reverse().join(''));
  } else if (typeof x === 'string') {
    return x.split('').reverse().join('');
  } else {
    throw new Error('parameter is not number or string');
  }
}

console.log(reverse(123456789));
console.log(reverse("Hello World"));
