"use strict";
//format用 https://github.com/kaerugit/VuejsTableInput/blob/master/javascript/doracomponent.js から拝借
//var format:any = {}
Object.defineProperty(exports, "__esModule", { value: true });
//小数点
var DECIMAL_SEPARATOR = ".";
//通貨区切り
var THOUSANDS_SEPARATOR = ",";
var formatTypes;
(function (formatTypes) {
    //未設定（文字列）
    formatTypes[formatTypes["none"] = 0] = "none";
    //頭0埋め
    formatTypes[formatTypes["zero"] = 1] = "zero";
    //金額
    formatTypes[formatTypes["currency"] = 2] = "currency";
    //日付
    formatTypes[formatTypes["date"] = 3] = "date";
    //パーセント
    formatTypes[formatTypes["parcent"] = 4] = "parcent";
})(formatTypes || (formatTypes = {}));
var Format = /** @class */ (function () {
    function Format() {
    }
    Format.GetFormatType = function (formatString) {
        var formattype = formatTypes.none;
        if (formatString != null && formatString.length > 0) {
            if (formatString.substr(0, 2) == "00") { //if (formatString.startsWith("00")) {                              
                formattype = formatTypes.zero;
            }
            else if (formatString.substr(-1, 1) == "%") { //if (formatString.endsWith("%")) {      /* パーセント系*/
                formattype = formatTypes.parcent;
            }
            else if (formatString.indexOf("/") != -1 || formatString.indexOf(":") != -1 || formatString.indexOf(".f") != -1) { /*日付系*/
                formattype = formatTypes.date;
            }
            else if (formatString.indexOf(THOUSANDS_SEPARATOR) != -1 ||
                formatString.indexOf(DECIMAL_SEPARATOR) != -1 ||
                formatString.indexOf("#") != -1 ||
                formatString == "0") { /*数値系*/
                formattype = formatTypes.currency;
            }
        }
        return formattype;
    };
    /**
    * 値(DB)→表示(html)変換
    * @param value
    * @param formatString
    */
    Format.ParseFormat = function (value, formatString) {
        if (value == null) {
            return null;
        }
        //値をそのまま戻す
        if (formatString == null || formatString.length == 0 || value.toString().length == 0) {
            return value;
        }
        var formattype = Format.GetFormatType(formatString);
        if (formattype == formatTypes.none) {
            return value;
        }
        var motoValue = value;
        value = value.toString();
        if (formattype == formatTypes.parcent) {
            formatString = formatString.replace("%", "");
            value = value.replace("%", "");
        }
        switch (formattype) {
            case formatTypes.zero:
                if (value.length > 0 && value.length != formatString.length) {
                    value = (formatString + value).toString();
                    value = value.substr(value.length - formatString.length);
                }
                break;
            case formatTypes.currency:
            case formatTypes.parcent:
                //value = value.replace(new RegExp(format.THOUSANDS_SEPARATOR, 'g'), "");
                var errorFlag = false;
                //整数と小数にわける
                //let [seisu, shosu = ""] = value.split(format.DECIMAL_SEPARATOR);
                var sep = value.split(DECIMAL_SEPARATOR);
                var seisu = sep[0];
                var shosu = "";
                if (sep.length > 1) {
                    shosu = sep[1];
                }
                //let [seisuformat, shosuformat = ""] = formatString.split(format.DECIMAL_SEPARATOR);
                sep = formatString.split(DECIMAL_SEPARATOR);
                var seisuformat = sep[0];
                var shosuformat = "";
                if (sep.length > 1) {
                    shosuformat = sep[1];
                }
                //1 → 100 にする
                if (formattype == formatTypes.parcent && seisu.length > 0) {
                    shosu += "000";
                    shosu = shosu.substr(0, 2) + DECIMAL_SEPARATOR + shosu.substr(2);
                    value = seisu + shosu;
                    //[seisu, shosu = ""] = value.split(format.DECIMAL_SEPARATOR);
                    sep = value.split(DECIMAL_SEPARATOR);
                    seisu = sep[0];
                    shosu = "";
                    if (sep.length > 1) {
                        shosu = sep[1];
                    }
                    var seisuAny = +seisu;
                    if (isNaN(seisuAny) == true) {
                        errorFlag = true;
                    }
                    else {
                        seisu = parseInt(seisu).toString();
                    }
                }
                if (seisuformat.indexOf(THOUSANDS_SEPARATOR) != -1) {
                    seisu = seisu.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR); //カンマ区切り
                    if (value == "0" && seisuformat.substr(-1, 1) == "#") {
                        seisu = "";
                    }
                }
                if (shosuformat.length > 0) {
                    shosu = shosu + shosuformat;
                    shosu = DECIMAL_SEPARATOR + shosu.substring(0, shosuformat.length);
                }
                else {
                    shosu = "";
                }
                var valueAny = +value;
                if (errorFlag == true || isNaN(valueAny) == true) {
                    value = motoValue; //元の値をセット
                }
                else {
                    value = seisu + shosu;
                    if (formattype == formatTypes.parcent) {
                        if (value.length > 0 && value.substr(-1, 1) != "%") {
                            value += "%";
                        }
                    }
                }
                break;
            case formatTypes.date:
                //console.log("transform:" + value);
                if (value.length != 0) {
                    var dateValuetemp = Format.changeDateValue(value);
                    if (dateValuetemp == null || isNaN(+dateValuetemp)) {
                        //value = "";
                    }
                    else {
                        var dateValue = new Date(+dateValuetemp);
                        value = formatString;
                        var year = dateValue.getFullYear().toString();
                        var month = (dateValue.getMonth() + 1).toString();
                        var day = dateValue.getDate().toString();
                        var hour = dateValue.getHours().toString();
                        var minute = dateValue.getMinutes().toString();
                        var second = dateValue.getSeconds().toString();
                        var milli = dateValue.getMilliseconds().toString() + '000';
                        milli = milli.substr(0, 3);
                        value = value.replace("yyyy", year);
                        value = value.replace("yy", year.substr(2));
                        value = value.replace("MM", month.length == 1 ? "0" + month : month);
                        value = value.replace("M", month);
                        value = value.replace("dd", day.length == 1 ? "0" + day : day);
                        value = value.replace("d", day);
                        value = value.replace("HH", hour.length == 1 ? "0" + hour : hour);
                        value = value.replace("H", hour);
                        value = value.replace("mm", minute.length == 1 ? "0" + minute : minute);
                        value = value.replace("m", minute);
                        value = value.replace("ss", second.length == 1 ? "0" + second : second);
                        value = value.replace("s", second);
                        value = value.replace("fff", milli);
                    }
                }
                break;
        }
        return value;
    };
    Format.changeDateValue = function (value) {
        value = value.replace("T", " ");
        value = value.replace("Z", "");
        // / を - に置換
        value = value.replace(/\//g, "-");
        var reg = new RegExp("[^\\:\\-\\s0-9\.]");
        //変な文字を含んでいたら終了
        if (value.match(reg)) {
            return null;
        }
        //ミリ秒をとる
        var millistring = "000";
        var millisep = value.split(".");
        if (millisep.length > 1) {
            value = millisep[0];
            millistring = millisep[1];
        }
        //let [datestring, timestring = ""] = value.split(" ");
        var sep = value.split(" ");
        var datestring = sep[0];
        var timestring = "";
        if (sep.length > 1) {
            timestring = sep[1];
        }
        var nowDateTime = new Date();
        //年・月・日・曜日を取得する
        var year = nowDateTime.getFullYear().toString();
        var month = (nowDateTime.getMonth() + 1).toString();
        //var week = nowDateTime.getDay().toString();
        var day = nowDateTime.getDate().toString();
        var hour = "0"; //= nowDateTime.getHours().toString();
        var minute = "0"; // = nowDateTime.getMinutes().toString();
        var second = "0"; //= nowDateTime.getSeconds().toString();
        //時刻のみ
        if (value.indexOf(":") != -1 && timestring.length == 0) {
            year = "1900";
            month = "1";
            day = "1";
            timestring = datestring;
            datestring = "";
        }
        if (datestring.length > 0) {
            var arr = datestring.split("-");
            if (arr.length == 2) {
                if (arr[0].length == 4) { //4桁の場合は　年/月とみなす
                    year = arr[0];
                    month = arr[1];
                    day = "1";
                }
                else { //こちらは　月、日とみなす
                    month = arr[0];
                    day = arr[1];
                }
            }
            else if (arr.length == 3) { //年月日入っている場合
                if (arr[0].length == 2) {
                    year = year.substring(0, 2) + arr[0];
                }
                else {
                    year = arr[0];
                }
                month = arr[1];
                day = arr[2];
            }
            else {
                return null;
            }
        }
        if (timestring.length > 0) {
            var arr = timestring.split(":");
            if (arr.length == 2) {
                hour = arr[0];
                minute = arr[1];
                second = "0";
            }
            else if (arr.length == 3) {
                hour = arr[0];
                minute = arr[1];
                second = arr[2];
            }
            else {
                return null;
            }
        }
        nowDateTime = new Date(+year, parseInt(month) - 1, +day, +hour, +minute, +second, +millistring);
        //時刻型かどうかの確認
        if (parseInt(nowDateTime.getFullYear().toString()) != parseInt(year)) {
            return null;
        }
        if (parseInt((nowDateTime.getMonth() + 1).toString()) != parseInt(month)) {
            return null;
        }
        if (parseInt((nowDateTime.getDate()).toString()) != parseInt(day)) {
            return null;
        }
        if (parseInt((nowDateTime.getHours()).toString()) != parseInt(hour)) {
            return null;
        }
        if (parseInt((nowDateTime.getMinutes()).toString()) != parseInt(minute)) {
            return null;
        }
        if (parseInt(nowDateTime.getSeconds().toString()) != parseInt(second)) {
            return null;
        }
        if (parseInt(nowDateTime.getMilliseconds().toString()) != parseInt(millistring)) {
            return null;
        }
        return nowDateTime.getTime();
    };
    return Format;
}());
exports.Format = Format;
//export {format} ;
