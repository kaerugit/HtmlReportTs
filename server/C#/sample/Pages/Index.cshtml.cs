using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Mime;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PuppeteerSharp;

namespace sample.Pages
{
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;

        public IndexModel(ILogger<IndexModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }


        public async Task<ActionResult> OnPostNomalAsync()
        {

            var data = GetData();

            return await CreaetePdf("nomal.html", data);

            //return Page();

        }

        public async Task<ActionResult> OnPostNomalsingleAsync()
        {
            var data = GetData();

            return await CreaetePdf("nomalsingle.html", data);
        }

        public async Task<ActionResult> OnPostNorepeatAsync()
        {
            var data = GetData();

            return await CreaetePdf("norepeat.html", data);
        }

        public async Task<ActionResult> OnPostGroupheaderAsync()
        {
            var data = GetData();

            return await CreaetePdf("groupheader.html", data);
        }

        public async Task<ActionResult> OnPostTacksealAsync()
        {
            var data = GetData();

            return await CreaetePdf("tackseal.html", data);
        }

        public async Task<ActionResult> OnPostEventtestAsync()
        {
            var data = GetData();

            return await CreaetePdf("eventtest.html", data);
        }

        public async Task<ActionResult> OnPostSeikyusyoAsync()
        {
            var data = GetData();

            return await CreaetePdf("seikyusyo.html", data);
        }

        public async Task<ActionResult> OnPostPagesumAsync()
        {
            var data = GetData();

            return await CreaetePdf("pagesum.html", data);
        }

        public async Task<ActionResult> OnPostMergeAsync()
        {
            var data = GetData();

            //無理やりiframeを通じて作成しているが別々のpdfで出力して連結したほうがわかりやすいかも・・

            //div#divDummyが表示（追加）されるまで待つ
            return await CreaetePdf("merge.html", data, "div#divDummy");
        }

        public ActionResult OnPostFuka()
        {
            var data = GetData();

            var ret = new ConcurrentBag<ActionResult>();

            //各サーバのスペックで上限値は変わってくると思います（開発環境メモリ16gbでテスト）
            Parallel.For(0, 15,
                (i) =>
                {
                    var pdf = CreaetePdf("nomal.html", new List<JObject>{ data[i]});
                    ret.Add(pdf.Result);

                }
            );
            
            //とりあえずどれか戻す
            return ret.First();
        }


        /// <summary>
        /// テストデータ作成（どうでもよいモジュール）
        /// </summary>
        /// <returns></returns>
        private List<JObject> GetData()
        {

            var url = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}/data/personal.json";
            var stream = new MemoryStream();

            var webReq = (HttpWebRequest)WebRequest.Create(url);

            using (WebResponse response = webReq.GetResponse())
            {
                using (Stream responseStream = response.GetResponseStream())
                {
                    responseStream.CopyTo(stream);
                }
            }

            string data = Encoding.UTF8.GetString(stream.ToArray()).Trim();

            //先頭に変な文字が入っているので
            data = data.Substring(data.IndexOf("["));

            var jsonData = JsonConvert.DeserializeObject<List<JObject>>(data);

            jsonData = jsonData.OrderBy((e) => e["都道府県CD"]).ThenByDescending((e) => e["性別"]).ToList();

            var mainItems = new List<JObject>();

            var kendatacount = 1;
            var sexdatacount = 1;

            for (var i = 0; i < jsonData.Count - 1; i++)
            {
                jsonData[i]["連番"] = (i + 1);

                if (i != 0)
                {
                    if (jsonData[i - 1]["都道府県CD"].ToString() != jsonData[i]["都道府県CD"].ToString())
                    {
                        kendatacount = 1;
                        sexdatacount = 1;
                    }
                    else if (jsonData[i - 1]["性別"].ToString() != jsonData[i]["性別"].ToString())
                    {
                        sexdatacount = 1;
                    }
                }
                //データは先に作成しておく
                jsonData[i]["datacount"] = kendatacount;
                jsonData[i]["sexdatacount"] = sexdatacount;
                kendatacount++;
                sexdatacount++;

                mainItems.Add(jsonData[i]);

            }

            return mainItems;
        }

        private async Task<ActionResult> CreaetePdf(string url, List<JObject> data,  string waitTag="")
        {
            //好みで変更
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}";
            baseUrl += "/sample/" + url;

            //最初は関連ファイルをダウンロードするので遅い
            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);

            using (var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            }))
            {
                using (var page = await browser.NewPageAsync())
                {

                    //移動(読込終了まで待つ)
                    await page.GoToAsync(baseUrl, new NavigationOptions() { WaitUntil = new[] { WaitUntilNavigation.DOMContentLoaded } });

                    //任意のjavascriptを実行(runReportは固定のhtmlに記述)
                    await page.AddScriptTagAsync(
                        new AddTagOptions()
                        {
                            Content = $@"runReport({JsonConvert.SerializeObject(data)});"
                        });

                    //await page.WaitForSelectorAsync("[name='divDummy']");
                    //こちらのタグが表示されるまで待つ
                    if (waitTag.Length > 0)
                    {
                        await page.WaitForSelectorAsync(waitTag);
                    }
                    

                    var pdfOptions = new PdfOptions();
                    //背景を印刷する場合：true
                    pdfOptions.PrintBackground = true;

                    var file = await page.PdfStreamAsync(pdfOptions);

                    return File(file, "application/pdf", url.Substring(0, url.IndexOf(".")) + ".pdf");
                };
            };
        }

    }
}
