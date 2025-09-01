# MVP Knowledge Hub Workflow

## Objective

Extract content from ONE Notion database and create a simple searchable static site.

## Rules

- **Single Database**: Only process the specified database
- **Read-Only**: Never modify Notion
- **Simple Structure**: Basic pages with search
- **Fast Execution**: Complete in under 5 minutes

## Steps

### Step 1: Extract Database Content

- Get all pages from the specified database
- Extract page content and metadata
- Save as JSON files for processing

### Step 2: Generate Markdown Files

- Convert each page to markdown
- Add basic frontmatter (title, date, tags)
- Save in `src/content/pages/`

### Step 3: Build Search Index

- Create simple search index from all content
- Generate categories from existing properties
- Create navigation structure

### Step 4: Generate Static Site

- Build Astro pages
- Add search functionality
- Deploy-ready output

### Step 5: Start Development Server

- Run `npm run dev` to start the development server
- Verify server is running on port 3000 (or configured port)
- Access the site at `http://localhost:3000`

### Step 6: Workflow Completion & Cleanup Prompt

- **Workflow Completed**: When server is successfully running and accessible
- Prompt developer: "Do you wish to delete all dynamically created files/data and reset the repository to its default state?"
- If **YES**: Execute cleanup script to remove generated content and reset repo
- If **NO**: Keep all generated files for continued development

## Cleanup Process

When developer chooses to reset:

1. **Delete Dynamic Files**:
   - Remove all files in `src/content/pages/` (except placeholder if any)
   - Remove generated search index files
   - Remove any temporary JSON files in `scripts/` or other locations

2. **Verification**:
   - Confirm all dynamic content removed
   - Repository ready for fresh extraction

## Environment Variables

- `NOTION_TOKEN`: Integration token
- `NOTION_DATABASE_ID`: Target database ID

## Success Criteria

- All pages extracted successfully
- Search works across content
- Site loads and navigates properly
- Mobile responsive
- Development server running on port 3000
- Workflow completed with cleanup option available
