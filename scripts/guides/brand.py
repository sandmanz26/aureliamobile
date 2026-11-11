"""Aurelia's brand, for the generated documents (playbook, admin guideline).

The same artwork the app ships: the logo lockup from src/assets, the
#FF8514 → #FFE270 gradient of the mark, the soft #FFE682 glow behind Home's
hero, and the network artwork that closes Home. Nothing here is redrawn.
"""
import base64, itertools, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
_ids = itertools.count(1)

GRADIENT = 'linear-gradient(135deg, #FF8514 0%, #FFB347 55%, #FFE270 100%)'


def _svg(name, label, height):
    svg = open(os.path.join(ROOT, 'src/assets', name)).read().strip()
    # Gradient ids must be unique per page, or a second copy paints with the first's.
    n = next(_ids)
    svg = re.sub(r'(paint\d+_linear_\d+_\d+)', lambda m: f'{m.group(1)}_{n}', svg)
    head, rest = svg.split('>', 1)
    head = re.sub(r'\s(width|height)="[^"]*"', '', head)
    return head.replace('<svg', f'<svg role="img" aria-label="{label}" height="{height}" style="width:auto;display:block"', 1) + '>' + rest


def logo(height=28):
    """Mark and wordmark, as in the admin sidebar."""
    return _svg('aurelia-sidebar-logo.svg', 'Aurelia', height)


def mark(height=40):
    """The mark alone, as on Home."""
    return _svg('logo-homepage.svg', 'Aurelia', height)


def network_uri():
    with open(os.path.join(ROOT, 'src/assets/aurelia-network.png'), 'rb') as f:
        return 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
