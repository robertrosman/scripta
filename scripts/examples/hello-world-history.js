import { Script } from 'zse'

export default new Script({
  name: 'examples/hello-world-history',

  options: (store) => [
    {
      name: 'target',
      type: 'autocomplete',
      message: 'Who do you want to greet?',
      choices: store.history,
      suggestOnly: true,
      validate: (val) => val && val.length > 0
    }
  ],

  store: {
    history: []
  },

  command: async ({ target }, { store }) => {
    if (!store.history.includes(target)) store.history.push(target)
    console.log(`Hello ${target}`)
  }

})