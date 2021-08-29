
export const options = [
  {
    name: 'target',
    type: 'input',
    message: 'Who do you want to greet?'
  }
]

export const run = async ({ target }) => {
  console.log(`Hello ${target}`)
}
