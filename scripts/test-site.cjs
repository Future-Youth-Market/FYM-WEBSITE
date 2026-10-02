const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist');
execFileSync(process.execPath, [path.join(__dirname, 'build-site.cjs')], { stdio: 'inherit' });
const read = route => fs.readFileSync(path.join(output, route, 'index.html'), 'utf8');
const routes = ['', 'about', 'projects', 'projects/scholarship-opportunity-finder', 'team', 'get-involved', 'submit-an-idea', 'our-work', 'our-work/kelly-angelovic', 'our-work/travelerlenz', 'admin'];
for (const route of routes) {
  const html = read(route);
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<title>/);
  assert.doesNotMatch(html, /localhost|127\.0\.0\.1|data-member-action|Create FYM Account|Create Account \/ Sign In/i);
  for (const match of html.matchAll(/<a\b([^>]*)>/g)) {
    const attributes = match[1];
    const href = attributes.match(/\bhref="([^"]+)"/)?.[1];
    assert.ok(href && href !== '#', `Missing destination on ${route || '/'}: ${attributes}`);
    if (/target="_blank"/.test(attributes)) assert.match(attributes, /rel="noopener noreferrer"/);
    if (/^(https:|mailto:)/.test(href)) continue;
    const pathname = new URL(href, `https://fym.invalid/${route ? `${route}/` : ''}`).pathname;
    assert.ok(fs.existsSync(path.join(output, pathname, 'index.html')) || fs.existsSync(path.join(output, pathname)), `Broken link ${href} on /${route}`);
  }
  for (const match of html.matchAll(/<img\b([^>]*)>/g)) {
    const attributes = match[1];
    const src = attributes.match(/\bsrc="([^"]+)"/)?.[1];
    assert.match(attributes, /\balt="[^"]*"/);
    if (src?.startsWith('/')) assert.ok(fs.existsSync(path.join(output, src)), `Missing image ${src}`);
  }
}
const marketplace = read('projects');
assert.match(marketplace, /Scholarship Opportunity Finder/);
assert.match(marketplace, /Gen-Z Trend Journal/);
assert.match(marketplace, /Open-Source FinTech \/ Productivity Tools/);
assert.equal((marketplace.match(/Coming Soon/g) || []).length, 2);
const scholarship = read('projects/scholarship-opportunity-finder');
assert.match(scholarship, /3–5 hours/);
assert.equal((scholarship.match(/target="_blank" rel="noopener noreferrer">Apply to Join Project/g) || []).length, 2);
assert.match(scholarship, /1FAIpQLSd2fAH3XpnudyaP8Pn4JMCnjhFr3pEanikX0TLwIOoX3VpvDw/);
assert.match(read('team'), /Olivia Chevalier/);
assert.doesNotMatch(read('team'), /fake|placeholder/i);
assert.match(read('admin'), /decap-cms/);
assert.ok(fs.existsSync(path.join(output, 'admin', 'config.yml')));
assert.ok(fs.existsSync(path.join(output, 'styles.css')));
assert.ok(!fs.existsSync(path.join(output, 'wix-embed.generated.txt')));
console.log(`Passed standalone route/content checks for ${routes.length} routes.`);
