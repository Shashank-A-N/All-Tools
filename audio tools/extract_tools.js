const fs = require('fs');
const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const audioToolsDir = 'c:\\Users\\shash\\OneDrive\\Desktop\\web_tech_projects\\pdf manager\\audio tools';

function getDirectories(srcPath) {
    return fs.readdirSync(srcPath).filter(file => {
        try {
            return fs.statSync(path.join(srcPath, file)).isDirectory();
        } catch (err) {
            return false;
        }
    });
}

const tools = [];
const dirs = getDirectories(audioToolsDir);

dirs.forEach(dir => {
    if (dir === 'shared' || dir.startsWith('.')) return;

    const indexPath = path.join(audioToolsDir, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        try {
            const content = fs.readFileSync(indexPath, 'utf8');
            const dom = new JSDOM(content);
            const doc = dom.window.document;

            let title = doc.querySelector('title')?.textContent || dir;
            // Clean title
            title = title.replace('| Neural Operations v3', '').replace('Shadow Text', '').trim();
            if (!title) title = dir;

            let desc = doc.querySelector('meta[name="description"]')?.content;
            if (!desc) {
                desc = doc.querySelector('p')?.textContent || 'No description available.';
            }
            // Truncate desc if too long
            if (desc.length > 100) desc = desc.substring(0, 97) + '...';

            tools.push({
                dir: dir,
                title: title,
                desc: desc.trim()
            });
        } catch (e) {
            console.error(`Error reading ${dir}: ${e.message}`);
        }
    }
});

console.log(JSON.stringify(tools, null, 2));
