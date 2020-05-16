import express from 'express'
import puppeteer from 'puppeteer';
import axios from 'axios';

const app: express.Express = express()
//const path = require('path'); 

app.set('port', process.env.PORT || 3000);

// GetとPostのルーティング
const router: express.Router = express.Router()

router.get('/pdf/:reportname', async (req: express.Request, res: express.Response) => {

    //データの取得
    let data = await GetData(req);

    let waitTag = "";
    if (req.params.reportname == "merge") {
        waitTag = "div#divDummy";
    }

    await creaetePdf(req, res, req.params.reportname + ".html", data, waitTag);

})

// router.post('/post', (req:express.Request, res:express.Response) => {
//   res.send(req.body)
// })

//どうでもよい関数(本来はパラメータよりデータ取得)
async function GetData(reqParent: express.Request) {

    const res = await axios.get(reqParent.protocol + '://' + reqParent.headers.host + '/data/personal.json');

    let data = res.data;

    //先頭に変な文字が入っているので
    data = data.substring(data.indexOf("["));
    let mainItems: any = JSON.parse(data);

    //sort
    mainItems.sort(
        function (a: any, b: any) {
            if (a["都道府県CD"] + a["性別"] < b["都道府県CD"] + b["性別"]) { return -1; }
            else if (a["都道府県CD"] + a["性別"] > b["都道府県CD"] + b["性別"]) { return 1; }

            //if (a["性別"] < b["性別"]) { return -1; }
            //else if (a["性別"] > b["性別"]) { return 1; }

            return 0;
        }
    );

    let filter = JSON.parse(JSON.stringify(mainItems));
    mainItems = [];

    let kendatacount = 1;
    let sexdatacount = 1;
    let sumKingaku = 0;
    for (let i = 0; i < filter.length; i++) {  //filter.length
        filter[i]["連番"] = i + 1;

        filter[i]["日付"] = '2018/01/' + (Math.floor(Math.random() * 20) + 1).toString();

        let random = Math.floor(Math.random() * 3);   //0-2の乱数
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

    return mainItems;

}

//puppeteerを使用したサンプル
async function creaetePdf(req: express.Request, res: express.Response, url: string, data: any, waitTag: string = "") {

    let baseUrl = req.protocol + '://' + req.headers.host;
    baseUrl += "/sample/" + url;

    let launchOptions: puppeteer.LaunchOptions = {};
    launchOptions.headless = true;
    //★★注意★★ serverからの実行時にはこちらが必要（自分の環境に変更が必要） windowsのみ？？
    launchOptions.executablePath = process.cwd() + "\\node_modules\\puppeteer\\.local-chromium\\win64-737027\\chrome-win\\chrome.exe";

    // Headless Chromeを起動
    const browser = await puppeteer.launch(launchOptions);

    // ページ
    const page = await browser.newPage();

    try {
        await page.goto(baseUrl, { timeout: 10000, waitUntil: ["load", "domcontentloaded"] });

        //任意のjavascriptを実行(runReportは固定のhtmlに記述)
        let tagOptions: puppeteer.ScriptTagOptions = {};

        tagOptions.content = "runReport(" + JSON.stringify(data) + ")";
        await page.addScriptTag(tagOptions);

        if (waitTag.length > 0) {
            await page.waitForSelector(waitTag);
        }

        let pdfOptions: puppeteer.PDFOptions = {};

        //背景を印刷する場合：true
        pdfOptions.printBackground = true;

        let file = await page.pdf(pdfOptions);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="' + url.substring(0, url.indexOf(".")) + '.pdf"'
        });
        res.send(file);
    }
    finally {
        // Headless Chromeを閉じる
        await browser.close();
    }


}

app.use([router, express.static(process.cwd() + '/dist')]);   //process.cwd()物理パス

app.listen(app.get('port'), () => { console.log(' Example app listening on port 3000!( http://localhost:3000/ )') })

