
export const options = (store) => [
    {
        name: 'target',
        type: 'autocomplete',
        message: 'Who do you want to greet?',
        choices: store.history,
        suggestOnly: true,
        validate: (val) => val && val.length > 0
    }
]

export const store = {
    history: []
}

export const run = async ({ target }, { store }) => {
    if (!store.history.includes(target)) store.history.push(target)
    console.log(`Hello ${target}`)
}