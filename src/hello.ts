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