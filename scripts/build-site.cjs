const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'fym-site-copy');
const output = path.join(root, 'dist');
const projectDirectory = path.join(root, 'content', 'projects');
const projects = fs.readdirSync(projectDirectory)
  .filter(name => name.endsWith('.json'))
  .map(name => JSON.parse(fs.readFileSync(path.join(projectDirectory, name), 'utf8')));
const team = JSON.parse(fs.readFileSync(path.join(root, 'content', 'team.json'), 'utf8')).members || [];

const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[char]);

function validate() {
  const slugs = new Set();
  for (const project of projects) {
    if (!project.title || !project.shortDescription || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
      throw new Error(`Invalid project title, description, or slug: ${project.slug || '(missing)'}`);
    }
    if (slugs.has(project.slug)) throw new Error(`Duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);
    if (!['active', 'coming-soon', 'completed'].includes(project.status)) throw new Error(`Invalid status: ${project.slug}`);
    if (project.applicationUrl && !/^https:\/\//.test(project.applicationUrl)) throw new Error(`Application URL must use HTTPS: ${project.slug}`);
    if (project.status !== 'active' && project.applicationUrl) throw new Error(`Only active projects can accept applications: ${project.slug}`);
    if (project.image && !project.imageAlt) throw new Error(`Project image needs alt text: ${project.slug}`);
    for (const area of project.contributionAreas || []) {
      if (!area.name || (area.tasks && (!Array.isArray(area.tasks) || area.tasks.some(task => typeof task !== 'string')))) throw new Error(`Invalid contribution area: ${project.slug}`);
    }
    for (const week of project.sprint || []) {
      if (!week.name || (week.tasks && (!Array.isArray(week.tasks) || week.tasks.some(task => typeof task !== 'string')))) throw new Error(`Invalid sprint week: ${project.slug}`);
    }
  }
  for (const person of team) {
    if (!person.name || !person.role || !person.bio) throw new Error('Team members need name, role, and bio.');
    if (person.photo && !person.photoAlt) throw new Error(`Team photo needs alt text: ${person.name}`);
  }
  if (projects.filter(project => project.featured && project.status === 'active').length !== 1) {
    throw new Error('Exactly one active project must be featured on Home.');
  }
}

function replaceRange(html, start, end, replacement) {
  const from = html.indexOf(start);
  const to = html.indexOf(end, from + start.length);
  if (from === -1 || to === -1) throw new Error(`Template marker missing: ${start}`);
  return html.slice(0, from) + replacement + html.slice(to);
}

function writePage(route, html) {
  const directory = path.join(output, route);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), html);
}

function tags(project) {
  return `<div class="tags">${(project.contributionAreas || []).map(area => `<span>${escape(area.name)}</span>`).join('')}</div>`;
}

function marketCard(project) {
  const current = project.status === 'active';
  const badge = current ? 'Featured Project' : project.status === 'completed' ? 'Completed Project' : 'Future Project';
  const action = current || project.status === 'completed'
    ? `<a class="button" href="./${escape(project.slug)}/">View Project</a>`
    : '<p class="coming-soon">Coming Soon</p>';
  return `<article class="market-card ${current ? 'featured' : 'future'}"><div><p class="label">${badge}</p><h2>${escape(project.title)}</h2><p>${escape(project.shortDescription)}</p>${project.image ? `<img class="portfolio-image" src="${escape(project.image)}" alt="${escape(project.imageAlt)}" loading="lazy">` : ''}${tags(project)}</div><div class="market-meta"><p class="category">${escape(project.category)}</p>${action}</div></article>`;
}

function taskList(tasks) {
  return Array.isArray(tasks) && tasks.length
    ? `<ul class="project-task-list">${tasks.map(task => `<li>${escape(task)}</li>`).join('')}</ul>`
    : '';
}

function projectMain(project) {
  const apply = project.status === 'active' && project.applicationUrl
    ? `<a class="button" href="${escape(project.applicationUrl)}" target="_blank" rel="noopener noreferrer">Apply to Join Project</a>` : '';
  const image = project.image ? `<div class="section-inner"><img class="portfolio-image" src="${escape(project.image)}" alt="${escape(project.imageAlt)}"></div>` : '';
  const building = project.whatWeAreBuilding || project.approach;
  const story = project.problem || building || project.whyItMatters ? `<section class="section warm"><div class="section-inner project-story-grid">${project.problem ? `<article><p class="label">The Problem</p><h2>${escape(project.problemHeading || 'The problem')}</h2><p>${escape(project.problem)}</p>${project.whyItMatters ? `<h3>Why it matters</h3><p>${escape(project.whyItMatters)}</p>` : ''}</article>` : ''}${building ? `<article><p class="label">What We're Building</p><h2>${escape(project.approachHeading || 'The project')}</h2><p>${escape(building)}</p></article>` : ''}</div></section>` : '';
  const areas = (project.contributionAreas || []).length ? `<section class="section cream"><div class="section-inner"><p class="label">What Students Would Actually Do</p><h2 class="section-title">Ways to contribute.</h2><p>You do not need to be an expert to help.</p><div class="project-contribution-grid">${project.contributionAreas.map((area, i) => `<article class="ruled"><p class="number">${String(i + 1).padStart(2, '0')}</p><h3>${escape(area.name)}</h3>${area.description ? `<p>${escape(area.description)}</p>` : ''}${taskList(area.tasks)}${(area.skills || []).length ? `<p class="label">Skills</p>${taskList(area.skills)}` : ''}</article>`).join('')}</div></div></section>` : '';
  const goal = project.goal ? `<section class="section warm project-goal"><div class="section-inner split-grid"><div><p class="label">Project Goal</p><h2 class="section-title">Work toward a useful first version.</h2></div><p class="lead-block">${escape(project.goal)}</p></div></section>` : '';
  const commitment = project.commitment ? `<section class="section cream tight"><div class="section-inner split-grid"><div><p class="label">Expected Commitment</p><h2 class="section-title">What participation involves.</h2></div><p class="lead-block">${escape(project.commitment)}</p></div></section>` : '';
  const sprint = (project.sprint || []).length ? `<section class="section warm"><div class="section-inner"><p class="label">Project Sprint</p><h2 class="section-title">A framework for making something tangible.</h2><p>The timeline gives the team structure, not a rigid script. It can change with the solution they choose to build.</p><div class="sprint-timeline detailed">${project.sprint.map((week, i) => `<article><span>Week ${i + 1}</span><h3>${escape(week.name)}</h3>${week.description ? `<p>${escape(week.description)}</p>` : ''}${taskList(week.tasks)}</article>`).join('')}</div></div></section>` : '';
  const closing = apply ? `<section class="section blue with-lead"><div class="section-inner split-grid"><div><p class="label cream-label">Ready to Build With Us?</p><h2 class="section-title">Interested in helping create the ${escape(project.title)}?</h2></div><div><p>Choose an area where you think you can contribute and tell us what you are interested in working on.</p><a class="button cream-button" href="${escape(project.applicationUrl)}" target="_blank" rel="noopener noreferrer">Apply to Join Project</a></div></div></section>` : '';
  return `<main><section class="case-header cream project-hero"><div class="section-inner"><a class="text-link back-link" href="../">Back to Projects</a><p class="label">${project.status === 'active' ? 'Current Project' : 'Completed Project'}${project.category ? ` · ${escape(project.category)}` : ''}</p><h1>${escape(project.title)}</h1><p class="lead-block">${escape(project.fullDescription || project.shortDescription)}</p><div class="actions left-actions">${apply}</div></div></section>${image}${story}${areas}${goal}${commitment}${sprint}${closing}</main>`;
}

function teamFeature(person) {
  const photo = person.photo ? `<img class="portfolio-image" src="${escape(person.photo)}" alt="${escape(person.photoAlt)}">` : `<div class="founder-mark"><p class="label">${person.name === 'Olivia Chevalier' ? 'Founder' : 'Team'}</p><span>${escape(person.name).replace(' ', '<br>')}</span><p>Future Youth Market</p></div>`;
  return `<section class="section warm wide"><div class="section-inner founder-feature">${photo}<div class="founder-copy"><p>${escape(person.bio)}</p><p class="category">${escape(person.role)}</p>${person.detail ? `<p class="muted">${escape(person.detail)}</p>` : ''}${person.name === 'Olivia Chevalier' ? '<p><a class="text-link" href="mailto:futureyouthmarket@gmail.com">Email Me Personally</a></p>' : ''}</div></div></section>`;
}

function build() {
  validate();
  if (path.dirname(output) !== root || path.dirname(path.join(output, 'projects')) !== output) {
    throw new Error('Refusing to clean a path outside the project build directory.');
  }
  fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(source, output, { recursive: true, filter: file => {
    const name = path.basename(file);
    return !name.startsWith('wix-') && name !== 'site-config.json' && name !== 'site.js';
  }});
  fs.rmSync(path.join(output, 'projects'), { recursive: true, force: true });
  const featured = projects.find(project => project.featured && project.status === 'active');
  let home = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
  const preview = `<article class="project-preview intro-grid"><div><p class="label">Active Project</p><h3>${escape(featured.title)}</h3></div><div><p>${escape(featured.shortDescription)}</p><a class="text-link icon-link" href="./projects/${escape(featured.slug)}/">View Project</a></div></article>`;
  home = replaceRange(home, '<article class="project-preview intro-grid">', '</article>', preview).replace(preview + '</article>', preview);
  writePage('', home);
  let index = fs.readFileSync(path.join(source, 'projects', 'index.html'), 'utf8');
  const current = projects.filter(project => project.status === 'active');
  const future = projects.filter(project => project.status === 'coming-soon');
  const completed = projects.filter(project => project.status === 'completed');
  const market = `<section class="section warm project-market"><div class="section-inner"><p class="label market-chapter">Current Project</p>${current.map(marketCard).join('')}${future.length ? `<div class="future-projects"><div class="future-projects-heading"><p class="label">What's Next</p><h2>Ideas FYM is exploring for future project sprints.</h2></div>${future.map(marketCard).join('')}</div>` : ''}${completed.length ? `<div class="future-projects"><p class="label">Past Projects</p>${completed.map(marketCard).join('')}</div>` : ''}</div></section>`;
  index = replaceRange(index, '<section class="section warm project-market">', '<section class="section blue with-lead">', market);
  index = index.replaceAll('./scholarship-opportunity-finder/', `./${featured.slug}/`);
  writePage('projects', index);
  const detailShell = fs.readFileSync(path.join(source, 'projects', 'scholarship-opportunity-finder', 'index.html'), 'utf8');
  for (const project of projects.filter(item => item.status !== 'coming-soon')) {
    let detail = replaceRange(detailShell, '<main>', '</main>', projectMain(project).replace(/<\/main>$/, ''));
    detail = detail.replace('<title>Scholarship Opportunity Finder | FYM Projects</title>', `<title>${escape(project.title)} | FYM Projects</title>`);
    writePage(path.join('projects', project.slug), detail);
  }
  let teamPage = fs.readFileSync(path.join(source, 'team', 'index.html'), 'utf8');
  teamPage = replaceRange(teamPage, '<section class="section warm wide">', '<section class="section fade-offwhite-to-cream wide">', [...team].sort((a, b) => (a.order || 0) - (b.order || 0)).map(teamFeature).join(''));
  writePage('team', teamPage);
  const cleanScripts = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) cleanScripts(file);
      if (entry.isFile() && entry.name === 'index.html') {
        const html = fs.readFileSync(file, 'utf8').replace(/\s*<script src="(?:\.\.\/|\.\/)*site\.js\?v=\d+"><\/script>/g, '');
        fs.writeFileSync(file, html);
      }
    }
  };
  cleanScripts(output);
  console.log(`Built ${projects.length} projects and ${team.length} verified team member(s) into ${output}`);
}

build();
