# SkyStem Task Viewer / Task Master

A front-end task management prototype for viewing and managing checklists, task groups, subtasks, assignees, documents, comments, and status tracking in a single interface.

This project is built with:
- **HTML** for the page structure
- **CSS** for styling
- **TypeScript** for the application logic
- **JavaScript** as the compiled browser-ready output

## Project Structure

```text
task-viewer-skystem/
├── images/
│   └── logo-skystem.png
├── .gitignore
├── package.json
├── package-lock.json
├── script.ts
├── script.js
├── SkyStem Task Master.html
├── style.css
└── tsconfig.json
```

## What This Project Does

The interface is designed as a task viewer / checklist management screen with functionality such as:

- Main lists and sublists
- Task and subtask handling
- Task status tracking
- Owner / reviewer / approver assignment
- Due date and day calculations
- Comment management
- Task document and completion document handling
- Linked account support
- Column visibility customization
- Sorting and drag-and-drop ordering
- Save/load behavior in the browser
- Import/export support for task data

## Requirements

To work with the source files, make sure you have:

- **Node.js** installed
- **TypeScript** available through the project dependencies

## Installation

Open the project folder in your terminal and run:

```bash
npm install
```

This installs the required dependency defined in `package.json`.

## TypeScript Compile Command

Use the command you provided to compile the TypeScript file into JavaScript:

```bash
tsc script.ts --target es5 --lib "es2015,dom" --outFile script.js
```

This command:
- compiles `script.ts`
- targets **ES5** for broader browser compatibility
- includes the `es2015` and `dom` libraries
- outputs the compiled file as `script.js`

## How to Run the Project

After compiling, open the HTML file in a browser:

```text
SkyStem Task Master.html
```

You can simply double-click the file, or open it through a local development server.

## Important Note About Script Path

The HTML file currently includes this script path:

```html
<script src="./dist/script.js"></script>
```

However, the compile command you shared generates:

```text
script.js
```

in the **project root**, not inside a `dist` folder.

So before running the project, use **one** of these approaches:

### Option 1 — Keep your compile command
Compile to root using:

```bash
tsc script.ts --target es5 --lib "es2015,dom" --outFile script.js
```

Then update the HTML file script reference from:

```html
<script src="./dist/script.js"></script>
```

to:

```html
<script src="./script.js"></script>
```

### Option 2 — Use the tsconfig setup
The `tsconfig.json` is configured with:

- `outDir: ./dist`
- `target: es2015`
- `module: commonjs`

If you want to follow the `tsconfig.json` flow, compile with:

```bash
npx tsc
```

Then make sure the generated file exists at:

```text
dist/script.js
```

## Development Notes

- `script.ts` is the main source file for the app logic.
- `script.js` is the compiled output file.
- `style.css` contains the full UI styling.
- `SkyStem Task Master.html` is the main entry page.
- `images/logo-skystem.png` is used in the header branding.

## Suggested Workflow

A practical workflow for this project is:

1. Edit `script.ts`
2. Compile TypeScript to JavaScript
3. Open `SkyStem Task Master.html`
4. Test changes in the browser
5. Repeat as needed

## Example Workflow

```bash
npm install
tsc script.ts --target es5 --lib "es2015,dom" --outFile script.js
```

Then open:

```text
SkyStem Task Master.html
```

## Notes

- This appears to be a browser-based prototype or internal front-end task management UI.
- No backend setup is included in the shared files.
- Data persistence and task behaviors are handled from the front-end code present in `script.ts`.

## License

This project currently uses the license defined in `package.json`:

**ISC**
