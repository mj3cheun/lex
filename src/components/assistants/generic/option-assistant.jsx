import { h } from 'preact';
import { bind } from 'decko';
import { Assistant } from '../../assistant';

/**
 * A visual interaction mechanism for supplying values
 * to an `OptionState`. By default, this is registered as
 * the `Assistant` for `OptionState`s.
 *
 * @example
 * lex.registerAssistant(OptionState, OptionAssistant)
 */
export class OptionAssistant extends Assistant {
  constructor () {
    super();
    this.state.options = [];
    this.state.activeOption = -1;
    this.state.suggestions = [];
  }

  @bind
  onOptionsChange (newOptions) {
    this.setState({
      options: newOptions,
      unboxedValue: undefined,
      activeOption: -1,
      suggestions: newOptions.slice(0, 10)
    });
  }

  @bind
  onUnboxedValueChangeAttempted (newUnboxedValue) {
    const val = newUnboxedValue === undefined ? newUnboxedValue = '' : newUnboxedValue.toLowerCase();
    this.setState({
      unboxedValue: newUnboxedValue,
      suggestions: this.state.options.filter(o => o.key.toLowerCase().startsWith(val)).slice(0, 10)
    });
  }

  @bind
  onOptionSelected (key) {
    this.machineState.unboxedValue = key;
    this.requestTransition();
  }

  processProps (props) {
    this.cleanupListeners();
    super.processProps(props);
    if (this.machineState) {
      this.machineState.on('options changed', this.onOptionsChange);
      this.machineState.on('unboxed value change attempted', this.onUnboxedValueChangeAttempted);
      this.setState({
        options: this.machineState.template.options,
        unboxedValue: undefined,
        activeOption: -1,
        suggestions: this.machineState.template.options.slice(0, 10)
      });
    }
    // TODO do we need to modify validation state?
  }

  cleanupListeners () {
    if (this.machineState) {
      this.machineState.removeListener('options changed', this.onOptionChange);
      this.machineState.removeListener('unboxed value change attempted', this.onUnboxedValueChangeAttempted);
    }
  }

  componentWillUnmount () {
    this.cleanupListeners();
  }

  delegateEvent (e) {
    let consumed = true;
    switch (e.code) {
      case 'ArrowUp':
        this.setState({activeOption: Math.max(this.state.activeOption - 1, 0)});
        break;
      case 'ArrowDown':
        this.setState({activeOption: Math.min(this.state.activeOption + 1, this.state.suggestions.length - 1)});
        break;
      case 'Enter':
      case 'Tab':
        const activeOption = this.state.suggestions[this.state.activeOption];
        if (activeOption) {
          this.machineState.value = activeOption;
          this.requestTransition();
        }
        break;
      default:
        consumed = true;
        break;
    }
    if (consumed) {
      e.stopPropagation();
      e.preventDefault();
    }
    return consumed;
  }

  renderInteractive (props, {activeOption, suggestions}) {
    if (suggestions && suggestions.length > 0) {
      return (
        <div>
          <div className='assistant-header'>
            {this.machineState.name}
            <span className='pull-right'><strong>&#129045;&#129047;</strong> to navigate&nbsp;&nbsp;&nbsp;<strong>Tab</strong> to select</span>
          </div>
          <div className='assistant-body'>
            <ul>
              {
                suggestions.map((o, idx) => <li tabIndex='0' onClick={() => this.onOptionSelected(o.key)} className={idx === activeOption ? 'active' : ''}>{o.key}</li>)
              }
            </ul>
          </div>
        </div>
      );
    }
  }
}
