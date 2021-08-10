import { ValueState } from '../generic/value-state';

/**
 * This state supports the entry of a Number value, with possible auto-complete.
 *
 * @param {object} config - A configuration object. Supports all of the parameters from `ValueState` and `StateTemplate`,
 *                          providing defaults for `name`, `validate` (valid iff `!isNaN`) and `allowUnknown` (true).
 */
export class NumericEntryState extends ValueState {
  constructor (config) {
    if (config.name === undefined) config.name = 'Enter a value';
    if (config.validate === undefined) {
      config.validate = (val) => {
        return val && !isNaN(val.key);
      };
    }
    config.allowUnknown = true;
    super(config);
  }
}
