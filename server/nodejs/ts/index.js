"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var axios_1 = __importDefault(require("axios"));
var app = express_1.default();
//const path = require('path'); 
app.set('port', process.env.PORT || 3000);
// GetとPostのルーティング
var router = express_1.default.Router();
router.get('/pdf/:reportname', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, waitTag;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, GetData(req)];
            case 1:
                data = _a.sent();
                waitTag = "";
                if (req.params.reportname == "merge") {
                    waitTag = "div#divDummy";
                }
                return [4 /*yield*/, creaetePdf(req, res, req.params.reportname + ".html", data, waitTag)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// router.post('/post', (req:express.Request, res:express.Response) => {
//   res.send(req.body)
// })
//どうでもよい関数(本来はパラメータよりデータ取得)
function GetData(reqParent) {
    return __awaiter(this, void 0, void 0, function () {
        var res, data, mainItems, filter, kendatacount, sexdatacount, sumKingaku, i, random;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios_1.default.get(reqParent.protocol + '://' + reqParent.headers.host + '/data/personal.json')];
                case 1:
                    res = _a.sent();
                    data = res.data;
                    //先頭に変な文字が入っているので
                    data = data.substring(data.indexOf("["));
                    mainItems = JSON.parse(data);
                    //sort
                    mainItems.sort(function (a, b) {
                        if (a["都道府県CD"] + a["性別"] < b["都道府県CD"] + b["性別"]) {
                            return -1;
                        }
                        else if (a["都道府県CD"] + a["性別"] > b["都道府県CD"] + b["性別"]) {
                            return 1;
                        }
                        //if (a["性別"] < b["性別"]) { return -1; }
                        //else if (a["性別"] > b["性別"]) { return 1; }
                        return 0;
                    });
                    filter = JSON.parse(JSON.stringify(mainItems));
                    mainItems = [];
                    kendatacount = 1;
                    sexdatacount = 1;
                    sumKingaku = 0;
                    for (i = 0; i < filter.length; i++) { //filter.length
                        filter[i]["連番"] = i + 1;
                        filter[i]["日付"] = '2018/01/' + (Math.floor(Math.random() * 20) + 1).toString();
                        random = Math.floor(Math.random() * 3);
                        filter[i]["品番"] = (["MANJ", "OKASHI", "TUKEMONO"])[random];
                        filter[i]["品名"] = filter[i]["都道府県"] + (["まんじゅう", "おかし", "漬物"])[random];
                        filter[i]["数量"] = Math.floor(Math.random() * 5) + 1;
                        filter[i]["単価"] = ([1000, 500, 800])[random];
                        filter[i]["金額"] = (+(filter[i]["数量"])) * (+(filter[i]["単価"]));
                        if (i != 0) {
                            if (filter[i - 1]["都道府県CD"] != filter[i]["都道府県CD"]) {
                                kendatacount = 1;
                                sexdatacount = 1;
                                sumKingaku = 0;
                            }
                            else if (filter[i - 1]["性別"] != filter[i]["性別"]) {
                                sexdatacount = 1;
                            }
                        }
                        //データは先に作成しておく
                        filter[i]["datacount"] = kendatacount;
                        filter[i]["sexdatacount"] = sexdatacount;
                        kendatacount++;
                        sexdatacount++;
                        //合計金額の計算
                        sumKingaku += (+(filter[i]["金額"]));
                        filter[i]["合計金額"] = sumKingaku;
                        mainItems.push(filter[i]);
                    }
                    return [2 /*return*/, mainItems];
            }
        });
    });
}
//puppeteerを使用したサンプル
function creaetePdf(req, res, url, data, waitTag) {
    if (waitTag === void 0) { waitTag = ""; }
    return __awaiter(this, void 0, void 0, function () {
        var baseUrl, launchOptions, browser, page, tagOptions, pdfOptions, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    baseUrl = req.protocol + '://' + req.headers.host;
                    baseUrl += "/sample/" + url;
                    launchOptions = {};
                    launchOptions.headless = true;
                    //★★注意★★ serverからの実行時にはこちらが必要（自分の環境に変更が必要） windowsのみ？？
                    launchOptions.executablePath = process.cwd() + "\\node_modules\\puppeteer\\.local-chromium\\win64-737027\\chrome-win\\chrome.exe";
                    return [4 /*yield*/, puppeteer_1.default.launch(launchOptions)];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, , 9, 11]);
                    return [4 /*yield*/, page.goto(baseUrl, { timeout: 10000, waitUntil: ["load", "domcontentloaded"] })];
                case 4:
                    _a.sent();
                    tagOptions = {};
                    tagOptions.content = "runReport(" + JSON.stringify(data) + ")";
                    return [4 /*yield*/, page.addScriptTag(tagOptions)];
                case 5:
                    _a.sent();
                    if (!(waitTag.length > 0)) return [3 /*break*/, 7];
                    return [4 /*yield*/, page.waitForSelector(waitTag)];
                case 6:
                    _a.sent();
                    _a.label = 7;
                case 7:
                    pdfOptions = {};
                    //背景を印刷する場合：true
                    pdfOptions.printBackground = true;
                    return [4 /*yield*/, page.pdf(pdfOptions)];
                case 8:
                    file = _a.sent();
                    res.set({
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': 'attachment; filename="' + url.substring(0, url.indexOf(".")) + '.pdf"'
                    });
                    res.send(file);
                    return [3 /*break*/, 11];
                case 9: 
                // Headless Chromeを閉じる
                return [4 /*yield*/, browser.close()];
                case 10:
                    // Headless Chromeを閉じる
                    _a.sent();
                    return [7 /*endfinally*/];
                case 11: return [2 /*return*/];
            }
        });
    });
}
app.use([router, express_1.default.static(process.cwd() + '/dist')]); //process.cwd()物理パス
app.listen(app.get('port'), function () { console.log(' Example app listening on port 3000!( http://localhost:3000/ )'); });
