Here is a complete, step-by-step implementation guide to building a **Custom Regression Recorder** for your legacy ASP.NET MVC application.

This solution has three components:
1.  **The Spy (Frontend):** A JavaScript file that records clicks and typing.
2.  **The Vault (Backend):** A .NET Controller to save the recorded JSON script.
3.  **The Robot (Runner):** A .NET Console Application that uses Playwright to replay the script.

***

### Phase 1: The Spy (Frontend Recorder)

You need to inject a script that listens to user actions without slowing down the app.

**1. Create the Script**
Create a new file `Scripts/RegressionRecorder.js` in your MVC project.

```javascript
// Scripts/RegressionRecorder.js
(function() {
    let recording = [];
    let isRecording = false;
    let startTime = 0;

    // Helper: Generate a unique CSS selector for an element
    function getSelector(el) {
        if (el.id) return `#${el.id}`;
        if (el.name) return `[name='${el.name}']`;
        if (el.className) {
            const classes = el.className.split(' ').filter(c => c).join('.');
            if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
        }
        return el.tagName.toLowerCase();
    }

    window.Recorder = {
        start: function() {
            recording = [];
            isRecording = true;
            startTime = Date.now();
            console.log("🔴 Recording Started");
            alert("Recording Started! Perform your actions, then click 'Stop'.");
        },

        stop: function() {
            isRecording = false;
            const name = prompt("Enter a name for this test case:", "Bug Report " + new Date().toISOString());
            if (name) {
                this.save(name);
            }
        },

        save: function(name) {
            const payload = {
                TestName: name,
                Events: JSON.stringify(recording),
                Url: window.location.href
            };

            // Post to your MVC Controller
            fetch('/TestAutomation/Save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).then(() => alert("✅ Test Saved Successfully!"));
        }
    };

    // Event Listener 1: CLICKS
    document.addEventListener('click', function(e) {
        if (!isRecording) return;
        recording.push({
            type: 'click',
            selector: getSelector(e.target),
            delay: Date.now() - startTime
        });
    }, true);

    // Event Listener 2: TYPING (Input)
    document.addEventListener('change', function(e) {
        if (!isRecording) return;
        recording.push({
            type: 'input',
            selector: getSelector(e.target),
            value: e.target.value,
            delay: Date.now() - startTime
        });
    }, true);
})();
```

**2. Add Controls to Layout**
Open `Views/Shared/_Layout.cshtml` and add this "Admin Only" button at the bottom.

```html
@if (User.IsInRole("Admin") || User.Identity.Name == "karthick") 
{
    <div style="position:fixed; bottom:20px; right:20px; z-index:9999;">
        <button onclick="Recorder.start()" class="btn btn-danger">🔴 Rec</button>
        <button onclick="Recorder.stop()" class="btn btn-success">⏹ Stop</button>
    </div>
    <script src="~/Scripts/RegressionRecorder.js"></script>
}
```

***

### Phase 2: The Vault (Backend Saver)

You need an endpoint to receive the JSON.

**1. Create the Model**
```csharp
public class TestScriptViewModel
{
    public string TestName { get; set; }
    public string Events { get; set; } // JSON string of events
    public string Url { get; set; }
}
```

**2. Create the Controller**
Create `Controllers/TestAutomationController.cs`.

```csharp
public class TestAutomationController : Controller
{
    [HttpPost]
    public ActionResult Save(TestScriptViewModel model)
    {
        // For simplicity, save to a local JSON file. 
        // In production, save to SQL Database.
        var folder = Server.MapPath("~/App_Data/Tests/");
        if (!Directory.Exists(folder)) Directory.CreateDirectory(folder);

        var filename = Path.Combine(folder, $"{DateTime.Now.Ticks}_{model.TestName}.json");
        System.IO.File.WriteAllText(filename, JsonConvert.SerializeObject(model));

        return Json(new { success = true });
    }
}
```

***

### Phase 3: The Robot (The Runner)

This is a separate **Console Application** (Test Runner) that you run on your local machine or CI/CD server. It reads the JSON files and executes them.

**1. Create a New Console App**
```bash
dotnet new console -n RegressionRunner
dotnet add package Microsoft.Playwright
dotnet build
```

**2. The Replay Logic (Program.cs)**

```csharp
using Microsoft.Playwright;
using System.Text.Json;

class Program
{
    static async Task Main(string[] args)
    {
        // 1. Setup Playwright
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync(new() { Headless = false, SlowMo = 500 });
        var page = await browser.NewPageAsync();

        // 2. Load the Script (Simulate reading the file saved by MVC)
        var jsonContent = File.ReadAllText("test_script_example.json"); 
        var testScript = JsonSerializer.Deserialize<TestScript>(jsonContent);

        Console.WriteLine($"▶ Running Test: {testScript.TestName}");

        // 3. Navigate to Start URL
        await page.GotoAsync(testScript.Url);

        // 4. Replay Events
        var events = JsonSerializer.Deserialize<List<RecordedEvent>>(testScript.Events);

        foreach (var evt in events)
        {
            Console.WriteLine($"Executing {evt.Type} on {evt.Selector}");
            
            var locator = page.Locator(evt.Selector);

            if (evt.Type == "click")
            {
                await locator.ClickAsync();
            }
            else if (evt.Type == "input")
            {
                await locator.FillAsync(evt.Value);
            }

            // Innovation: Auto-Waiting for MVC Postbacks
            // Playwright automatically waits for elements to be actionable!
        }

        Console.WriteLine("✅ Test Passed!");
    }
}

// Helper Classes
public class TestScript {
    public string TestName { get; set; }
    public string Events { get; set; }
    public string Url { get; set; }
}
public class RecordedEvent {
    public string Type { get; set; }
    public string Selector { get; set; }
    public string Value { get; set; }
}
```

***

### How to use it:

1.  **Open your MVC App.** Click "Rec".
2.  **Do the bug.** (e.g., Go to Transfer -> Type 500 -> Click Save).
3.  **Click Stop.** Name it "Transfer Crash Bug".
4.  **Go to your Console App.** Point it to the saved JSON file.
5.  **Run `dotnet run`.** Watch as a ghost browser opens and performs *exactly* what you just did.

This gives you a **permanent regression test** for that bug, with zero coding required.

Sources
[1] The Complete Playwright End-to-End Story, Tools, AI, and Real ... https://developer.microsoft.com/blog/the-complete-playwright-end-to-end-story-tools-ai-and-real-world-workflows
[2] Playwright with .Net: A 2026 guide - BrowserStack https://www.browserstack.com/guide/playwright-dotnet
[3] Test-Automation Playwright Tool Now Records and Replays ... - InfoQ https://www.infoq.com/news/2020/10/playwright-records-scripts-tests/
[4] How to test web applications with Playwright and C# .NET | Twilio https://www.twilio.com/en-us/blog/developers/community/test-web-apps-with-playwright-and-csharp-dotnet
[5] #4 - Working with Playwright CLI in C# .NET - Record and Playback ... https://www.youtube.com/watch?v=DbtP9kSbw5s
[6] Event listeners in JavaScript - click, submit and change https://www.youtube.com/watch?v=78y-GnVCcQ4
[7] How to persist data in an array even when the page ... https://stackoverflow.com/questions/42435194/how-to-persist-data-in-an-array-even-when-the-page-reloads-using-javascript
[8] ASP.NET Core Web API - Get file along with [FromBody] JSON model https://stackoverflow.com/questions/67724947/asp-net-core-web-api-get-file-along-with-frombody-json-model
[9] API testing | Playwright .NET https://playwright.dev/dotnet/docs/api-testing
[10] Page | Playwright .NET https://playwright.dev/dotnet/docs/api/class-page
[11] HTML DOM Element addEventListener() Method - W3Schools https://www.w3schools.com/jsref/met_element_addeventlistener.asp
[12] Persisting array value across page refresh : r/angularjs https://www.reddit.com/r/angularjs/comments/2vsm8a/persisting_array_value_across_page_refresh/
[13] How do I post JSON to a REST API endpoint? - C#/.NET - ReqBin https://reqbin.com/req/csharp/v0crmky0/rest-api-post-example
[14] Playwright #47 Data Driven Testing using JSON File in Playwright https://www.youtube.com/watch?v=pCiWGYzJfSY
[15] Use Microsoft.Playwright.Core in Playwright-dotnet With Examples https://www.lambdatest.com/automation-testing-advisor/csharp/packages/Microsoft.Playwright.Core
[16] How to capture input changes event using Javascript? https://stackoverflow.com/questions/62565552/how-to-capture-input-changes-event-using-javascript
[17] How to Save State to LocalStorage & Persist on Refresh with ... https://spacejelly.dev/posts/how-to-save-state-to-localstorage-persist-on-refresh-with-react-js
[18] How to Post JSON Data with C# - Apidog https://apidog.com/blog/csharp-post-json/
[19] How To Read Data From JSON File In Playwright - YouTube https://www.youtube.com/watch?v=4ilzuiw37YY
[20] Let's Playwright With .NET 6 MVC | Xebia https://xebia.com/blog/lets-playwright-with-net-6-mvc/
