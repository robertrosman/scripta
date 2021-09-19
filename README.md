Scripta
=======

Manage and run your command line scripts like a boss. Scripta will help you write, remember and run your scripts.

![Screencast demo](https://raw.githubusercontent.com/robertrosman/scripta/main/assets/screencast-min.gif)

Declare options in your scripts and run interactively or with command line arguments. Tab completion, help messages, persistence and more works out of the box!

Getting started
---------------

Install Scripta globally so you have access to the command `scripta` anywhere.

    $ npm i -g scripta

Create new scripts
------------------

### Minimal example

All scripts live in the scripts folder. You can create new subfolders to categorize your scripts. The smallest possible script to be executed would look like this:

    export const command = async () => console.log(`Hello world`)

You _can_ create scripts that simply exports the variables `command` (required), `options` and `store` (both optional). However, we can do better than this. How about:

* more autocompletion help from your editor with a little Typescript help (even though scripts are written in Javascript)
* ability to run your script directly like `$ ./scripts/your-script.js` if you'd like
* running a script programmatically from another script
* and more!

### The Script class

So the same script based on the Script class would instead look like this:

    #!/usr/bin/env scripta
    import { Script } from 'scripta'

    export default new Script({
        name: "examples/hello-world-simple",
        command: async () => console.log(`Hello world`)
    })

The first line is a classic [shebang](https://en.wikipedia.org/wiki/Shebang_(Unix)), making the script executable as a standalone, if you run `$ chmod +x ./scripts/your-script.js` first. You may however always run your scripts through Scripta, so you _don't need_ the shebang.

Next we import the Script class and export a new instance of it, given the proper definitions as the first argument.

For the sake of simplicity, you'll probably want to run the command `$ scripta add-script` to quickly set up new scripts.

### Options

So far we haven't really done anything fancy, just a simple "Hello world" script. The real power of Scripta comes when you start adding options. Let's look at this refined example:

    #!/usr/bin/env scripta
    import { Script } from 'scripta'

    export default new Script({
        name: "examples/hello-world-options",
        options: [
            {
                name: 'name',
                type: 'input',
                message: 'Who do you want to greet?'
            }
        ],

        command: async ({ name }) => {
            console.log(`Hello ${name}!`)
        }
    })

Options are formatted as [inquirer.js questions](https://github.com/SBoudrias/Inquirer.js#questions), with some optional extra field (see below). By declaring what options you expect, Scripta will automagically add these as arguments to your script so you can run it like `$ scripta examples/hello-world-options --name "Bob"`. At runtime, Scripta will walk you through the remaining questions that you haven't provided.

Further down in your command you can then use the provided options as you wish.

#### Available option fields

You can set up your options just like you would with [inquirer.js questions](https://github.com/SBoudrias/Inquirer.js#questions). Please keep in mind that more advanced flows might be tricky to mimic as command line arguments, but feel free to open an issue if you think some specific scenario should be supported.

The following fields are also available on all options:

| Field               | Type     | Default value | Description
| ------------------- | -------- | ------------- | -----------
| storeDefault        | boolean  | false         | Store the last used value and set as default the next time the script is executed.
| setupOnce           | boolean  | false         | Store the used value and use for all coming executions. Will not be prompted again, but the value can be overwritten by explicitly using the command line argument.
| positionalArgument  | boolean  | false         | Give the option a fixed position, and skip the double-dash-option before. See [add-script](https://github.com/robertrosman/scripta/blob/main/scripts/add-script.js) for example, no need to specify --name before the new script name. The position of the positional argument can be before or after other options, but every positional argument must be given in the same order they are declared as options.
| argumentOnly        | boolean  | false         | Only add this option as a command line argument, don't ask for input.
| formOnly            | boolean  | false         | Only ask this question, don't add it as a command line argument.
| shorthand           | string   | undefined     | Can be used to register a shorthand property for the command line argument. For example `-n` might be set as shorthand to the `--name` option above.

### The Store

If you want to persist data between script executions, there is built in support for that. Let's add some history handling to our Hello world script:

    #!/usr/bin/env scripta
    import { Script } from 'scripta'

    export default new Script({
        name: 'examples/hello-world-history',

        options: (store) => [
            {
                name: 'name',
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

        command: async ({ name }, { store }) => {
            if (!store.history.includes(name)) store.history.push(name)
            console.log(`Hello ${name}!`)
        }

    })

There's a couple of things to notice here. First off, the options are not a static list, but rather a function. You can read more about that under the "Digging deeper section", but the key point is that all available choices are read from the store, but since suggestOnly is set to true, you can enter whatever name you like to.

Second, we're declaring a basic structure of the store. You don't need to do that to use the store, but it can be a convenient way to not have to do this kind of checking inside your actual command:

    // Redundant null checks
    if (!store.history)
        store.history = []

In this trivial example it might not be that big of a deal, but you get the idea. The structure of the store can be how deep you like. Please do not save too large amounts of data though as it might slow down the overall Scripta experience (yet to be proven). 

Third, we can access the store from the second argument to the command, namely the context object. In this state of the execution flow, store is populated with the data from previous executions, and you can both read and write values to it. Any manipulations to the store will be saved when the script is successfully completed. 

Fourth, the [inquirer plugin autocomplete](https://github.com/mokkabonna/inquirer-autocomplete-prompt) is used. It is installed by default in Scripta, so you can use it as a part of your options.


Digging deeper
--------------

### Running other scripts programmatically

You can run scripts inside other scripts like this:

    #!/usr/bin/env scripta
    import { Script } from 'scripta'
    import helloWorld from './hello-world-options.js'

    export default new Script({
        name: "examples/hello-world-import",
        command: async (options, context) => {
            options = { name: "importer" }
            const result = await helloWorld.run(options, context)
        }
    })

Make sure you pass down the context object, just in case your imported script want use something from it. You may not need to handle the result from your imported script, but you can if you want to use it for something. You may be tempted to think result will be whatever is printed to the console, but result is simply whatever the command returns inside hello-world-options.js (in this case nothing).


### Generate options dynamically

Sometimes you might want to use data from the store when you generate your options. One example is seen in the section above about the store. Scripta lets you specify a generator function that is provided with the store and returns a list of options. The second argument is the already parsed options. The function will be run again at each stage through the run - before adding command line arguments, and again before asking for user input. Keep in mind that the options argument will be undefined the first time. These might be useful if you want to build more complex options that has dependencies on each other by making use of inquirers' when/filter/etc. A simple example of how such a generator function could look like:

    options: (store, options) => [
        {
            name: 'suggestions',
            type: 'confirm',
            message: 'Set this flag if you like to get name suggestions',
            argumentOnly: true
        },

        {
            name: 'name',
            type: 'input',
            message: 'Who do you want to greet?',
            when: () => options?.suggestions !== true
        },
        {
            name: 'name',
            type: 'autocomplete',
            message: 'Who do you want to greet?',
            choices: store.history,
            suggestOnly: true,
            validate: (val) => val && val.length > 0,
            formOnly: true,
            when: () => options?.suggestions === true
        }
    ],

### Tab completion

After restarting the terminal you used to install scripta, tab completion should work out of the box. If not, try to run this command:

    $ scripta --setup-shell-init-file

and then restart your terminal. If it's still not working, try to [follow these steps](https://github.com/f/omelette#manual-installation), but replace `myprogram` with `scripta`. Tab completion will suggest what script to run, available options, and also choices specified on specific options.


Contribute
----------

Contributions are more than welcome!


Credits
-------

This project relies heavily on [Inquirer.js](https://github.com/SBoudrias/Inquirer.js), [Commander.js](https://github.com/tj/commander.js) and [Omelette](https://github.com/f/omelette). Thanks a ton to all who have invested in those amazing libraries!
