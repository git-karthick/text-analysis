Key Requirements:
•	Chakra UI v2: Use Modal, Overlay, Content, Header, Body, Footer, CloseButton, Input/Select, FormControl/Label, Stack/Flex, Button, IconButton, Search2Icon.
•	TypeScript: Interfaces for props and input configs (id, label, placeholder, type: ‘text’|‘select’, options[], required?).
•	Functionality: Controlled inputs via internal state; dynamic rendering from config array. Trigger with IconButton; onSearch callback returns Record<string, string|undefined>. Support external isOpen/onClose. Reset values on open. Responsive (stack on mobile).
•	Extras: Accessibility (labels/ARIA), optional React Hook Form integration mention. Handle empty searches.
Usage Examples to Generate:
1.	Single text input (e.g., Account Title).
2.	Two inputs (Bank Name required, Treasury Ref optional).
3.	3+ inputs (Currency select, Country select, Account Type text).
Output:
•	Full `SearchModal.tsx` code (export default).
•	3 usage code snippets.
•	Brief integration notes (API, React Hook Form).
•	Clean, functional React code; no extra deps.