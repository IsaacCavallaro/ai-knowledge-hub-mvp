import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import grayMatter from 'gray-matter';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.NOTION_DATABASE_ID;
const n2m = new NotionToMarkdown({ notionClient: notion });

async function fetchAllPages() {
    let pages = [];
    let startCursor = undefined;
    do {
        const response = await notion.databases.query({
            database_id: databaseId,
            start_cursor: startCursor,
        });
        pages = pages.concat(response.results);
        startCursor = response.next_cursor;
    } while (startCursor);
    return pages;
}

async function extractNotionData() {
    const pages = await fetchAllPages();
    const contentDir = path.join(process.cwd(), 'src', 'content', 'pages');
    const metadataPath = path.join(process.cwd(), 'src', 'content', '_metadata.json');
    const metadata = { pages: [] };

    // Clear old files to avoid duplicates
    await fs.rm(contentDir, { recursive: true, force: true });
    await fs.mkdir(contentDir, { recursive: true });

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const title = page.properties.Name?.title?.[0]?.plain_text ||
            page.properties.Title?.title?.[0]?.plain_text ||
            page.properties.name?.title?.[0]?.plain_text ||
            `Page ${i + 1}`;

        // Create unique slug
        let slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        if (!slug || slug === 'untitled') {
            slug = `page-${i + 1}`;
        }

        // Ensure unique slug
        let uniqueSlug = slug;
        let counter = 1;
        while (metadata.pages.some(p => p.slug === uniqueSlug)) {
            uniqueSlug = `${slug}-${counter}`;
            counter++;
        }

        const mdBlocks = await n2m.pageToMarkdown(page.id);
        const mdContent = n2m.toMarkdownString(mdBlocks);

        // Extract the actual markdown content from the object
        const contentString = mdContent?.parent || mdContent?.toString() || '';

        // Optional: Enrich with MCP (e.g., generate AI summary)
        // const mcp = new MCP(); // Initialize if needed
        // const enrichedDesc = await mcp.enrichContext(contentString).summary; // Placeholder—adapt to your use case

        const description = contentString.trim()
            ? contentString.substring(0, 150).replace(/\n/g, ' ') + (contentString.length > 150 ? '...' : '')
            : 'No content available';

        const frontmatter = {
            title,
            description,
            date: page.created_time,
            excerpt: description,
        };

        const fullMd = grayMatter.stringify(contentString, frontmatter);
        await fs.writeFile(path.join(contentDir, `${uniqueSlug}.md`), fullMd);

        metadata.pages.push({
            title,
            slug: uniqueSlug,
            description,
            excerpt: description,
            content: contentString,
        });
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`Extracted ${pages.length} pages successfully!`);
}

extractNotionData().catch(console.error);
