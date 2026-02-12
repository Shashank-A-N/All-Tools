const fs = require('fs');
const path = require('path');

const audioToolsDir = process.argv[2] || 'c:\\Users\\shash\\OneDrive\\Desktop\\web_tech_projects\\pdf manager\\audio tools';

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
    if (dir === 'shared' || dir.startsWith('.') || dir === 'node_modules') return;

    const indexPath = path.join(audioToolsDir, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
        try {
            const content = fs.readFileSync(indexPath, 'utf8');

            let titleMatch = content.match(/<title>(.*?)<\/title>/i);
            let title = titleMatch ? titleMatch[1] : dir;
            // Clean title
            title = title.replace('| Neural Operations v3', '').replace('Shadow Text', '').trim();
            if (!title) title = dir;

            let descMatch = content.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
            let desc = descMatch ? descMatch[1] : '';

            if (!desc) {
                let pMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
                desc = pMatch ? pMatch[1].replace(/<[^>]*>/g, '') : 'No description available.';
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
