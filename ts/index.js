"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//本番
var report_1 = require("./report");
exports.Report = report_1.Report;
exports.FormatEventType = report_1.FormatEventType;
exports.ReportSectionSettings = report_1.ReportSectionSettings;
exports.ReportPageSectionSetting = report_1.ReportPageSectionSetting;
exports.ReportGroupSectionSetting = report_1.ReportGroupSectionSetting;
exports.ReportDetailSectionSetting = report_1.ReportDetailSectionSetting;
var format_1 = require("./format");
exports.Format = format_1.Format;
//import * as report from './report';
//export const reportExport  = { ...report }
//以下テスト
// import * as rpt from './report';
// rpt.test();
// let a = new rpt.pageDataClass();
// //a.DummyDiv = null;
// console.log(a.DummyDiv);
//export { report as report };
//export { format as format };
//export default report;
// export class defaultNameSpace {
//     static test =  function ():void{
//         alert('oksksssあ');
//     };
// }
