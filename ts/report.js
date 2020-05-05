"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var format_1 = require("./format");
var FormatEventType;
(function (FormatEventType) {
    FormatEventType[FormatEventType["Header"] = 100] = "Header";
    FormatEventType[FormatEventType["Footer"] = 200] = "Footer";
    FormatEventType[FormatEventType["Detail"] = 0] = "Detail";
    /*詳細空白行*/
    FormatEventType[FormatEventType["DetailBlank"] = 10] = "DetailBlank";
})(FormatEventType = exports.FormatEventType || (exports.FormatEventType = {}));
;
//親の要素
var PARENT_ATTRIBUTE = "oya";
var TABLE_ATTRIBUTE = "tableappend";
var GROUP_PAGE_ATTRIBUTE = "GroupPage";
var ReportPageSectionSetting = /** @class */ (function () {
    function ReportPageSectionSetting() {
        /**
         * format時のイベント
         */
        this.FormatEventFunction = null;
    }
    return ReportPageSectionSetting;
}());
exports.ReportPageSectionSetting = ReportPageSectionSetting;
var ReportGroupSectionSetting = /** @class */ (function () {
    function ReportGroupSectionSetting() {
        /**
         * テーブルタグをマージしない場合：false （tabletag not Merge : false ）
         * @param hoge {bool} -
         */
        this.IsMergeTable = true;
        /**
         * グループの連結データ(グループで使用)
         */
        this.BindField = "";
        /**
         * 改ページの場合、データを繰り返し表示(GroupHeaderのみ)
         */
        this.IsPageRepert = false;
        /**
         * グループのデータが違う場合改ページ（複数は不可） 複数必要な場合はjsonで対応しておくこと
         */
        this.IsBreakPage = false;
        /**
         *  グループの改ページ時に[[page]],[[pages]]をリセットする
         */
        this.IsPageReset = false;
        /**
         * format時のイベント
         */
        this.FormatEventFunction = null;
    }
    return ReportGroupSectionSetting;
}());
exports.ReportGroupSectionSetting = ReportGroupSectionSetting;
/**
 * セクションの設定
 */
var ReportDetailSectionSetting = /** @class */ (function () {
    function ReportDetailSectionSetting() {
        /**
         * tabletag not Merge : false
         * テーブルタグをマージしない場合：false
         * @param hoge {bool} -
         */
        this.IsMergeTable = true;
        /**
         * 空欄の件数 (Detailで使用) ページを超える場合は無視
         */
        this.DetailRepeatCount = 0;
        /**
         * データ重複時非表示Field
         */
        this.HideDuplicatesField = [];
        /**
         * format時のイベント
         */
        this.FormatEventFunction = null;
    }
    return ReportDetailSectionSetting;
}());
exports.ReportDetailSectionSetting = ReportDetailSectionSetting;
var ReportSectionSettings = /** @class */ (function () {
    function ReportSectionSettings() {
        this.Page = new ReportPageSectionSetting();
        this.Group1 = new ReportGroupSectionSetting();
        this.Group2 = new ReportGroupSectionSetting();
        this.Group3 = new ReportGroupSectionSetting();
        this.Group4 = new ReportGroupSectionSetting();
        this.Group5 = new ReportGroupSectionSetting();
        this.Group6 = new ReportGroupSectionSetting();
        this.Group7 = new ReportGroupSectionSetting();
        this.Group8 = new ReportGroupSectionSetting();
        this.Group9 = new ReportGroupSectionSetting();
        this.Detail = new ReportDetailSectionSetting();
    }
    return ReportSectionSettings;
}());
exports.ReportSectionSettings = ReportSectionSettings;
;
/**
 * Sectionの設定(ローカル用を追加)
 */
var ReportSectionData = /** @class */ (function () {
    function ReportSectionData() {
        this.FormatEventFunction = null;
        this.BindField = "";
        this.IsPageRepert = false;
        this.IsBreakPage = false;
        this.IsPageReset = false;
        this.IsMergeTable = true;
        this.DetailRepeatCount = 0;
        this.HideDuplicatesField = [];
        //◆◆pravate(外部から設定しないでください！)◆◆
        this.element = null;
        this.tableElement = null;
        this.headerElement = null;
        this.footerElement = null;
        this.detailElement = null;
        //mergetable first
        this.isFirstMergeTable = false;
        this.newElement = null;
        this.appendElement = null;
        this.findElementName = "";
    }
    return ReportSectionData;
}());
;
var ReportSectionDatas = /** @class */ (function () {
    function ReportSectionDatas() {
        this.Page = new ReportSectionData();
        this.Group1 = new ReportSectionData();
        this.Group2 = new ReportSectionData();
        this.Group3 = new ReportSectionData();
        this.Group4 = new ReportSectionData();
        this.Group5 = new ReportSectionData();
        this.Group6 = new ReportSectionData();
        this.Group7 = new ReportSectionData();
        this.Group8 = new ReportSectionData();
        this.Group9 = new ReportSectionData();
        this.Detail = new ReportSectionData();
    }
    return ReportSectionDatas;
}());
;
var Report = /** @class */ (function () {
    function Report() {
        var _this = this;
        /**
         * jsonデータ
         */
        this.Data = null;
        /**
         * 余白用のCSS(string)
         */
        this.MarginCss = "";
        /**
         * 作成後に呼び出されるfunction(普通のhtmlが作成されるので、必要であればゴリゴリすることも可)
         */
        this.ReportEndFunction = null;
        /**
         *　各セクションごとの設定
         */
        this.Section = new ReportSectionSettings();
        //ReportDataClass = new ReportSectionData();
        this.reportSectionDatas = new ReportSectionDatas();
        //ReportClassの文字列参照でエラーになるので仕方なく追加
        //readonly ReportClassAny :any = ()=>{ return this.ReportClass}
        //帳票作成用の変数
        //pageDataObject = new pageDataClass();
        //Page、Group1～Group9、Detailの名称
        this.reportkeys = [];
        //グループの配列
        this.groupArray = [];
        //マージン含まない高さ
        this.pageHeight = 0;
        //ページ処理がある場合
        this.pageFlag = false;
        this.sectionMain = null;
        this.body = null;
        this.sectionElement = null;
        //改ページの高さ
        this.breakPageHeight = 0;
        //ページ内のデータ件数
        this.pageDataCount = 0;
        //現在の仮想位置
        //CurrentDetaiTop: 0,
        //詳細を通過したかどうか
        this.isExistsDetail = false;
        this.isPageAutoBreak = false;
        //Dataの現在の行
        this.currentData = null;
        this.loopCount = 0;
        this.currentTableHeader = null;
        this.currentTableFooter = null;
        this.currentPageFooter = null;
        //ページ切り替え用　どこまで処理を行ったか
        this.pageExecuteManage = [];
        //次のページに表示するデータ(グループ繰り返し用)
        //NextPageGroupElement: [],
        //次のページに表示するデータ
        //NextPageElement: [],
        //詳細のElement
        this.currentPageDetail = null;
        this.dummyDiv = null;
        //データ連結が存在するものだけ管理(スピードUP用)
        this.keyBindList = [];
        this.run = function () {
            //データが0件
            if (_this.Data == null || _this.Data.length == 0) {
                return;
            }
            //ページ処理がある場合
            _this.pageFlag = false;
            var allHTML = document.body.innerHTML;
            if (allHTML.indexOf("[[page]]") > -1 || allHTML.indexOf("[[page]]") > -1) {
                _this.keyBindList.push("page");
                _this.keyBindList.push("pages");
                _this.pageFlag = true;
            }
            //連結項目の存在チェック
            var keys = Object.keys(_this.Data[0]);
            for (var i = 0; i < keys.length; i++) {
                if (allHTML.match(new RegExp("(\\[\\[(" + keys[i] + "|" + keys[i] + "(\\s)*\\|\\|.+?)\\]\\])", "g"))) {
                    _this.keyBindList.push(keys[i]);
                }
            }
            _this.body = document.body;
            //body.style.visibility = "hidden";
            _this.init();
            if (_this.reportSectionDatas.Detail == null) {
                //詳細データがない
                console.log('developError:NoDetail');
                return;
            }
            //最初のIsMergeTableを取得
            if (true) {
                var rc = _this.reportSectionDatas; //tsコンパイルエラー対策
                for (var i = 0; i < _this.reportkeys.length; i++) {
                    var reportdata = rc[_this.reportkeys[i]];
                    if (reportdata != null) {
                        if (reportdata.IsMergeTable == true) {
                            reportdata.isFirstMergeTable = true;
                            break;
                        }
                    }
                }
            }
            _this.sectionMain = document.createElement("section");
            _this.sectionMain.classList.add('sheet');
            if (_this.MarginCss.length > 0) {
                _this.sectionMain.classList.add(_this.MarginCss);
            }
            //section.innerHTML = "新しい要素";
            _this.body.appendChild(_this.sectionMain);
            var pageHeightPX = document.defaultView.getComputedStyle(_this.sectionMain, null).height;
            //alert(new_ele.clientHeight);    //マージン含む
            //alert(new_ele.offsetHeight);    //線含む
            //let userAgent = window.navigator.userAgent.toLowerCase();
            var pageHeightMinus = 0;
            //chromeの場合paddingをマイナスする(heightはpaddingを含まないはずなんだけど chromeの不具合？)
            //chrome headlessしか想定していないので判定削除
            //if (userAgent.indexOf("chrome") != -1) {
            pageHeightMinus =
                +(document.defaultView.getComputedStyle(_this.sectionMain, null).paddingTop.replace("px", ""))
                    +
                        +(document.defaultView.getComputedStyle(_this.sectionMain, null).paddingBottom.replace("px", ""));
            //}
            _this.body.removeChild(_this.sectionMain); //一旦削除
            //高さの取得 https://q-az.net/without-jquery-innerheight-width-outerheight-width/
            //マージン含まない高さ(小数点切り捨て)
            _this.pageHeight = Math.floor(+(pageHeightPX.replace("px", ""))) - Math.floor(pageHeightMinus);
            var dataLoopCount = _this.Data.length;
            //let existsDetail = false;
            var pageBreakFlag = false;
            var prevData = null;
            var pageResetExistsFlag = false;
            //データのループ（MainLoop） ★★★メイン処理★★★
            for (_this.loopCount = 0; _this.loopCount < dataLoopCount; _this.loopCount++) {
                var currentPageAutoBreak = _this.isPageAutoBreak;
                if (currentPageAutoBreak == false) {
                    _this.pageExecuteManage = [];
                    currentPageAutoBreak = pageBreakFlag;
                }
                pageBreakFlag = false;
                _this.currentData = _this.Data[_this.loopCount];
                var lastFlag = false;
                if ((_this.loopCount == (dataLoopCount - 1))) {
                    lastFlag = true;
                }
                //改ページ
                if (_this.loopCount == 0 || currentPageAutoBreak) {
                    prevData = null;
                    _this.addPageFunc();
                }
                _this.isExistsDetail = false;
                //★★GroupHeaderの処理★★
                var groupVisble = false;
                for (var reportdataIndex in _this.groupArray) {
                    var reportdata = _this.groupArray[reportdataIndex];
                    if (groupVisble == false) {
                        //改ページ時に再度表示
                        if ((_this.loopCount == 0) || (currentPageAutoBreak == true && reportdata.IsPageRepert)) {
                            groupVisble = true;
                        }
                        else {
                            //データが異なる場合（グループのブレーク）
                            if (reportdata.BindField.length != 0) {
                                if (_this.currentData[reportdata.BindField] != _this.Data[_this.loopCount - 1][reportdata.BindField]) {
                                    groupVisble = true;
                                    if (_this.pageFlag == true && reportdata.IsPageReset == true) {
                                        var elePageArray = document.querySelectorAll("section");
                                        elePageArray[elePageArray.length - 1].setAttribute(GROUP_PAGE_ATTRIBUTE, "");
                                        pageResetExistsFlag = true;
                                    }
                                }
                            }
                        }
                    }
                    if (groupVisble == true) {
                        prevData = null;
                        //グループの設定
                        if (reportdata.isFirstMergeTable == true) {
                            _this.addGroupFunc(TABLE_ATTRIBUTE + _this.loopCount.toString());
                        }
                        var groupName = "gh" + reportdataIndex;
                        if (currentPageAutoBreak == true && reportdata.IsPageRepert) {
                            _this.pageExecuteManage.splice(_this.pageExecuteManage.indexOf(groupName), 1);
                        }
                        if (reportdata.headerElement != null) {
                            var new_tableDetail_1 = reportdata.headerElement.cloneNode(true);
                            if (_this.addElement(FormatEventType.Header, reportdata, groupName, new_tableDetail_1) == false) {
                                return;
                            }
                            if (_this.isPageAutoBreak == true) {
                                break;
                            }
                        }
                    }
                }
                if (_this.isPageAutoBreak == true) {
                    continue;
                }
                //詳細処理
                var new_tableDetail = _this.reportSectionDatas.Detail.detailElement.cloneNode(true);
                //同じデータを非表示
                var replaceCurrentData = null;
                if (_this.reportSectionDatas.Detail.HideDuplicatesField.length > 0) {
                    if (prevData != null) {
                        replaceCurrentData = JSON.parse(JSON.stringify(_this.currentData));
                        for (var i = 0; i < _this.reportSectionDatas.Detail.HideDuplicatesField.length; i++) {
                            var field = _this.reportSectionDatas.Detail.HideDuplicatesField[i];
                            if (replaceCurrentData[field] == prevData[field]) {
                                replaceCurrentData[field] = null;
                            }
                        }
                    }
                    prevData = JSON.parse(JSON.stringify(_this.currentData));
                }
                if (_this.addElement(FormatEventType.Detail, _this.reportSectionDatas.Detail, "detail", new_tableDetail, replaceCurrentData) == false) {
                    return;
                }
                ;
                if (_this.isPageAutoBreak) { //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                    continue;
                }
                _this.isExistsDetail = true;
                //★★groupFooter★★
                var dispIndex = 0;
                if (lastFlag == false) {
                    dispIndex = _this.groupArray.length;
                    for (var reportdataIndex in _this.groupArray) {
                        var reportdata = _this.groupArray[reportdataIndex];
                        if (reportdata.BindField.length != 0) {
                            if (_this.currentData[reportdata.BindField] != _this.Data[_this.loopCount + 1][reportdata.BindField]) {
                                dispIndex = +reportdataIndex;
                                break;
                            }
                        }
                    }
                }
                //groupが大きい方から処理
                for (var reportdataIndex = _this.groupArray.length - 1; reportdataIndex >= 0; reportdataIndex--) {
                    var reportdata = _this.groupArray[reportdataIndex];
                    var groupVisble_1 = false;
                    if (dispIndex <= reportdataIndex) {
                        groupVisble_1 = true;
                    }
                    if (groupVisble_1 == true) {
                        if (reportdata.footerElement != null) {
                            var new_tableDetail_2 = reportdata.footerElement.cloneNode(true);
                            if (_this.addElement(FormatEventType.Footer, reportdata, "gf" + reportdataIndex, new_tableDetail_2) == false) {
                                return;
                            }
                            if (_this.isPageAutoBreak) { //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                                break;
                            }
                        }
                        //グループの設定(PageDataObject.CurrentTableFooterの処理)
                        if (reportdata.isFirstMergeTable == true) {
                            _this.addFooterFunc(true);
                        }
                        //改ページ処理
                        if (reportdata.IsBreakPage) {
                            //フッターをセット
                            _this.addFooterFunc();
                            pageBreakFlag = true;
                            break; //footerを全て出力するのであれば 無視してもよいかも・・
                        }
                    }
                }
                if (_this.isPageAutoBreak || pageBreakFlag == true) { //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                    continue;
                }
                if (lastFlag) {
                    _this.addFooterFunc();
                }
            }
            //テンプレートデータの削除
            if (true) {
                var rc = _this.reportSectionDatas; //tsコンパイルエラー対策
                for (var i = 0; i < _this.reportkeys.length; i++) {
                    if (rc[_this.reportkeys[i]] != null && rc[_this.reportkeys[i]].element != null) {
                        _this.body.removeChild(rc[_this.reportkeys[i]].element);
                    }
                }
            }
            if (_this.pageFlag == true) {
                var elePageArray = document.querySelectorAll("section");
                //グループ毎のページ数
                if (pageResetExistsFlag == true) {
                    var pageCount = 0;
                    var pagesCount = 0;
                    for (var index = 0; index < elePageArray.length; index++) {
                        if (index == 0 || elePageArray[index].getAttribute(GROUP_PAGE_ATTRIBUTE) != null) {
                            pageCount = 0;
                            //次のGROUP_PAGE_ATTRIBUTEを取得
                            for (pagesCount = index + 1; pagesCount < elePageArray.length; pagesCount++) {
                                if (elePageArray[pagesCount].getAttribute(GROUP_PAGE_ATTRIBUTE) != null) {
                                    break;
                                }
                            }
                            pagesCount = pagesCount - index;
                        }
                        pageCount++;
                        _this.replaceData(elePageArray[index], { page: pageCount, pages: pagesCount });
                    }
                }
                else {
                    //単純なページ数
                    for (var index = 0; index < elePageArray.length; index++) {
                        _this.replaceData(elePageArray[index], { page: index + 1, pages: elePageArray.length });
                    }
                }
            }
            //レポート終了後のfunction
            if (_this.ReportEndFunction != null) {
                _this.ReportEndFunction();
            }
            _this.body.style.visibility = "visible";
            _this.body.classList.add("complete"); //pdf作成用
            // if (isPrint) {
            //     window.print();
            // }
        };
        //初期化
        this.init = function () {
            var _loop_1 = function (i) {
                var eleSelect = document.querySelector("[reporttype=" + _this.reportkeys[i].toLowerCase() + "]");
                if (eleSelect != null) {
                    var reportdata = new ReportSectionData();
                    //プロパティ（引数）で設定された値がある場合はそちらをセット
                    var sectionAny_1 = _this.Section;
                    if (sectionAny_1[_this.reportkeys[i]] != null) {
                        //微妙だけどプロパティがセットされているものだけ上書きされる(うまくいかないのでちゃんとLoopさせる)
                        //reportdata = sectionAny[this.reportkeys[i]];
                        var reportdataAny_1 = reportdata;
                        var keys = Object.keys(sectionAny_1[_this.reportkeys[i]]);
                        keys.forEach(function (eachs, eachi) {
                            reportdataAny_1[eachs] = sectionAny_1[_this.reportkeys[i]][eachs];
                        });
                    }
                    reportdata.element = eleSelect;
                    var groupFlag = false;
                    if (_this.reportkeys[i].substring(0, 5).toLowerCase() == "group") {
                        groupFlag = true;
                    }
                    //デザインで設定されているもの
                    var att = eleSelect.getAttribute("reportproperty");
                    if (att != null && att.length > 0) {
                        //↓ this error  look reportproperty not json 
                        //sample  reportproperty="{'DetailRepeatCount':'100','HideDuplicatesField':['xxx1','xxx2']}
                        var obj = JSON.parse(att.replace(/'/g, "\""));
                        var propertyvalue = void 0;
                        //if (reportdata.DetailRepeatCount == null) {
                        propertyvalue = obj.DetailRepeatCount;
                        if (propertyvalue != null) {
                            reportdata.DetailRepeatCount = propertyvalue;
                        }
                        //}
                        //if (reportdata.BindField == null) {
                        propertyvalue = obj.BindField;
                        if (propertyvalue != null) {
                            reportdata.BindField = propertyvalue;
                        }
                        //}
                        //if (reportdata.IsPageRepert == null) {
                        propertyvalue = obj.IsPageRepert;
                        if (propertyvalue != null && propertyvalue.toLocaleLowerCase() == "true") {
                            reportdata.IsPageRepert = true;
                        }
                        //}
                        //if (reportdata.IsBreakPage == null) {
                        propertyvalue = obj.IsBreakPage;
                        if (propertyvalue != null && propertyvalue.toLocaleLowerCase() == "true") {
                            reportdata.IsBreakPage = true;
                        }
                        //}
                        propertyvalue = obj.HideDuplicatesField;
                        if (propertyvalue != null) {
                            reportdata.HideDuplicatesField = propertyvalue;
                        }
                        //if (reportdata.IsPageReset == null) {
                        propertyvalue = obj.IsPageReset;
                        if (propertyvalue != null && propertyvalue.toLocaleLowerCase() == "true") {
                            reportdata.IsPageReset = true;
                        }
                        //}
                        //ちょっと特殊（存在する場合は上書き） 後で処理
                        //if (reportdata.IsMergeTable == null) {
                        propertyvalue = obj.IsMergeTable;
                        if (propertyvalue != null) {
                            if (propertyvalue.toLocaleLowerCase() == "true") {
                                reportdata.IsMergeTable = true;
                            }
                            else {
                                reportdata.IsMergeTable = false;
                            }
                        }
                        //}
                    }
                    /*
                    //property No Setting
                    if (reportdata.DetailRepeatCount == null) {
                        reportdata.DetailRepeatCount = 0;
                    }
                    if (reportdata.BindField == null) {
                        reportdata.BindField = "";
                    }
                    if (reportdata.IsPageRepert == null) {
                        reportdata.IsPageRepert = false;
                    }
                    if (reportdata.IsBreakPage == null) {
                        reportdata.IsBreakPage = false;
                    }
                    if (reportdata.HideDuplicatesField == null) {
                        reportdata.HideDuplicatesField = [];
                    }
                    if (reportdata.IsPageReset == null) {
                        reportdata.IsPageReset = false;
                    }
                    */
                    if (Array.isArray(reportdata.HideDuplicatesField) == false) {
                        //console.log('developError:NotArray');
                        reportdata.HideDuplicatesField = [];
                        return { value: void 0 };
                    }
                    reportdata.isFirstMergeTable = false;
                    var table = eleSelect.querySelector("table");
                    //reportdata.IsMergeTable = false;            
                    if (reportdata.IsMergeTable == true && table != null) {
                        //reportdata.IsMergeTable = true;
                        reportdata.tableElement = table;
                        reportdata.headerElement = table.querySelector("thead");
                        reportdata.detailElement = table.querySelector("tbody");
                        reportdata.footerElement = table.querySelector("tfoot");
                        if (_this.reportkeys[i].toLowerCase() == "detail".toLocaleLowerCase() && reportdata.detailElement == null) {
                            //tbody がないのでエラー
                            console.log('developError:NotbodyTag');
                            return { value: void 0 };
                        }
                    }
                    else {
                        reportdata.IsMergeTable = false;
                        reportdata.headerElement = eleSelect.querySelector("header");
                        reportdata.footerElement = eleSelect.querySelector("footer");
                        reportdata.detailElement = reportdata.element;
                    }
                    var rc = _this.reportSectionDatas; //tsコンパイルエラー対策
                    rc[_this.reportkeys[i]] = reportdata;
                    if (groupFlag == true) {
                        _this.groupArray.push(reportdata);
                    }
                }
            };
            for (var i = 0; i < _this.reportkeys.length; i++) {
                var state_1 = _loop_1(i);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
        };
        //groupの追加
        this.addGroupFunc = function (findElementName) {
            var _a;
            var new_table = null;
            var new_Body = null;
            if (_this.reportSectionDatas.Detail.IsMergeTable == true) {
                new_table = (_a = _this.reportSectionDatas.Detail.tableElement) === null || _a === void 0 ? void 0 : _a.cloneNode(true);
                new_table.removeChild(new_table.querySelector("tbody"));
                new_table.setAttribute(findElementName, "");
                new_Body = document.createElement("tbody");
                new_table.appendChild(new_Body);
                //PageDataObject.CurrentPageDetail = document.createElement("tbody");
                //new_table.appendChild(PageDataObject.CurrentPageDetail);
                _this.currentTableHeader = new_table.querySelector("thead");
                _this.currentTableFooter = new_table.querySelector("tfoot");
            }
            var rc = _this.reportSectionDatas; //tsコンパイルエラー対策let rc:any = this.ReportClass;      //tsコンパイルエラー対策
            for (var i = 0; i < _this.reportkeys.length; i++) {
                var reportdata = rc[_this.reportkeys[i]]; //new ReportDataClass();
                if (reportdata != null) {
                    if (new_table != null && reportdata.IsMergeTable == true) {
                        reportdata.newElement = new_table;
                        reportdata.appendElement = new_Body;
                        reportdata.findElementName = findElementName;
                    }
                    else {
                        reportdata.newElement = null;
                        reportdata.appendElement = _this.currentPageDetail;
                        reportdata.findElementName = "";
                    }
                }
            }
        };
        //ページの追加
        this.addPageFunc = function () {
            var _a;
            _this.sectionElement = _this.sectionMain.cloneNode(true);
            _this.body.appendChild(_this.sectionElement);
            _this.isPageAutoBreak = false;
            _this.pageDataCount = 0;
            _this.breakPageHeight = _this.pageHeight;
            _this.isExistsDetail = false;
            _this.currentTableHeader = null;
            _this.currentTableFooter = null;
            _this.currentPageFooter = null;
            var clientHeight = 0;
            if (_this.reportSectionDatas.Page.headerElement != null) {
                var newheader = _this.reportSectionDatas.Page.headerElement.cloneNode(true);
                _this.replaceData(newheader, _this.currentData);
                //イベント発行
                if (_this.reportSectionDatas.Page.FormatEventFunction != null) {
                    //this.reportSectionDatas.Page.FormatEventFunction(FormatEventType.Header, newheader, this.currentData);
                    _this.reportSectionDatas.Page.FormatEventFunction(true, newheader, _this.currentData);
                }
                newheader.setAttribute(PARENT_ATTRIBUTE, "");
                _this.sectionElement.appendChild(newheader);
                clientHeight = newheader.offsetHeight;
            }
            _this.breakPageHeight -= clientHeight;
            //詳細用のdiv
            _this.currentPageDetail = document.createElement("div");
            _this.currentPageDetail.setAttribute(PARENT_ATTRIBUTE, "");
            _this.sectionElement.appendChild(_this.currentPageDetail);
            _this.addGroupFunc(TABLE_ATTRIBUTE);
            //高さ用のダミー(bottomで処理するとうまくいかない為)
            _this.dummyDiv = document.createElement("div");
            _this.sectionElement.appendChild(_this.dummyDiv);
            clientHeight = 0;
            if (_this.reportSectionDatas.Page.footerElement != null) {
                var node = _this.reportSectionDatas.Page.footerElement.cloneNode(true);
                _this.currentPageFooter = node;
                (_a = _this.currentPageFooter) === null || _a === void 0 ? void 0 : _a.setAttribute(PARENT_ATTRIBUTE, "");
                _this.sectionElement.appendChild(_this.currentPageFooter);
                clientHeight = _this.currentPageFooter.offsetHeight;
            }
            _this.breakPageHeight -= clientHeight;
            if (_this.breakPageHeight <= 0) {
                //詳細の高さが0
                console.log('developError:NoDetailHeight');
                return;
            }
        };
        //フッターの追加（設定）
        this.addFooterFunc = function (tableFooterOnlyFlag) {
            //tableFooterOnlyFlag = tableFooterOnlyFlag ?? false;
            if (tableFooterOnlyFlag === void 0) { tableFooterOnlyFlag = false; }
            //footerの置換処理
            if (_this.currentTableFooter != null) {
                var ele = _this.currentTableFooter;
                //一度セットしたものは無視する
                if (ele.getAttribute("end") == null) {
                    ele.setAttribute("end", "");
                    //テンプレートより置換
                    _this.replaceData(ele, _this.currentData);
                    if (_this.reportSectionDatas.Detail.FormatEventFunction != null) {
                        //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.Footer, ele, this.currentData);
                        _this.reportSectionDatas.Detail.FormatEventFunction(false, ele, _this.currentData);
                    }
                }
            }
            if (tableFooterOnlyFlag == false) {
                //空白行の設定
                if (_this.reportSectionDatas.Detail.DetailRepeatCount != 0 && _this.pageDataCount < _this.reportSectionDatas.Detail.DetailRepeatCount) {
                    for (var i = _this.pageDataCount; i < _this.reportSectionDatas.Detail.DetailRepeatCount; i++) {
                        var ele = _this.reportSectionDatas.Detail.detailElement.cloneNode(true);
                        //テンプレートより置換
                        _this.replaceData(ele, {});
                        if (_this.reportSectionDatas.Detail.FormatEventFunction != null) {
                            //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.DetailBlank, ele, {});
                            _this.reportSectionDatas.Detail.FormatEventFunction(true, ele, {});
                        }
                        var tableFlag = _this.reportSectionDatas.Detail.IsMergeTable;
                        var eleArray = null;
                        var apdEle = _this.reportSectionDatas.Detail.appendElement;
                        if (tableFlag) {
                            eleArray = ele.querySelectorAll("tr");
                            if (eleArray.length > 0) {
                                for (var index = 0; index < eleArray.length; index++) {
                                    apdEle === null || apdEle === void 0 ? void 0 : apdEle.appendChild(eleArray[index]);
                                }
                            }
                        }
                        else {
                            apdEle === null || apdEle === void 0 ? void 0 : apdEle.appendChild(ele);
                        }
                        //改ページ分を超えた場合(pagebreak)★（似たような記述あり）
                        if (_this.breakPageHeight < +(_this.currentPageDetail.offsetHeight)) {
                            if (eleArray != null) {
                                for (var index = 0; index < eleArray.length; index++) {
                                    apdEle === null || apdEle === void 0 ? void 0 : apdEle.removeChild(eleArray[index]);
                                }
                            }
                            else {
                                apdEle === null || apdEle === void 0 ? void 0 : apdEle.removeChild(ele);
                            }
                            break;
                        }
                    }
                }
                if (_this.currentPageFooter != null) {
                    //テンプレートより置換
                    _this.replaceData(_this.currentPageFooter, _this.currentData);
                    if (_this.reportSectionDatas.Page.FormatEventFunction != null) {
                        //this.reportSectionDatas.Page.FormatEventFunction(FormatEventType.Footer, this.currentPageFooter, this.currentData);
                        _this.reportSectionDatas.Page.FormatEventFunction(false, _this.currentPageFooter, _this.currentData);
                    }
                    //高さの計算
                    var dummyHeight = 0;
                    //PARENT_ATTRIBUTE の Attributeがついているものを全取得
                    var oya = _this.sectionElement.querySelectorAll("[" + PARENT_ATTRIBUTE + "]");
                    for (var index = 0; index < oya.length; index++) {
                        dummyHeight += +(oya[index].offsetHeight);
                    }
                    dummyHeight = _this.pageHeight - dummyHeight;
                    if (dummyHeight > 0) {
                        //ダミーの高さをセット
                        _this.dummyDiv.style.height = dummyHeight + "px";
                    }
                }
            }
        };
        //データの置換
        this.replaceData = function (ele, data) {
            //[[xxxxx]] を置換
            var html = ele.innerHTML;
            var keys = Object.keys(data);
            for (var i = 0; i < keys.length; i++) {
                //存在しないものは無視
                if (_this.keyBindList.indexOf(keys[i]) == -1) {
                    continue;
                }
                //最初に 連結項目の存在チェック で同じ正規表現使っているので変更する場合は注意！
                html = html.replace(new RegExp("(\\[\\[(" + keys[i] + "|" + keys[i] + "(\\s)*\\|\\|.+?)\\]\\])", "g"), function (all) {
                    var field = all.replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\s/g, "");
                    var value = "";
                    //format指定
                    if (field.toString().indexOf("||") > -1) {
                        var fieldArray = field.split("||");
                        value = format_1.Format.ParseFormat((data[fieldArray[0]] || ""), fieldArray[1]);
                    }
                    else {
                        value = (data[field] || "");
                    }
                    return _this.escape_html(value);
                });
            }
            var reg = "\\[\\[.+?\\]\\]";
            if (_this.pageFlag == true) {
                html = html.replace(new RegExp(reg, "g"), function (all) {
                    if (all == "[[page]]" || all == "[[pages]]") {
                        return all;
                    }
                    return "";
                });
            }
            else {
                //マッチしないものは強制的に""に変更
                //html = html.replace(new RegExp("\\[\\[.+?\\]\\]", "g"), "");    //&nbsp; でもよいのだけど input tagとかに入れる場合も考慮
                html = html.replace(new RegExp(reg, "g"), "");
            }
            ele.innerHTML = html;
        };
        //escape
        //https://qiita.com/saekis/items/c2b41cd8940923863791
        this.escape_html = function (str) {
            if (typeof str !== 'string') {
                return str;
            }
            return str.replace(/[&'`"<>]/g, function (match) {
                switch (match) {
                    case '&':
                        return '&amp;';
                    case "'":
                        return '&#x27;';
                    case '`':
                        return '&#x60;';
                    case '"':
                        return '&quot;';
                    case '<':
                        return '&lt;';
                    case '>':
                        return '&gt;';
                }
                return match;
            });
        };
        //Elementの追加
        this.addElement = function (fet, reportdata, groupName, ele, replaceCurrentData) {
            if (replaceCurrentData === void 0) { replaceCurrentData = null; }
            var _a, _b;
            if (groupName.length > 0) {
                if (_this.pageExecuteManage.indexOf(groupName) > -1) {
                    //削除
                    _this.pageExecuteManage.splice(_this.pageExecuteManage.indexOf(groupName), 1);
                    return;
                }
            }
            var tableFlag = reportdata.IsMergeTable;
            //存在しない場合はNewElementを追加
            var appendFlag = false;
            if (reportdata.findElementName.length > 0) {
                var appendEle = _this.currentPageDetail.querySelector("[" + reportdata.findElementName + "]");
                if (appendEle == null) {
                    appendFlag = true;
                }
            }
            var new_pageEle = null;
            if (appendFlag && reportdata.newElement != null) {
                new_pageEle = reportdata.newElement;
                if (tableFlag) {
                    if (_this.currentTableHeader != null) {
                        //テンプレートより置換
                        _this.replaceData(_this.currentTableHeader, _this.currentData);
                        //イベント発行
                        if (_this.reportSectionDatas.Detail.FormatEventFunction != null) {
                            //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.Header, this.currentTableHeader, this.currentData);
                            _this.reportSectionDatas.Detail.FormatEventFunction(true, _this.currentTableHeader, _this.currentData);
                        }
                    }
                }
                (_a = _this.currentPageDetail) === null || _a === void 0 ? void 0 : _a.appendChild(new_pageEle);
            }
            //テンプレートより置換
            replaceCurrentData = replaceCurrentData !== null && replaceCurrentData !== void 0 ? replaceCurrentData : _this.currentData;
            _this.replaceData(ele, replaceCurrentData);
            //イベント発行
            if (reportdata.FormatEventFunction != null) {
                var flag = false;
                if (fet == FormatEventType.Header) {
                    flag = true;
                }
                else if (fet == FormatEventType.DetailBlank) {
                    flag = true;
                }
                reportdata.FormatEventFunction(flag, ele, replaceCurrentData);
            }
            //let eleHeight = 0;
            var eleArray = null;
            var apdEle = reportdata.appendElement;
            if (tableFlag) {
                eleArray = ele.querySelectorAll("tr");
                if (eleArray.length > 0) {
                    for (var index = 0; index < eleArray.length; index++) {
                        apdEle === null || apdEle === void 0 ? void 0 : apdEle.appendChild(eleArray[index]);
                    }
                }
            }
            else {
                apdEle === null || apdEle === void 0 ? void 0 : apdEle.appendChild(ele);
            }
            //改ページ分を超えた場合(pagebreak)★（似たような記述あり）
            if (_this.breakPageHeight < +(_this.currentPageDetail.offsetHeight)) {
                if (_this.pageDataCount == 0) {
                    //一ページでセクションが1ページ超える
                    console.log('developError:section one page over');
                    return false;
                }
                if (eleArray != null) {
                    for (var index = 0; index < eleArray.length; index++) {
                        apdEle === null || apdEle === void 0 ? void 0 : apdEle.removeChild(eleArray[index]);
                    }
                }
                else {
                    apdEle === null || apdEle === void 0 ? void 0 : apdEle.removeChild(ele);
                }
                //new_pageEleを追加してページが超える場合は、new_pageEleも削除
                if (new_pageEle != null) {
                    (_b = _this.currentPageDetail) === null || _b === void 0 ? void 0 : _b.removeChild(new_pageEle);
                }
                _this.isPageAutoBreak = true;
                _this.loopCount--; //次のループでカウントアップされるのでマイナスしておく
                if (_this.loopCount >= 0 && _this.isExistsDetail == false) {
                    _this.currentData = _this.Data[_this.loopCount];
                }
                //フッターをセット
                _this.addFooterFunc();
            }
            else {
                _this.pageDataCount++;
                if (groupName.length > 0) {
                    _this.pageExecuteManage.push(groupName);
                }
            }
            return true;
        };
        this.reportkeys = Object.keys(new ReportSectionDatas());
    }
    return Report;
}());
exports.Report = Report;
;
//export default report;
//export {report} ;
