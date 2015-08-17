let FormatMixin = {

  toFormatMinutesSeconds: function(totalSeconds, human=false) {

    let minutes = parseInt(totalSeconds / 60),
        seconds = (totalSeconds % 60).toFixed(0),
        formatMinutes,
        formatSeconds,
        format;

    if (human) {
      formatMinutes = minutes > 0 ? minutes + (minutes > 1 ? 'm ' : 'm ') + '' : '';
      formatSeconds = seconds + 's';
    } else {
      formatMinutes = this.addZero(minutes) + ':';
      formatSeconds = this.addZero(seconds);
    }

    format = formatMinutes + formatSeconds;
    return format;
  },
  addZero: function(number) {
    return number < 10 ? '0' + number : number;
  },

}

export default FormatMixin;
