
//format用 https://github.com/kaerugit/VuejsTableInput/blob/master/javascript/doracomponent.js から拝借
//var format:any = {}

//小数点
const DECIMAL_SEPARATOR = "."

//通貨区切り
const THOUSANDS_SEPARATOR = ","


enum formatTypes {
    //未設定（文字列）
    none = 0,
    //頭0埋め
    zero = 1,
    //金額
    currency = 2,
    //日付
    date = 3,
    //パーセント
    parcent = 4
}


export class Format {

    private static  GetFormatType = function (formatString: string): formatTypes {
        let formattype = formatTypes.none;

        if (formatString != null && formatString.length > 0) {
            if (formatString.substr(0, 2) == "00") { //if (formatString.startsWith("00")) {                              
                formattype = formatTypes.zero;
            }
            else if (formatString.substr(-1, 1) == "%") { //if (formatString.endsWith("%")) {      /* パーセント系*/
                formattype = formatTypes.parcent;
            }
            else if (formatString.indexOf("/") != -1 || formatString.indexOf(":") != -1 || formatString.indexOf(".f") != -1) {  /*日付系*/
                formattype = formatTypes.date;
            }
            else if (
                formatString.indexOf(THOUSANDS_SEPARATOR) != -1 ||
                formatString.indexOf(DECIMAL_SEPARATOR) != -1 ||
                formatString.indexOf("#") != -1 ||
                formatString == "0"
            ) {   /*数値系*/
                formattype = formatTypes.currency;
            }
        }
        return formattype;
    }


    /**
    * 値(DB)→表示(html)変換
    * @param value
    * @param formatString
    */
   static  ParseFormat = function (value: string, formatString: string): any {

        if (value == null) {
            return null;
        }

        //値をそのまま戻す
        if (formatString == null || formatString.length == 0 || value.toString().length == 0) {
            return value;
        }

        let formattype = Format.GetFormatType(formatString);

        if (formattype == formatTypes.none) {
            return value;
        }

        let motoValue = value;
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
                let errorFlag = false;

                //整数と小数にわける
                //let [seisu, shosu = ""] = value.split(format.DECIMAL_SEPARATOR);
                let sep = value.split(DECIMAL_SEPARATOR);
                let seisu = sep[0];
                let shosu = "";
                if (sep.length > 1) {
                    shosu = sep[1];
                }

                //let [seisuformat, shosuformat = ""] = formatString.split(format.DECIMAL_SEPARATOR);
                sep = formatString.split(DECIMAL_SEPARATOR);
                let seisuformat = sep[0];
                let shosuformat = "";
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

                    let seisuAny = +seisu;
                    if (isNaN(seisuAny) == true) {
                        errorFlag = true;
                    }
                    else {
                        seisu = parseInt(seisu).toString();
                    }
                }


                if (seisuformat.indexOf(THOUSANDS_SEPARATOR) != -1) {
                    seisu = seisu.replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);       //カンマ区切り

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

                let valueAny = +value;

                if (errorFlag == true || isNaN(valueAny) == true) {
                    value = motoValue;      //元の値をセット
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
                    let dateValuetemp = Format.changeDateValue(value);

                    if (dateValuetemp == null || isNaN(+dateValuetemp)) {
                        //value = "";
                    }
                    else {
                        let dateValue = new Date(+dateValuetemp);

                        value = formatString;
                        let year = dateValue.getFullYear().toString();
                        let month = (dateValue.getMonth() + 1).toString();
                        let day = dateValue.getDate().toString();

                        let hour = dateValue.getHours().toString();
                        let minute = dateValue.getMinutes().toString();
                        let second = dateValue.getSeconds().toString();
                        let milli = dateValue.getMilliseconds().toString() + '000';
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

    }


    private static changeDateValue = function (value: string): any {

        value = value.replace("T", " ");
        value = value.replace("Z", "");
        // / を - に置換
        value = value.replace(/\//g, "-");


        let reg = new RegExp("[^\\:\\-\\s0-9\.]");
        //変な文字を含んでいたら終了
        if (value.match(reg)) {
            return null;
        }

        //ミリ秒をとる
        let millistring = "000";
        let millisep = value.split(".");
        if (millisep.length > 1) {
            value = millisep[0];
            millistring = millisep[1];
        }

        //let [datestring, timestring = ""] = value.split(" ");
        let sep = value.split(" ");
        let datestring = sep[0];
        let timestring = "";
        if (sep.length > 1) {
            timestring = sep[1];
        }


        let nowDateTime = new Date();

        //年・月・日・曜日を取得する
        let year = nowDateTime.getFullYear().toString();
        let month = (nowDateTime.getMonth() + 1).toString();
        //var week = nowDateTime.getDay().toString();
        let day = nowDateTime.getDate().toString();

        let hour = "0";//= nowDateTime.getHours().toString();
        let minute = "0";// = nowDateTime.getMinutes().toString();
        let second = "0";//= nowDateTime.getSeconds().toString();

        //時刻のみ
        if (value.indexOf(":") != -1 && timestring.length == 0) {
            year = "1900";
            month = "1";
            day = "1";
            timestring = datestring;
            datestring = "";
        }


        if (datestring.length > 0) {
            let arr = datestring.split("-");

            if (arr.length == 2) {
                if (arr[0].length == 4) {   //4桁の場合は　年/月とみなす
                    year = arr[0];
                    month = arr[1];
                    day = "1";
                }
                else {      //こちらは　月、日とみなす
                    month = arr[0];
                    day = arr[1];
                }
            }
            else if (arr.length == 3) {      //年月日入っている場合
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
            let arr = timestring.split(":");
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

    }
}


//export {format} ;