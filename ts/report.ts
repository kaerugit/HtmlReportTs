import {Format} from './format';

export enum FormatEventType {
    Header = 100,
    Footer = 200,
    Detail = 0,
    /*詳細空白行*/
    DetailBlank = 10,
};

//親の要素
const PARENT_ATTRIBUTE = "oya";
const TABLE_ATTRIBUTE = "tableappend";
const GROUP_PAGE_ATTRIBUTE = "GroupPage";

export class ReportPageSectionSetting {
    /**
     * format時のイベント 
     */
    FormatEventFunction: ((isHeader: boolean, ele: HTMLElement,data:any) => void) | null = null;
}

export class ReportGroupSectionSetting {
    /**
     * テーブルタグをマージしない場合：false （tabletag not Merge : false ）
     * @param hoge {bool} - 
     */
    IsMergeTable: boolean = true;


    /**
     * グループの連結データ(グループで使用)
     */
    BindField: string = "";

    /**
     * 改ページの場合、データを繰り返し表示(GroupHeaderのみ)
     */
    IsPageRepert: boolean = false;

    /**
     * グループのデータが違う場合改ページ（複数は不可） 複数必要な場合はjsonで対応しておくこと
     */
    IsBreakPage: boolean = false;

    /**
     *  グループの改ページ時に[[page]],[[pages]]をリセットする
     */
    IsPageReset: boolean = false;

    /**
     * format時のイベント 
     */
    FormatEventFunction: ((isHeader: boolean, ele: HTMLElement,data:any) => void) | null = null;

}


/**
 * セクションの設定
 */
export class ReportDetailSectionSetting {
    /**
     * tabletag not Merge : false 
     * テーブルタグをマージしない場合：false 
     * @param hoge {bool} - 
     */
    IsMergeTable: boolean = true;

    /**
     * 空欄の件数 (Detailで使用) ページを超える場合は無視
     */
    DetailRepeatCount: number = 0;

    /**
     * データ重複時非表示Field
     */
    HideDuplicatesField:string[] = [];

    /**
     * format時のイベント 
     */
    FormatEventFunction: ((isBlank: boolean, ele: HTMLElement,data:any) => void) | null = null;

}

//3つの型を結合（交差型）
type ReportSectionSetting = ReportPageSectionSetting & ReportGroupSectionSetting & ReportDetailSectionSetting

export class ReportSectionSettings {
    Page = new ReportPageSectionSetting();
    Group1 = new ReportGroupSectionSetting();
    Group2 = new ReportGroupSectionSetting();
    Group3 = new ReportGroupSectionSetting();
    Group4 = new ReportGroupSectionSetting();
    Group5 = new ReportGroupSectionSetting();
    Group6 = new ReportGroupSectionSetting();
    Group7 = new ReportGroupSectionSetting();
    Group8 = new ReportGroupSectionSetting();
    Group9 = new ReportGroupSectionSetting();
    Detail = new ReportDetailSectionSetting();
};

/**
 * Sectionの設定(ローカル用を追加)
 */
class ReportSectionData implements ReportSectionSetting  {
    
    FormatEventFunction: ((flag: boolean, ele: HTMLElement,data:any) => void) | null = null;
    BindField: string ="";
    IsPageRepert: boolean =false;
    IsBreakPage: boolean =false;
    IsPageReset: boolean =false;
    IsMergeTable: boolean =true;
    DetailRepeatCount: number = 0;
    HideDuplicatesField: string[] =[];
    

    //◆◆pravate(外部から設定しないでください！)◆◆
    element: HTMLElement | null   = null;

    tableElement: HTMLElement | null   = null;
    headerElement: HTMLElement | null  = null;
    footerElement: HTMLElement | null  = null;
    detailElement: HTMLElement | null  = null;

    //mergetable first
    isFirstMergeTable: boolean = false;

    newElement: HTMLElement | null  = null;
    appendElement: HTMLElement | null  = null;
    findElementName: string = "";
};

class ReportSectionDatas {
    Page = new ReportSectionData();
    Group1 = new ReportSectionData();
    Group2 = new ReportSectionData();
    Group3 = new ReportSectionData();
    Group4 = new ReportSectionData();
    Group5 = new ReportSectionData();
    Group6 = new ReportSectionData();
    Group7 = new ReportSectionData();
    Group8 = new ReportSectionData();
    Group9 = new ReportSectionData();
    Detail = new ReportSectionData();
};

export class Report {

    constructor() {
        this.reportkeys = Object.keys(new ReportSectionDatas());
    }
    
    /**
     * jsonデータ
     */
    Data:any = null;

    /**
     * 余白用のCSS(string)
     */
    MarginCss:string="";

    /**
     * 作成後に呼び出されるfunction(普通のhtmlが作成されるので、必要であればゴリゴリすることも可)
     */
    ReportEndFunction: ( ()=> void) | null = null 

    /**
     *　各セクションごとの設定 
     */
    Section = new ReportSectionSettings();

    //ReportDataClass = new ReportSectionData();
    private reportSectionDatas = new ReportSectionDatas();

    //ReportClassの文字列参照でエラーになるので仕方なく追加
    //readonly ReportClassAny :any = ()=>{ return this.ReportClass}

    //帳票作成用の変数
    //pageDataObject = new pageDataClass();

    //Page、Group1～Group9、Detailの名称
    private reportkeys: string[] = [];

    //グループの配列
    private groupArray: ReportSectionData[] = [];

    //マージン含まない高さ
    private pageHeight:number = 0;

    //ページ処理がある場合
    private pageFlag = false;

    private sectionMain:any = null;
    private body:any = null;

    private sectionElement: any = null

    //改ページの高さ
    private breakPageHeight: number = 0
    //ページ内のデータ件数

    private pageDataCount: number = 0
    //現在の仮想位置
    //CurrentDetaiTop: 0,

    //詳細を通過したかどうか
    private isExistsDetail: boolean = false

    private isPageAutoBreak: boolean = false

    //Dataの現在の行
    private currentData: any = null

    private loopCount: number = 0

    private currentTableHeader: HTMLElement | null  = null
    private currentTableFooter: HTMLElement | null  = null

    private currentPageFooter: HTMLElement | null  = null

    //ページ切り替え用　どこまで処理を行ったか
    private pageExecuteManage:string[] = [];
    //次のページに表示するデータ(グループ繰り返し用)
    //NextPageGroupElement: [],
    //次のページに表示するデータ
    //NextPageElement: [],

    //詳細のElement
    private currentPageDetail: HTMLElement | null = null

    private dummyDiv: HTMLElement | null = null

    //データ連結が存在するものだけ管理(スピードUP用)
    private keyBindList:string[] = [];

    run = (): void => {

        //データが0件
        if (this.Data == null || this.Data.length == 0) {
            return;
        }
        
        //ページ処理がある場合
        this.pageFlag = false;

        let allHTML = document.body.innerHTML;
        if (allHTML.indexOf("[[page]]") > -1 || allHTML.indexOf("[[page]]") > -1) {
            this.keyBindList.push("page");
            this.keyBindList.push("pages");
            this.pageFlag = true;
        }

        //連結項目の存在チェック
        let keys = Object.keys(this.Data[0]);
        for (let i = 0; i < keys.length; i++) {
            if (allHTML.match(new RegExp("(\\[\\[(" + keys[i] + "|" + keys[i] + "(\\s)*\\|\\|.+?)\\]\\])", "g"))) {
                this.keyBindList.push(keys[i]);
            }
        }

        this.body = document.body;

        //body.style.visibility = "hidden";

        this.init();

        if (this.reportSectionDatas.Detail == null) {
            //詳細データがない
            console.log('developError:NoDetail')
            return;
        }

        //最初のIsMergeTableを取得
        if (true){
            let rc:any = this.reportSectionDatas;      //tsコンパイルエラー対策
            for (let i = 0; i < this.reportkeys.length; i++) {
                let reportdata = rc[this.reportkeys[i]];
    
                if (reportdata != null) {
                    if (reportdata.IsMergeTable == true) {
                        reportdata.isFirstMergeTable = true;
                        break;
                    }
                }
            }
        }

        this.sectionMain = document.createElement("section");
        this.sectionMain.classList.add('sheet');

        if (this.MarginCss.length > 0) {
            this.sectionMain.classList.add(this.MarginCss);
        }

        //section.innerHTML = "新しい要素";
        this.body.appendChild(this.sectionMain);

        let pageHeightPX = document.defaultView!.getComputedStyle(this.sectionMain, null).height;
        //alert(new_ele.clientHeight);    //マージン含む
        //alert(new_ele.offsetHeight);    //線含む

        //let userAgent = window.navigator.userAgent.toLowerCase();

        let pageHeightMinus = 0;

        //chromeの場合paddingをマイナスする(heightはpaddingを含まないはずなんだけど chromeの不具合？)
        //chrome headlessしか想定していないので判定削除
        //if (userAgent.indexOf("chrome") != -1) {
        pageHeightMinus =
            +(document.defaultView!.getComputedStyle(this.sectionMain, null).paddingTop.replace("px", ""))
            +
            +(document.defaultView!.getComputedStyle(this.sectionMain, null).paddingBottom.replace("px", ""));
        //}

        this.body.removeChild(this.sectionMain);      //一旦削除

        //高さの取得 https://q-az.net/without-jquery-innerheight-width-outerheight-width/

        //マージン含まない高さ(小数点切り捨て)
        this.pageHeight = Math.floor(+(pageHeightPX.replace("px", ""))) - Math.floor(pageHeightMinus);


        let dataLoopCount = this.Data.length;
        //let existsDetail = false;

        let pageBreakFlag = false;
        let prevData = null;
        let pageResetExistsFlag = false;

        //データのループ（MainLoop） ★★★メイン処理★★★
        for (this.loopCount = 0; this.loopCount < dataLoopCount; this.loopCount++) {
            let currentPageAutoBreak = this.isPageAutoBreak;

            if (currentPageAutoBreak == false) {
                this.pageExecuteManage = [];
                currentPageAutoBreak = pageBreakFlag;
            }

            pageBreakFlag = false;

            this.currentData = this.Data[this.loopCount];

            let lastFlag = false;
            if ((this.loopCount == (dataLoopCount - 1))) {
                lastFlag = true;
            }

            //改ページ
            if (this.loopCount == 0 || currentPageAutoBreak) {
                prevData = null;
                this.addPageFunc();
            }

            this.isExistsDetail = false;

            //★★GroupHeaderの処理★★
            let groupVisble = false;
            for (let reportdataIndex in this.groupArray) {
                let reportdata = this.groupArray[reportdataIndex];

                if (groupVisble == false) {
                    //改ページ時に再度表示
                    if ((this.loopCount == 0) || (currentPageAutoBreak == true && reportdata.IsPageRepert)) {
                        groupVisble = true;
                    }
                    else {
                        //データが異なる場合（グループのブレーク）
                        if (reportdata.BindField.length != 0) {
                            if (this.currentData[reportdata.BindField] != this.Data[this.loopCount - 1][reportdata.BindField]) {
                                groupVisble = true;

                                if (this.pageFlag == true && reportdata.IsPageReset == true) {
                                    let elePageArray = document.querySelectorAll("section");
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
                        this.addGroupFunc(TABLE_ATTRIBUTE + this.loopCount.toString());
                    }

                    let groupName = "gh" + reportdataIndex;
                    if (currentPageAutoBreak == true && reportdata.IsPageRepert) {
                        this.pageExecuteManage.splice(this.pageExecuteManage.indexOf(groupName), 1);
                    }


                    if (reportdata.headerElement != null) {
                        let new_tableDetail = reportdata.headerElement.cloneNode(true);

                        if (this.addElement(FormatEventType.Header, reportdata, groupName, new_tableDetail)==false){
                            return;
                        }

                        if (this.isPageAutoBreak == true) {
                            break;
                        }
                    }
                }
            }

            if (this.isPageAutoBreak == true) {
                continue;
            }

            //詳細処理
            let new_tableDetail = this.reportSectionDatas.Detail.detailElement!.cloneNode(true);

            //同じデータを非表示
            let replaceCurrentData = null;
            if (this.reportSectionDatas.Detail.HideDuplicatesField.length > 0) {
                if (prevData != null) {
                    replaceCurrentData = JSON.parse(JSON.stringify(this.currentData));
                    for (let i = 0; i < this.reportSectionDatas.Detail.HideDuplicatesField.length; i++) {
                        let field = this.reportSectionDatas.Detail.HideDuplicatesField[i];
                        if (replaceCurrentData[field] == prevData[field]) {
                            replaceCurrentData[field] = null;
                        }
                    }

                }
                prevData = JSON.parse(JSON.stringify(this.currentData));
            }

            if (this.addElement(FormatEventType.Detail, this.reportSectionDatas.Detail, "detail", new_tableDetail, replaceCurrentData) == false ){
                return;
            };


            if (this.isPageAutoBreak) {   //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                continue;
            }

            this.isExistsDetail = true;

            //★★groupFooter★★
            let dispIndex = 0;
            if (lastFlag == false) {
                dispIndex = this.groupArray.length;
                for (let reportdataIndex in this.groupArray) {
                    let reportdata = this.groupArray[reportdataIndex];

                    if (reportdata.BindField.length != 0) {
                        if (this.currentData[reportdata.BindField] != this.Data[this.loopCount + 1][reportdata.BindField]) {
                            dispIndex = +reportdataIndex;
                            break;
                        }
                    }
                }
            }

            //groupが大きい方から処理
            for (let reportdataIndex = this.groupArray.length - 1; reportdataIndex >= 0; reportdataIndex--) {
                let reportdata = this.groupArray[reportdataIndex];

                let groupVisble = false;

                if (dispIndex <= reportdataIndex) {
                    groupVisble = true;
                }

                if (groupVisble == true) {
                    if (reportdata.footerElement != null) {
                        let new_tableDetail = reportdata.footerElement.cloneNode(true);

                        if (this.addElement(FormatEventType.Footer, reportdata, "gf" + reportdataIndex, new_tableDetail)==false){
                            return ;
                        }

                        if (this.isPageAutoBreak) {   //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                            break;
                        }
                    }

                    //グループの設定(PageDataObject.CurrentTableFooterの処理)
                    if (reportdata.isFirstMergeTable == true) {
                        this.addFooterFunc(true);
                    }

                    //改ページ処理
                    if (reportdata.IsBreakPage) {
                        //フッターをセット
                        this.addFooterFunc();
                        pageBreakFlag = true;
                        break;      //footerを全て出力するのであれば 無視してもよいかも・・
                    }
                }
            }

            if (this.isPageAutoBreak || pageBreakFlag == true) {  //pageDataObject.IsPageAutoBreak==true だとTSでエラーになるので
                continue;
            }

            if (lastFlag) {
                this.addFooterFunc();
            }
        }


        //テンプレートデータの削除
        if (true){
            let rc:any = this.reportSectionDatas;      //tsコンパイルエラー対策
            for (let i = 0; i < this.reportkeys.length; i++) {
                if (rc[this.reportkeys[i]] != null && rc[this.reportkeys[i]].element != null) {
                    this.body.removeChild(rc[this.reportkeys[i]].element);
                }
            }    
        }

        if (this.pageFlag == true) {
            let elePageArray = document.querySelectorAll("section");

            //グループ毎のページ数
            if (pageResetExistsFlag == true) {

                let pageCount = 0;
                let pagesCount = 0;
                for (let index = 0; index < elePageArray.length; index++) {
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
                    this.replaceData(elePageArray[index], { page: pageCount, pages: pagesCount });
                }

            }
            else {
                //単純なページ数
                for (let index = 0; index < elePageArray.length; index++) {
                    this.replaceData(elePageArray[index], { page: index + 1, pages: elePageArray.length });
                }
            }
        }

        //レポート終了後のfunction
        if (this.ReportEndFunction != null) {
            this.ReportEndFunction();
        }

        this.body.style.visibility = "visible";
        this.body.classList.add("complete"); //pdf作成用

        // if (isPrint) {
        //     window.print();
        // }
    }


    //初期化
    private init = () => {

        for (let i = 0; i < this.reportkeys.length; i++) {

            let eleSelect:any = document.querySelector("[reporttype=" + this.reportkeys[i].toLowerCase() + "]");
            if (eleSelect != null) {

                let reportdata = new ReportSectionData();

                //プロパティ（引数）で設定された値がある場合はそちらをセット
                let sectionAny:any = this.Section;

                if (sectionAny[this.reportkeys[i]] != null) {
                    //微妙だけどプロパティがセットされているものだけ上書きされる(うまくいかないのでちゃんとLoopさせる)
                    //reportdata = sectionAny[this.reportkeys[i]];

                    let reportdataAny:any = reportdata;
                    let keys =Object.keys(sectionAny[this.reportkeys[i]]);
                    keys.forEach((eachs,eachi) =>{
                        reportdataAny[eachs] = sectionAny[this.reportkeys[i]][eachs];
                    }) ;           
                }

                reportdata.element = eleSelect;

                let groupFlag = false;
                if (this.reportkeys[i].substring(0, 5).toLowerCase() == "group") {
                    groupFlag = true;
                }

                //デザインで設定されているもの
                let att = eleSelect.getAttribute("reportproperty");

                if (att != null && att.length > 0) {
                    //↓ this error  look reportproperty not json 
                    //sample  reportproperty="{'DetailRepeatCount':'100','HideDuplicatesField':['xxx1','xxx2']}
                    let obj = JSON.parse(att.replace(/'/g, "\""));

                    let propertyvalue;

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
                    return;
                }

                reportdata.isFirstMergeTable = false;

                let table = eleSelect.querySelector("table");

                //reportdata.IsMergeTable = false;            
                if (reportdata.IsMergeTable == true && table != null) {
                    //reportdata.IsMergeTable = true;

                    reportdata.tableElement = table;
                    reportdata.headerElement = table.querySelector("thead");
                    reportdata.detailElement = table.querySelector("tbody");
                    reportdata.footerElement = table.querySelector("tfoot");
                    if (this.reportkeys[i].toLowerCase() == "detail".toLocaleLowerCase() && reportdata.detailElement == null) {
                        //tbody がないのでエラー
                        console.log('developError:NotbodyTag')
                        return;
                    }
                }
                else {
                    reportdata.IsMergeTable = false;
                    reportdata.headerElement = eleSelect.querySelector("header");
                    reportdata.footerElement = eleSelect.querySelector("footer");

                    reportdata.detailElement = reportdata.element;
                }

                let rc:any = this.reportSectionDatas;      //tsコンパイルエラー対策
                rc[this.reportkeys[i]] = reportdata;
                if (groupFlag == true) {
                    this.groupArray.push(reportdata);
                }
            }
        }
    }

    //groupの追加
    private addGroupFunc = (findElementName: string) => {
        let new_table:any = null;
        let new_Body:any = null;
        if (this.reportSectionDatas.Detail.IsMergeTable == true) {
            new_table = this.reportSectionDatas.Detail.tableElement?.cloneNode(true);

            new_table.removeChild(new_table.querySelector("tbody"));
            new_table.setAttribute(findElementName, "");

            new_Body = document.createElement("tbody");
            new_table.appendChild(new_Body);
            //PageDataObject.CurrentPageDetail = document.createElement("tbody");
            //new_table.appendChild(PageDataObject.CurrentPageDetail);

            this.currentTableHeader = new_table.querySelector("thead");
            this.currentTableFooter = new_table.querySelector("tfoot");
        }

        let rc:any = this.reportSectionDatas;      //tsコンパイルエラー対策let rc:any = this.ReportClass;      //tsコンパイルエラー対策
        for (let i = 0; i < this.reportkeys.length; i++) {
            let reportdata = rc[this.reportkeys[i]]; //new ReportDataClass();

            if (reportdata != null) {
                if (new_table != null && reportdata.IsMergeTable == true) {
                    reportdata.newElement = new_table;
                    reportdata.appendElement = new_Body;
                    reportdata.findElementName = findElementName;
                }
                else {
                    reportdata.newElement = null;
                    reportdata.appendElement = this.currentPageDetail;
                    reportdata.findElementName = "";
                }
            }
        }
    };

    //ページの追加
    private addPageFunc = () => {
        this.sectionElement = this.sectionMain.cloneNode(true);
        this.body.appendChild(this.sectionElement);
        this.isPageAutoBreak = false;
        this.pageDataCount = 0;
        this.breakPageHeight = this.pageHeight;
        this.isExistsDetail = false;
        this.currentTableHeader = null;
        this.currentTableFooter = null;
        this.currentPageFooter = null;

        let clientHeight = 0;
        if (this.reportSectionDatas.Page.headerElement != null) {
            let newheader: any = this.reportSectionDatas.Page.headerElement.cloneNode(true);

            this.replaceData(newheader, this.currentData);

            //イベント発行
            if (this.reportSectionDatas.Page.FormatEventFunction != null) {
                //this.reportSectionDatas.Page.FormatEventFunction(FormatEventType.Header, newheader, this.currentData);
                this.reportSectionDatas.Page.FormatEventFunction(true, newheader, this.currentData);
            }

            newheader.setAttribute(PARENT_ATTRIBUTE, "");
            this.sectionElement.appendChild(newheader);

            clientHeight = newheader.offsetHeight;
        }
        this.breakPageHeight -= clientHeight;

        //詳細用のdiv
        this.currentPageDetail = document.createElement("div");
        this.currentPageDetail.setAttribute(PARENT_ATTRIBUTE, "");
        this.sectionElement.appendChild(this.currentPageDetail);

        this.addGroupFunc(TABLE_ATTRIBUTE);

        //高さ用のダミー(bottomで処理するとうまくいかない為)
        this.dummyDiv = document.createElement("div");
        this.sectionElement.appendChild(this.dummyDiv);

        clientHeight = 0;
        if (this.reportSectionDatas.Page.footerElement != null) {
            let node:any = this.reportSectionDatas.Page.footerElement.cloneNode(true);
            this.currentPageFooter = node;

            this.currentPageFooter?.setAttribute(PARENT_ATTRIBUTE, "");
            this.sectionElement.appendChild(this.currentPageFooter);
            clientHeight = this.currentPageFooter!.offsetHeight;
        }
        this.breakPageHeight -= clientHeight;

        if (this.breakPageHeight <= 0) {
            //詳細の高さが0
            console.log('developError:NoDetailHeight');
            return;
        }
    };


    //フッターの追加（設定）
    private addFooterFunc = (tableFooterOnlyFlag: boolean =false) => {

        //tableFooterOnlyFlag = tableFooterOnlyFlag ?? false;

        //footerの置換処理
        if (this.currentTableFooter != null) {
            let ele = this.currentTableFooter;

            //一度セットしたものは無視する
            if (ele.getAttribute("end") == null) {
                ele.setAttribute("end", "");
                //テンプレートより置換
                this.replaceData(ele, this.currentData);
                if (this.reportSectionDatas.Detail.FormatEventFunction != null) {
                    //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.Footer, ele, this.currentData);
                    this.reportSectionDatas.Detail.FormatEventFunction(false, ele, this.currentData);
                }
            }
        }

        if (tableFooterOnlyFlag == false) {
            //空白行の設定
            if (this.reportSectionDatas.Detail.DetailRepeatCount != 0 && this.pageDataCount < this.reportSectionDatas.Detail.DetailRepeatCount) {

                for (let i = this.pageDataCount; i < this.reportSectionDatas.Detail.DetailRepeatCount; i++) {
                    let ele:any = this.reportSectionDatas.Detail.detailElement!.cloneNode(true);

                    //テンプレートより置換
                    this.replaceData(ele, {});
                    if (this.reportSectionDatas.Detail.FormatEventFunction != null) {
                        //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.DetailBlank, ele, {});
                        this.reportSectionDatas.Detail.FormatEventFunction(true, ele, {});
                    }

                    let tableFlag = this.reportSectionDatas.Detail.IsMergeTable

                    let eleArray = null;
                    let apdEle = this.reportSectionDatas.Detail.appendElement;

                    if (tableFlag) {
                        eleArray = ele.querySelectorAll("tr");

                        if (eleArray.length > 0) {
                            for (let index = 0; index < eleArray.length; index++) {
                                apdEle?.appendChild(eleArray[index]);
                            }
                        }

                    }
                    else {
                        apdEle?.appendChild(ele);
                    }

                    //改ページ分を超えた場合(pagebreak)★（似たような記述あり）
                    if (this.breakPageHeight < +(this.currentPageDetail!.offsetHeight)) {

                        if (eleArray != null) {
                            for (let index = 0; index < eleArray.length; index++) {
                                apdEle?.removeChild(eleArray[index]);
                            }
                        }
                        else {
                            apdEle?.removeChild(ele);
                        }

                        break;
                    }


                }
            }

            if (this.currentPageFooter != null) {

                //テンプレートより置換
                this.replaceData(this.currentPageFooter, this.currentData);

                if (this.reportSectionDatas.Page.FormatEventFunction != null) {
                    //this.reportSectionDatas.Page.FormatEventFunction(FormatEventType.Footer, this.currentPageFooter, this.currentData);
                    this.reportSectionDatas.Page.FormatEventFunction(false, this.currentPageFooter, this.currentData);
                }

                //高さの計算
                let dummyHeight = 0;
                //PARENT_ATTRIBUTE の Attributeがついているものを全取得
                let oya = this.sectionElement.querySelectorAll("[" + PARENT_ATTRIBUTE + "]");
                for (let index = 0; index < oya.length; index++) {
                    dummyHeight += +(oya[index].offsetHeight);
                }

                dummyHeight = this.pageHeight - dummyHeight;
                if (dummyHeight > 0) {
                    //ダミーの高さをセット
                    this.dummyDiv!.style.height = dummyHeight + "px";
                }
            }

        }
    };


 //データの置換
 private replaceData = (ele: HTMLElement, data: any) => {
    //[[xxxxx]] を置換
    let html = ele.innerHTML;

    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {

        //存在しないものは無視
        if (this.keyBindList.indexOf(keys[i]) == -1) {
            continue;
        }

        //最初に 連結項目の存在チェック で同じ正規表現使っているので変更する場合は注意！
        html = html.replace(new RegExp("(\\[\\[(" + keys[i] + "|" + keys[i] + "(\\s)*\\|\\|.+?)\\]\\])", "g"),
            (all: string)=> {

                let field = all.replace(/\[\[/g, "").replace(/\]\]/g, "").replace(/\s/g, "");

                let value = "";

                //format指定
                if (field.toString().indexOf("||") > -1) {
                    let fieldArray = field.split("||");

                    value = Format.ParseFormat((data[fieldArray[0]] || ""), fieldArray[1]);
                }
                else {
                    value = (data[field] || "");
                }

                return this.escape_html(value);
            }
        )
    }

    let reg = "\\[\\[.+?\\]\\]";
    if (this.pageFlag == true) {
        html = html.replace(new RegExp(reg, "g"),
            function (all: string) {
                if (all == "[[page]]" || all == "[[pages]]") {
                    return all;
                }

                return "";
            }
        );
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
private escape_html =  (str: string): string =>{
    if (typeof str !== 'string') {
        return str;
    }

    return str.replace(/[&'`"<>]/g, function (match) {
        switch (match) {
            case '&':
                return '&amp;';

            case "'":
                return '&#x27;'

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
private addElement = (fet: FormatEventType, reportdata: ReportSectionData, groupName: string, ele: any, replaceCurrentData: any = null) => {

    if (groupName.length > 0) {
        if (this.pageExecuteManage.indexOf(groupName) > -1) {
            //削除
            this.pageExecuteManage.splice(this.pageExecuteManage.indexOf(groupName), 1);
            return;
        }
    }

    let tableFlag = reportdata.IsMergeTable;

    //存在しない場合はNewElementを追加
    let appendFlag = false;
    if (reportdata.findElementName.length > 0) {
        let appendEle = this.currentPageDetail!.querySelector("[" + reportdata.findElementName + "]");
        if (appendEle == null) {
            appendFlag = true;
        }
    }
    let new_pageEle = null;
    if (appendFlag && reportdata.newElement != null) {
        new_pageEle = reportdata.newElement;
        if (tableFlag) {
            if (this.currentTableHeader != null) {
                //テンプレートより置換
                this.replaceData(this.currentTableHeader, this.currentData);

                //イベント発行
                if (this.reportSectionDatas.Detail.FormatEventFunction != null) {
                    //this.reportSectionDatas.Detail.FormatEventFunction(FormatEventType.Header, this.currentTableHeader, this.currentData);
                    this.reportSectionDatas.Detail.FormatEventFunction(true, this.currentTableHeader, this.currentData);
                }

            }
        }

        this.currentPageDetail?.appendChild(new_pageEle);
    }

    //テンプレートより置換
    replaceCurrentData = replaceCurrentData ?? this.currentData;
    this.replaceData(ele, replaceCurrentData);

    //イベント発行
    if (reportdata.FormatEventFunction != null) {
        let flag = false;

        if (fet == FormatEventType.Header){
            flag=true;
        }
        else if (fet == FormatEventType.DetailBlank){
            flag=true;
        }

        reportdata.FormatEventFunction(flag, ele, replaceCurrentData);
    }

    //let eleHeight = 0;
    let eleArray = null;
    let apdEle = reportdata.appendElement;

    if (tableFlag) {
        eleArray = ele.querySelectorAll("tr");

        if (eleArray.length > 0) {
            for (let index = 0; index < eleArray.length; index++) {
                apdEle?.appendChild(eleArray[index]);
            }
        }

    }
    else {
        apdEle?.appendChild(ele);
    }

    //改ページ分を超えた場合(pagebreak)★（似たような記述あり）
    if (this.breakPageHeight < +(this.currentPageDetail!.offsetHeight)) {

        if (this.pageDataCount ==0){
            //一ページでセクションが1ページ超える
            console.log('developError:section one page over');
            return false;
        }
        if (eleArray != null) {
            for (let index = 0; index < eleArray.length; index++) {
                apdEle?.removeChild(eleArray[index]);
            }
        }
        else {
            apdEle?.removeChild(ele);
        }

        //new_pageEleを追加してページが超える場合は、new_pageEleも削除
        if (new_pageEle != null) {
            this.currentPageDetail?.removeChild(new_pageEle);
        }

        this.isPageAutoBreak = true;

        this.loopCount--; //次のループでカウントアップされるのでマイナスしておく
        if (this.loopCount >= 0 && this.isExistsDetail == false) {
            this.currentData = this.Data[this.loopCount];
        }

        //フッターをセット
        this.addFooterFunc();

    }
    else {
        this.pageDataCount++;
        if (groupName.length > 0) {
            this.pageExecuteManage.push(groupName);
        }
    }

    return true;
};

};

//export default report;
//export {report} ;
