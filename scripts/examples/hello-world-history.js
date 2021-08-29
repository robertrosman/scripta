
export const options = [
    {
        name: 'target',
        type: 'autocomplete',
        message: 'Who do you want to greet?',
        suggestOnly: true,
        validate: (val) => val && val.length > 0
    }
]

export const interactiveOptions = (store, parsedOptions) => {
    options.find(o => o.name === 'target').choices = store.history
    return options
}

export const store = {
    history: []
}

export const run = async ({ target }, { store }) => {
    if (!store.history.includes(target)) store.history.push(target)
    console.log(`Hello ${target}`)
}