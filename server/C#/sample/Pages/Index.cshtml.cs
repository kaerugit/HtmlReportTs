using System;
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

            return await CreaetePdf("merge.html", data);
        }




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

            jsonData = jsonData.OrderBy((e) => e["都道府県CD"]).ThenBy((e) => e["性別"]).ToList();

            for (var i=0;i< jsonData.Count-1; i++)
            {
                jsonData[i]["連番"] = (i + 1);
            }

            return jsonData;
        }

        private async Task<ActionResult> CreaetePdf(string url, List<JObject> data)
        {
            //好みで変更
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host}{this.Request.PathBase}";
            baseUrl += "/sample/" + url;

            //最初は関連ファイルをダウンロードするので遅い
            await new BrowserFetcher().DownloadAsync(BrowserFetcher.DefaultRevision);

            var browser = await Puppeteer.LaunchAsync(new LaunchOptions
            {
                Headless = true
            });

            //browser.pdf

            var page = await browser.NewPageAsync();

            //移動(読込終了まで待つ)
            await page.GoToAsync(baseUrl, new NavigationOptions() { WaitUntil = new[] { WaitUntilNavigation.DOMContentLoaded } });

            //任意のjavascriptを実行(runReportは固定のhtmlに記述)
            await page.AddScriptTagAsync(
                new AddTagOptions()
                {
                    Content = $@"runReport({JsonConvert.SerializeObject(data)});"
                });

            //await page.WaitForSelectorAsync("div.ctr-p");

            var pdfOptions = new PdfOptions();
            //背景を印刷する場合：true
            pdfOptions.PrintBackground = true;

            var file = await page.PdfStreamAsync(pdfOptions);

            return File(file, "application/pdf", url.Substring(0,url.IndexOf(".")) + ".pdf");

        }

    }
}
