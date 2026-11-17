"""Exports the team wiki (/wiki) as a Markdown knowledge base for other AI
agents and developers. Pushed to the knowledge-base repository only when the
product owner asks (J114); nothing runs this automatically.

Usage (from the repository root):
  python3 scripts/knowledge/export.py <output-dir>

Needs `markdownify` (pip) for the HTML guides, and Node 22 for the design
system (it runs scripts/knowledge/design-system.mjs).

The output mirrors the wiki's tabs, in the same order. Generated documents
(playbook, admin guideline, research) are converted from their HTML; the
Markdown ones are copied. Images the guides use are copied into assets/.
"""
import os
import re
import shutil
import subprocess
import sys

from markdownify import markdownify

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
C = os.path.join(ROOT, 'src/guides/content')

# id, title, file name, source, kind, audience
DOCS = [
    ('playbook', 'Feedback group playbook', '01-feedback-group-playbook', [('Original', 'pm-playbook.html'), ('Mission guide', 'pm-playbook-v2.html'), ('Quick start', 'pm-playbook-v3.html')], 'html', 'The project manager running the study'),
    ('admin', 'Admin guideline', '02-admin-guideline', [('Original', 'admin-guideline.html'), ('Task guide', 'admin-guideline-v2.html'), ('Quick start', 'admin-guideline-v3.html')], 'html', 'Anyone who runs Aurelia day to day'),
    ('prd', 'Product requirements', '03-product-requirements', 'docs/PRD-OVERVIEW.md', 'md', 'Anyone new to the product'),
    ('api', 'API contract', '04-api-contract', 'docs/api/API-CONTRACT.md', 'md', 'Engineers'),
    ('research', 'Research: Insight Timer', '05-research-insight-timer', [('', 'research-insight-timer.html')], 'html', 'Product and anyone shaping what Aurelia builds next'),
    ('backend-old', 'Backend (old)', '06-backend-old', 'docs/backend-old/BACKEND-OLD.md', 'md', 'Engineers building the new backend'),
    ('artefact', 'Artefact', '07-artefact', 'docs/backend-old/ARTEFACT.md', 'md', 'Product owner and engineers'),
    ('design-system', 'Design system', '08-design-system', None, 'ds', 'Designers and engineers'),
]


def git(*args):
    return subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True).stdout.strip()


def html_to_md(html, images):
    # Screenshot buttons hold the full image in data-full; keep it as an image.
    html = re.sub(r'<button[^>]*class="shot"[^>]*data-full="([^"]+)"[^>]*data-cap="([^"]*)"[^>]*>.*?</button>',
                  lambda m: f'<img src="{m.group(1)}" alt="{m.group(2)}">', html, flags=re.S)
    html = re.sub(r'<(script|style)[^>]*>.*?</\1>', '', html, flags=re.S)
    md = markdownify(html, heading_style='ATX', bullets='-')

    def asset(m):
        src = m.group(2)
        if src.startswith('/guides/'):
            images.add(src)
            src = 'assets' + src[len('/guides'):]
        elif src.startswith('data:'):
            return ''
        return f'![{m.group(1)}](../{src})' if src.startswith('assets') else f'![{m.group(1)}]({src})'

    md = re.sub(r'!\[([^\]]*)\]\(([^)\s]+)[^)]*\)', asset, md)
    md = re.sub(r'\]\(/wiki/([a-z-]+)[^)]*\)', lambda m: f']({next((d[2] for d in DOCS if d[0] == m.group(1)), m.group(1))}.md)', md)
    md = md.replace(')![', ')\n\n![')
    md = re.sub(r'\n{3,}', '\n\n', md)
    return md.strip() + '\n'


def main(out):
    if os.path.exists(out):
        for name in os.listdir(out):
            if name == '.git':
                continue
            path = os.path.join(out, name)
            shutil.rmtree(path) if os.path.isdir(path) else os.remove(path)
    os.makedirs(os.path.join(out, 'wiki'), exist_ok=True)
    images = set()
    sha = git('rev-parse', '--short', 'HEAD')
    branch = git('rev-parse', '--abbrev-ref', 'HEAD')
    rows = []
    for _id, title, name, src, kind, audience in DOCS:
        path = os.path.join(out, 'wiki', name + '.md')
        if kind == 'md':
            text = open(os.path.join(ROOT, src)).read()
            text = re.sub(r'\]\(openapi\.yaml\)', '](openapi.yaml)', text)
            source = src
        elif kind == 'ds':
            text = subprocess.run(['node', '--experimental-strip-types', '--no-warnings', 'scripts/knowledge/design-system.mjs'],
                                  cwd=ROOT, capture_output=True, text=True, check=True).stdout
            source = 'design-tokens/figma-export.json + src/designsystem/'
        else:
            parts = []
            for label, f in src:
                body = html_to_md(open(os.path.join(C, f)).read(), images)
                parts.append(f'> **Version: {label}**\n\n{body}' if label else body)
            text = '\n\n---\n\n'.join(parts) if len(parts) > 1 else parts[0]
            if len(src) > 1:
                text = f'# {title}\n\nThis document comes in {len(src)} versions, in this order: ' + ', '.join(l for l, _ in src) + '. Each tells the same content a different way.\n\n---\n\n' + text
            source = 'src/guides/content/' + ', '.join(f for _, f in src)
        open(path, 'w').write(text)
        rows.append(f'| [{title}](wiki/{name}.md) | {audience} | `{source}` |')
    shutil.copy(os.path.join(ROOT, 'docs/api/openapi.yaml'), os.path.join(out, 'wiki', 'openapi.yaml'))
    for src in sorted(images):
        rel = src[len('/guides/'):]
        dst = os.path.join(out, 'assets', rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(os.path.join(ROOT, 'public', src.lstrip('/'))):
            shutil.copy(os.path.join(ROOT, 'public', src.lstrip('/')), dst)
    readme = f"""# Aurelia knowledge base

The Aurelia team wiki as Markdown, for developers and AI agents who need the
product, the plans and the design without access to the app.

Aurelia builds personal wellness sessions from one sentence: someone says how
they feel, and Aurelia makes a session for it. The apps run on realistic
sample data until the backend exists, so no figure in them is a real result.

| | |
| --- | --- |
| Source | `sandmanz26/aureliamobile`, branch `{branch}` at `{sha}` |
| In the app | `/wiki` (behind the site password) |
| Updated | when the product owner asks; this copy is not synced automatically |

## Documents

| Document | For | Source in the app repository |
| --- | --- | --- |
{chr(10).join(rows)}

`wiki/openapi.yaml` is the API contract in OpenAPI 3.1. Images used by the
guides are in `assets/`.

## Reading order

1. Product requirements: what Aurelia is and what works today.
2. API contract: the backend still to be built.
3. Backend (old) and Artefact: what the 2025 backend left, and what it teaches.
4. Design system: tokens, type and every component.
5. Feedback group playbook and Admin guideline: how the team runs the study and the admin.
6. Research: Insight Timer, and what it means for Aurelia.

## For AI agents

- Treat these documents as the current state of the plan, not as a built system.
- The app repository is the source of truth; if this copy disagrees, the repository wins.
- The prompts quoted in Backend (old) are from 2025 and need the changes listed beside them before reuse.
"""
    open(os.path.join(out, 'README.md'), 'w').write(readme)
    print(f'{len(DOCS)} documents, {len(images)} images -> {out}')


if __name__ == '__main__':
    main(sys.argv[1])
