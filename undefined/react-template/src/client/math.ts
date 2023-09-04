export const add = (a, b) => {
  console.log(a + b)
}

export const minus = (a, b) => {
  console.log(a - b)
}


const a = <T>(value: T): T => value;

console.log(a(2), 'ab');