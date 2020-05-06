export declare enum FormatEventType {
    Header = 100,
    Footer = 200,
    Detail = 0,
    DetailBlank = 10
}
export declare class ReportPageSectionSetting {
    /**
     * format時のイベント
     */
    FormatEventFunction: ((isHeader: boolean, ele: HTMLElement, data: any) => void) | null;
}
export declare class ReportGroupSectionSetting {
    /**
     * テーブルタグをマージしない場合：false （tabletag not Merge : false ）
     * @param hoge {bool} -
     */
    IsMergeTable: boolean;
    /**
     * グループの連結データ(グループで使用)
     */
    BindField: string;
    /**
     * 改ページの場合、データを繰り返し表示(GroupHeaderのみ)
     */
    IsPageRepert: boolean;
    /**
     * グループのデータが違う場合改ページ（複数は不可） 複数必要な場合はjsonで対応しておくこと
     */
    IsBreakPage: boolean;
    /**
     *  グループの改ページ時に[[page]],[[pages]]をリセットする
     */
    IsPageReset: boolean;
    /**
     * format時のイベント
     */
    FormatEventFunction: ((isHeader: boolean, ele: HTMLElement, data: any) => void) | null;
}
/**
 * セクションの設定
 */
export declare class ReportDetailSectionSetting {
    /**
     * tabletag not Merge : false
     * テーブルタグをマージしない場合：false
     * @param hoge {bool} -
     */
    IsMergeTable: boolean;
    /**
     * 空欄の件数 (Detailで使用) ページを超える場合は無視
     */
    DetailRepeatCount: number;
    /**
     * データ重複時非表示Field
     */
    HideDuplicatesField: string[];
    /**
     * format時のイベント
     */
    FormatEventFunction: ((isBlank: boolean, ele: HTMLElement, data: any) => void) | null;
}
export declare class ReportSectionSettings {
    Page: ReportPageSectionSetting;
    Group1: ReportGroupSectionSetting;
    Group2: ReportGroupSectionSetting;
    Group3: ReportGroupSectionSetting;
    Group4: ReportGroupSectionSetting;
    Group5: ReportGroupSectionSetting;
    Group6: ReportGroupSectionSetting;
    Group7: ReportGroupSectionSetting;
    Group8: ReportGroupSectionSetting;
    Group9: ReportGroupSectionSetting;
    Detail: ReportDetailSectionSetting;
}
export declare class Report {
    constructor();
    /**
     * jsonデータ
     */
    Data: any;
    /**
     * 余白用のCSS(string)
     */
    MarginCss: string;
    /**
     * 作成後に呼び出されるfunction(普通のhtmlが作成されるので、必要であればゴリゴリすることも可)
     */
    ReportEndFunction: (() => void) | null;
    /**
     *　各セクションごとの設定
     */
    Section: ReportSectionSettings;
    private reportSectionDatas;
    private reportkeys;
    private groupArray;
    private pageHeight;
    private pageFlag;
    private sectionMain;
    private body;
    private sectionElement;
    private breakPageHeight;
    private pageDataCount;
    private isExistsDetail;
    private isPageAutoBreak;
    private currentData;
    private loopCount;
    private currentTableHeader;
    private currentTableFooter;
    private currentPageFooter;
    private pageExecuteManage;
    private currentPageDetail;
    private dummyDiv;
    private keyBindList;
    run: () => void;
    private init;
    private addGroupFunc;
    private addPageFunc;
    private addFooterFunc;
    private replaceData;
    private escape_html;
    private addElement;
}
