import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { DatePickerAndroid, TimePickerAndroid } from 'react-native';
import moment from 'moment';

export default class CustomDatePickerAndroid extends PureComponent {
  static propTypes = {
    date: PropTypes.instanceOf(Date),
    mode: PropTypes.oneOf(['date', 'time', 'datetime']),
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHideAfterConfirm: PropTypes.func,
    disableWeekend: PropTypes.bool,
    is24Hour: PropTypes.bool,
    isVisible: PropTypes.bool,
    datePickerModeAndroid: PropTypes.oneOf(['calendar', 'spinner', 'default']),
    minimumDate: PropTypes.instanceOf(Date),
    maximumDate: PropTypes.instanceOf(Date),
  };

  static defaultProps = {
    date: new Date(),
    mode: 'date',
    datePickerModeAndroid: 'default',
    disableWeekend: false,
    is24Hour: true,
    isVisible: false,
    onHideAfterConfirm: () => {},
  };

  componentDidUpdate = prevProps => {
    if (!prevProps.isVisible && this.props.isVisible) {
      if (this.props.mode === 'date' || this.props.mode === 'datetime') {
        this._showDatePickerAndroid();
      } else {
        this._showTimePickerAndroid();
      }
    }
  };

  componentDidMount = () => {
    if (this.props && this.props.isVisible) {
      if (this.props.mode === 'date' || this.props.mode === 'datetime') {
        this._showDatePickerAndroid();
      } else {
        this._showTimePickerAndroid();
      }
    }
  };

  _showDatePickerAndroid = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: this.props.date,
        minDate: this.props.minimumDate,
        maxDate: this.props.maximumDate,
        mode: this.props.datePickerModeAndroid,
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        let date;
        if (this.props.date && !isNaN(this.props.date.getTime())) {
          let hour = moment(this.props.date).hour();
          let minute = moment(this.props.date).minute();
          date = moment({ year, month, day, hour, minute }).toDate();
        } else {
          date = moment({ year, month, day }).toDate();
        }

        if (this.props.mode === 'datetime') {
          // Prepopulate and show time picker
          const timeOptions = { is24Hour: this.props.is24Hour };
          if (this.props.date) {
            timeOptions.hour = moment(this.props.date).hour();
            timeOptions.minute = moment(this.props.date).minute();
          }
          const { action: timeAction, hour, minute } = await TimePickerAndroid.open(timeOptions);
          if (timeAction !== TimePickerAndroid.dismissedAction) {
            const selectedDate = new Date(year, month, day, hour, minute);
            this.props.onConfirm(selectedDate);
            this.props.onHideAfterConfirm(selectedDate);
          } else {
            this.props.onCancel();
          }
        } else {
          this.props.onConfirm(date);
          this.props.onHideAfterConfirm(date);
        }
      } else {
        this.props.onCancel();
      }
    } catch ({ code, message }) {
      console.warn('Cannot open date picker', message);
    }
  };

  _is_weekend = (date) => {
    const dt = new Date(date);
    if(dt.getDay() == 6 || dt.getDay() == 0)
      return true;
    else
      return false;
  }

  _showTimePickerAndroid = async () => {
    try {
      const { action, hour, minute } = await TimePickerAndroid.open({
        hour: moment(this.props.date).hour(),
        minute: moment(this.props.date).minute(),
        is24Hour: this.props.is24Hour,
      });
      if (action !== TimePickerAndroid.dismissedAction) {
        let date;
        if (this.props.date) {
          // This prevents losing the Date elements, see issue #71
          const year = moment(this.props.date).year();
          const month = moment(this.props.date).month();
          const day = moment(this.props.date).date();
          date = moment({ year, month, day, hour, minute }).toDate();
        } else {
          date = moment({ hour, minute }).toDate();
        }
        this.props.onConfirm(date);
        this.props.onHideAfterConfirm(date);
      } else {
        this.props.onCancel();
      }
    } catch ({ code, message }) {
      console.warn('Cannot open time picker', message);
    }
  };

  render() {
    return null;
  }
}
