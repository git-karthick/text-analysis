Hi everyone, my name is Karthick, and I’m a frontend developer working on the TrBIS application. Today, I’ll explain what TrBIS does and how it helps our bank manage its accounts more efficiently.

What is TrBIS?

TrBIS stands for Treasury Bank Information System. It’s a tool that helps our bank manage all the accounts we hold, whether they are with other banks or within our own bank.

TrBIS allows us to keep track of the daily balances in these accounts. It also helps with tasks like balance monitoring, ensuring compliance with banking regulations, and calculating any fees we pay to other banks.

Main Functions:

TrBIS has three key functions:
	1.	Bank Account Management
	2.	Balance Monitoring
	3.	Fee Tracking

There are also six core tools within TrBIS:
	1.	Account Opening Questionnaire (AOQ): Facilitates the opening of new accounts with external banks.
	2.	Internal Demand Deposit Accounts (IDDA): Supports the opening of accounts within our own bank.
	3.	Account Maintenance Questionnaire (AMQ): Enables the updating or closing of bank accounts.
	4.	Scanned Authorized Signature System (SASS): Centralizes the management of authorized signatories for bank accounts, controlling who is allowed to sign off on these accounts.
	5.	Balance Monitoring (MBRS): Monitors account balances daily.
	6.	Fee Tracking (EAA): Helps the Bank Control team track the fees paid to other banks.

How TrBIS Works:

Now, let’s talk about how TrBIS interacts with other systems.
	•	Upstream Systems: On the left side of the diagram, you’ll find systems like WTX, NY Swift Alliance, London Swift Alliance, and others. These systems send us balance information and other key data, allowing us to know our account balances in real-time.
	•	Reference Data: At the bottom of the diagram are systems like Frontier and ECS. These ensure the data used in TrBIS is accurate and up-to-date.
	•	Middle Section (TrBIS): At the core is TrBIS, where all the data from upstream systems is processed using tools like AOQ, AMQ, SASS, and Balance Info.
	•	Bank Control Team: Our line of business (LOB) is the Bank Control team, which owns this entire process. Internal and external accounts are opened by requestors on behalf of the primary contact, who must be a bank employee at the SVP, Director, or Band 4 level or above.
	•	Downstream Systems: On the right side are systems like TaxIT, Oracle GL, CSDB, and more. These systems use TrBIS data for tasks like account reporting, legal compliance, and other essential functions.

GBS Contribution:

Our GBS team, consisting of five members, handles all new enhancements, developments, and support for TrBIS in case of any issues.

New Features:

This year, we added two new features: AIT and POP, in line with the FED MRA regulations. Now, when a new account is opened, it must be associated with both AIT and POP, which helps the Bank Control team maintain a closer watch on these accounts.

These features were successfully added in May, and our GBS team carried out most of the work. Since TrBIS doesn’t have a dedicated testing team, Dilip’s team took responsibility for testing and ensuring the system functioned correctly.

Conclusion:

In summary, TrBIS simplifies and streamlines our bank’s management of accounts, daily balance tracking, and fee handling. It ensures smooth operations and helps us stay compliant with critical financial regulations.