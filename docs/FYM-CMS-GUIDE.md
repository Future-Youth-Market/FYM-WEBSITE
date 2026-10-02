# Editing the FYM website

This guide is for Olivia and other approved FYM editors. The public website is separate from the content manager.

## Before you start

An FYM administrator must first connect the GitHub repository to Netlify, configure GitHub OAuth for Decap, and give your GitHub account **write access** to `aayushjain1230/FYM-WEBSITE`. Until that is complete, `/admin/` will open but login will not work. You do not need to edit code to manage routine content.

1. Open the new Netlify site's `/admin/` address.
2. Choose **Login with GitHub** and use the approved GitHub account.
3. Open **Projects** or **Team** from the content manager.

## Projects

To add a project, choose **Projects > New Project**. Enter a title, a short description, and a URL slug using lowercase letters and hyphens, such as `student-resource-guide`. The slug becomes part of its URL. Do not change a published slug casually; old links would break.

Choose the status carefully:

- **Coming Soon:** appears in the future-project area without an Apply button or detail page.
- **Active:** appears as a current project and gets a detail page. Add an application URL only when an official form is ready.
- **Completed:** remains visible as past project work and gets a detail page, without an Apply button.

Only one active project should have **Featured on Home** enabled. The build will stop if there are zero or multiple featured active projects, so an unfinished edit cannot silently replace the homepage project.

You can update the short and full descriptions, category, the problem, **What we're building**, **Why it matters**, expected commitment, project goal, contribution areas, sprint weeks, and official application URL in the editor. Each contribution area can have a short description, a list of actual student tasks, and optional relevant skills. Each sprint week can have a short description and activity list. You do not need to fill optional skills with guesses. For a project image, use the image upload control and write a useful image description for accessibility. Avoid announcing dates, results, team members, or numbers that FYM has not verified.

To change status or a form link, open the existing project, edit that field, and choose **Publish** in the CMS. The application link must begin with `https://`. Future or completed projects must not have an application link.

## Team

Open **Team > Team members**. Edit Olivia's role, bio, or photo there. Use **Add** in the members list for a real, verified person; use the list's remove control to remove someone. The **Display order** number controls ordering. A new photo needs an image description. Do not add placeholder people.

## What happens after saving

Decap commits the content change to GitHub. Netlify detects the commit, rebuilds the site, and deploys it after a successful build. Check the Netlify deploy status and the public page afterward. A failed build means the old deployed site stays in place while the issue is fixed.

Do not edit the site's CSS, templates, routing, authentication settings, or `netlify.toml` through GitHub unless a developer is handling the change. New page types, design changes, a different form system, or an account system require developer work.

## Before launch: Olivia's CMS check

Once Netlify and GitHub login are configured, Olivia should sign in at `/admin/`, edit and save a project description, status, image, and application link one at a time, and check each resulting deploy. Then she should create a temporary project, confirm its page uses the same template, and remove or archive it. This acceptance check has to be done by an FYM editor; the code build alone does not verify that CMS login works.
