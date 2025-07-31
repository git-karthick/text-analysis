Subject: Heads Up: Connie ChatBot Config Issues on SIT for TrBIS
Hi Atiya,
Quick note on some problems we’re hitting with Connie ChatBot configs on SIT for TrBIS. Trying to add our stuff, but running into a few issues. Let me know if you need logs or screenshots.
	1.	Training Tab Response Data Issue: Category and training data save okay, but response data does not save. Dev tools network tab shows a 500 internal server error. Looks like a backend problem—maybe with checks or database link? Can you check the server logs or the save endpoint?
	2.	Config Tab Field Naming Mismatch: New fields “Is Summarizer” and “Is SQL query” do not save or update when making intents or configs. Seems like a name mismatch—backend wants camelCase (isSummarizer/isSqlquery), but frontend sends uppercase (IS_SUMMARIZER/IS_SQLQUERY). Can you fix the backend to match?
	3.	Intercepting User Input for API Payload: Is there any way to directly configure user text from the Connie chat box to an API? If yes, can you share steps?
These issues are slowing our testing—thanks for any quick help or fixes. Let me know if you need more info.