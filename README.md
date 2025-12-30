This is a great engineering initiative. To make this truly enterprise-grade and reusable, we will follow the **"Core + Adapter" pattern**.

We will build:
1.  **The Core (NPM Package):** A pure JavaScript library that handles the logic (saving, restoring, detecting fields).
2.  **The Adapters:** Specific wrappers for React, Angular, and Vanilla JS (ASP.NET MVC).

Here is the step-by-step implementation guide.

***

### Step 1: Create the Core Library (`resilient-form-core`)

First, we create a standalone TypeScript/JavaScript file that interacts directly with the DOM. This ensures it works on *any* web technology.

**File:** `src/core/ResilientForm.ts`

```typescript
export interface ResilientOptions {
  formId: string;           // Unique ID for storage
  excludeFields?: string[]; // Names of fields to ignore (e.g., 'password')
  storageProvider?: Storage; // Allow switching to sessionStorage if needed
}

export class ResilientForm {
  private form: HTMLFormElement;
  private options: ResilientOptions;
  private STORAGE_KEY: string;

  constructor(formElement: HTMLFormElement, options: ResilientOptions) {
    this.form = formElement;
    this.options = {
      storageProvider: localStorage,
      excludeFields: [],
      ...options
    };
    this.STORAGE_KEY = `ResilientForm_${this.options.formId}`;
    
    this.init();
  }

  private init() {
    // 1. Restore data immediately upon initialization
    this.restoreData();

    // 2. Listen for ANY change in the form (bubbling event)
    this.form.addEventListener('input', this.handleChange);
    this.form.addEventListener('change', this.handleChange);
    
    // 3. Clean up on submit so we don't keep old drafts
    this.form.addEventListener('submit', this.clearData);
  }

  // Use Arrow function to bind 'this' context automatically
  private handleChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    
    // Security check: Never save passwords or hidden tokens
    if (target.type === 'password' || target.type === 'hidden') return;
    if (this.options.excludeFields?.includes(target.name)) return;

    this.saveData();
  };

  private saveData() {
    const formData = new FormData(this.form);
    const  Record<string, any> = {};

    formData.forEach((value, key) => {
      // Filter out sensitive fields again just in case
      if (!this.options.excludeFields?.includes(key)) {
        data[key] = value;
      }
    });

    const payload = JSON.stringify({
      timestamp: Date.now(),
      values: data
    });

    this.options.storageProvider?.setItem(this.STORAGE_KEY, payload);
  }

  private restoreData() {
    const raw = this.options.storageProvider?.getItem(this.STORAGE_KEY);
    if (!raw) return;

    try {
      const { values } = JSON.parse(raw);
      
      // Iterate over stored keys and update the DOM
      Object.keys(values).forEach((key) => {
        const field = this.form.elements.namedItem(key);
        
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
           // Handle Checkboxes/Radios specially
           if (field.type === 'checkbox' && values[key] === 'on') {
               field.checked = true;
           } else if (field.type === 'radio') {
               // Radios are NodeLists usually, need specific handling
               const radio = this.form.querySelector(`input[name="${key}"][value="${values[key]}"]`) as HTMLInputElement;
               if(radio) radio.checked = true;
           } else {
               field.value = values[key];
           }

           // CRITICAL: Dispatch an event so React/Angular 'know' the value changed
           field.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      
      console.log('🔄 Form state restored from draft.');
    } catch (error) {
      console.error('ResilientForm restore failed:', error);
    }
  }

  public clearData = () => {
    this.options.storageProvider?.removeItem(this.STORAGE_KEY);
  };
  
  public destroy() {
     this.form.removeEventListener('input', this.handleChange);
     this.form.removeEventListener('change', this.handleChange);
     this.form.removeEventListener('submit', this.clearData);
  }
}
```

***

### Step 2: Implement for React (The Hook)

React controls the DOM, so if we just update `input.value` directly, React state won't update. That is why the `field.dispatchEvent(new Event('input'))` line in the Core above is critical.

**File:** `src/hooks/useResilientForm.ts`

```typescript
import { useEffect, useRef } from 'react';
import { ResilientForm } from '../core/ResilientForm';

export const useResilientForm = (uniqueFormId: string) => {
  const formRef = useRef<HTMLFormElement>(null);
  const instanceRef = useRef<ResilientForm | null>(null);

  useEffect(() => {
    if (!formRef.current) return;

    // Initialize the core library
    instanceRef.current = new ResilientForm(formRef.current, {
      formId: uniqueFormId
    });

    // Cleanup on unmount
    return () => {
      instanceRef.current?.destroy();
    };
  }, [uniqueFormId]);

  return formRef;
};
```

**Usage:**
```tsx
const ContactForm = () => {
  const formRef = useResilientForm('contact_page_v1');

  return (
    <form ref={formRef}>
       <input name="email" type="email" />
       <button>Submit</button>
    </form>
  );
}
```

***

### Step 3: Implement for Angular (The Directive)

Angular loves Directives for this behavior. This allows you to just add an attribute to any `<form>` tag.

**File:** `resilient-form.directive.ts`

```typescript
import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ResilientForm } from '../core/ResilientForm'; // Import core logic

@Directive({
  selector: 'form[appResilientForm]' 
})
export class ResilientFormDirective implements OnInit, OnDestroy {
  @Input('appResilientForm') formId: string = ''; // Pass ID as input
  private resilientInstance: ResilientForm | null = null;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (!this.formId) {
      console.warn('ResilientForm: No formId provided!');
      return;
    }

    // Pass the native DOM element to our Core library
    this.resilientInstance = new ResilientForm(this.el.nativeElement, {
      formId: this.formId
    });
  }

  ngOnDestroy() {
    this.resilientInstance?.destroy();
  }
}
```

**Usage:**
```html
<!-- The 'appResilientForm' attribute activates the directive -->
<form [formGroup]="myForm" appResilientForm="user_profile_edit">
  <input formControlName="username" name="username">
</form>
```

***

### Step 4: Implement for ASP.NET MVC (The Script)

For legacy MVC, we don't have modules. We simply bundle the core logic into a global script file (`resilient.bundle.js`) and use a standard HTML attribute to wake it up.

**File:** `Scripts/resilient-init.js`

```javascript
// This runs on every page load
document.addEventListener('DOMContentLoaded', function () {
  
  // Find all forms with the specific attribute
  const resilientForms = document.querySelectorAll('form[data-resilient-id]');

  resilientForms.forEach(form => {
    const id = form.getAttribute('data-resilient-id');
    
    // Initialize the library (assuming ResilientForm class is available globally)
    new ResilientForm(form, { formId: id });
  });

});
```

**Usage in Razor (.cshtml):**
```csharp
@using (Html.BeginForm("Save", "Home", FormMethod.Post, new { 
    @id = "mainForm", 
    // This attribute triggers the JS
    data_resilient_id = "EmployeeRegistration_" + Model.EmployeeId 
})) 
{
    @Html.TextBoxFor(m => m.FirstName)
    @Html.TextBoxFor(m => m.LastName)
    <input type="submit" value="Save" />
}
```

***

### Why this specific implementation?

1.  **Security Built-in:** Notice the `if (target.type === 'password')` check in the Core. This prevents the library from accidentally saving passwords to LocalStorage (which is readable by any script on the page). This is a critical security feature for fintech apps.
2.  **Event Dispatching:** The line `field.dispatchEvent(new Event('input'))` in the restore logic is the "secret sauce." Without this, Angular and React would "see" the text in the box visually, but their internal state variables (like `ngModel` or `useState`) would remain empty, causing bugs when you click Submit.
3.  **Scoped IDs:** By forcing a `formId` in the constructor, we ensure that the "Contact Us" form draft doesn't accidentally overwrite the "Login" form draft.

Sources
