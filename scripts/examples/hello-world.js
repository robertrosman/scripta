
export const options = [
  {
    name: 'target',
    type: 'input',
    message: 'Who do you want to greet?'
  }
]

export const command = async ({ target }) => {
  console.log(`Hello ${target}`)
}
