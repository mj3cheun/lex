import { h } from 'preact';
import linkState from 'linkstate';
import { bind } from 'decko';
import { Builder } from '../../builder';

/**
 * A visual interaction mechanism for supplying values
 * to an `OptionState`. By default, this is registered as
 * the `Builder` for `OptionState`s.
 *
 * @example
 * lex.registerBuilder(OptionState, OptionBuilder)
 */
export class OptionBuilder extends Builder {
  constructor () {
    super();
    this.state.options = [];
  }

  cleanupListeners () {
    super.cleanupListeners();
    if (this.machineState) {
      this.machineState.removeListener('options changed', this.onOptionsChanged);
      this.machineState.removeListener('value changed', this.onValueChanged);
    }
  }

  connectListeners () {
    super.connectListeners();
    this.machineState.on('options changed', this.onOptionsChanged);
    this.machineState.on('value changed', this.onValueChanged);
  }

  @bind
  handleKeyDown (e) {
    let consumed = true;
    this.unboxedValue = e.target.value;
    switch (e.code) {
      case 'Enter':
      case 'Tab':
        consumed = this.requestTransition(); // only consume the event if the transition succeeds
        break;
      case 'Backspace':
        if (e.target.value === undefined || e.target.value === null || e.target.value.length === 0) {
          this.requestRewind();
        } else {
          consumed = false;
        }
        break;
      case 'Escape':
        this.requestCancel();
        break;
      default:
        consumed = false;
    }
    if (consumed) {
      e.stopPropagation();
      e.preventDefault();
    }
  }

  @bind
  handleKeyUp (e) {
    this.unboxedValue = e.target.value;
    this.machineState.template.refreshOptions(e.target.value);
  }

  focus () {
    if (this.textInput) this.textInput.focus();
  }

  @bind
  onOptionsChanged (newOptions) {
    this.setState({options: newOptions});
  }

  @bind
  onValueChanged (newValue) {
    if (newValue) {
      this.setState({typedText: newValue.key});
    }
  }

  renderReadOnly (props, state) {
    if (this.machineState.value) {
      return (
        <span className={state.valid ? 'token-input' : 'token-input invalid'}>{this.machineState.value.shortKey}</span>
      );
    } else {
      super.renderReadOnly(props, state);
    }
  }

  renderInteractive (props, {valid, readOnly, typedText}) {
    return (
      <input type='text'
        className={valid ? 'token-input active' : 'token-input invalid'}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        value={typedText}
        onInput={linkState(this, 'typedText')}
        onFocus={this.requestFocus}
        onBlur={this.requestBlur}
        ref={(input) => { this.textInput = input; }}
        disabled={readOnly} />
    );
  }
}
