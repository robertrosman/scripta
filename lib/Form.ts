import prompts from 'prompts'
import fuzzy from 'fuzzy'

export class Form {
  questions: any[]

  constructor(questions: any[], answers = {}) {
    this.questions = questions.filter(q => !q.argumentOnly);
    prompts.override(answers)
    this.applyCustomizations();
  }

  private applyCustomizations() {
    this.handleWhenFunction();
    this.handleStringChoices();
    this.handleSuggestOnly();
  }

  private handleWhenFunction() {
    this.questions.filter(q => typeof q.when === 'function').forEach(q => {
      const stringType = q.type.toString()
      q.type = (prev, values) => !!q.when(values) ? stringType : null
    });
  }

  private handleStringChoices() {
    this.questions.filter(q => Array.isArray(q.choices)).forEach(q => {
      q.choices = q.choices.map(c => 
        typeof c === 'string' ? { title: c } : c
      )
    });
  }

  private handleSuggestOnly() {
    this.questions.filter(q => q.type === 'autocomplete' && !!q.suggestOnly).forEach(q => {
      // implementation from this issue https://github.com/terkelg/prompts/issues/131
      q.onState = function () {
        this.fallback = { title: this.input };
    
        // Check to make sure there are no suggestions so we do not override a suggestion
        if (this.suggestions.length === 0) {
            this.value = this.input;
        }
      }
    })
  }

  async run(): Promise<Record<string, any>> {
    // this.generateAutocompleteSource(formQuestions)
    return await prompts(this.questions)
  }

  inject(answers: any[]) {
    prompts.inject(answers)
  }

  // generateAutocompleteSource(questions) {
  //   questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
  //     o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original)
  //   })
  // }
}