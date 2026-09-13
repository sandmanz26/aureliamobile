import 'dart:ui';

/// Turns an SVG `d` attribute into a [Path].
///
/// Exists so a handful of brand and illustration paths can be shared with the
/// web app verbatim — the same string in both codebases, rather than a Flutter
/// approximation that drifts from the SVG it was traced from. It covers the
/// commands those paths use (move, line, horizontal, vertical, cubic, smooth
/// cubic, arc and close) in both absolute and relative form; anything else
/// throws rather than drawing something subtly wrong.
Path parseSvgPath(String d) {
  final path = Path();
  final tokens = _tokenize(d);
  var at = Offset.zero;
  var start = Offset.zero;
  Offset? lastControl;
  var i = 0;
  String? command;

  double next() => tokens[i++] as double;
  Offset nextPoint({required bool relative}) {
    final point = Offset(next(), next());
    return relative ? at + point : point;
  }

  while (i < tokens.length) {
    final token = tokens[i];
    if (token is String) {
      command = token;
      i++;
    } else if (command == null) {
      throw FormatException('path data starts with a number: $d');
    } else if (command == 'M') {
      // A repeated coordinate pair after a moveto is an implicit lineto.
      command = 'L';
      continue;
    } else if (command == 'm') {
      command = 'l';
      continue;
    }

    final relative = command == command.toLowerCase();
    switch (command.toUpperCase()) {
      case 'M':
        at = start = nextPoint(relative: relative);
        path.moveTo(at.dx, at.dy);
        lastControl = null;
      case 'L':
        at = nextPoint(relative: relative);
        path.lineTo(at.dx, at.dy);
        lastControl = null;
      case 'H':
        final x = next();
        at = Offset(relative ? at.dx + x : x, at.dy);
        path.lineTo(at.dx, at.dy);
        lastControl = null;
      case 'V':
        final y = next();
        at = Offset(at.dx, relative ? at.dy + y : y);
        path.lineTo(at.dx, at.dy);
        lastControl = null;
      case 'C':
        final c1 = nextPoint(relative: relative);
        final c2 = nextPoint(relative: relative);
        final end = nextPoint(relative: relative);
        path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, end.dx, end.dy);
        at = end;
        lastControl = c2;
      case 'S':
        // The first control point mirrors the previous curve's second one.
        final c1 = lastControl == null ? at : at * 2 - lastControl;
        final c2 = nextPoint(relative: relative);
        final end = nextPoint(relative: relative);
        path.cubicTo(c1.dx, c1.dy, c2.dx, c2.dy, end.dx, end.dy);
        at = end;
        lastControl = c2;
      case 'A':
        final rx = next();
        final ry = next();
        final rotation = next();
        final largeArc = next() != 0;
        final sweep = next() != 0;
        final end = nextPoint(relative: relative);
        path.arcToPoint(
          end,
          radius: Radius.elliptical(rx, ry),
          // Flutter takes this one in degrees, as SVG writes it.
          rotation: rotation,
          largeArc: largeArc,
          clockwise: sweep,
        );
        at = end;
        lastControl = null;
      case 'Z':
        path.close();
        at = start;
        lastControl = null;
      default:
        throw FormatException('unsupported path command "$command" in: $d');
    }
  }
  return path;
}

/// Splits `d` into command letters and numbers. SVG allows the separators to
/// be commas, spaces or nothing at all, and a minus sign starts a new number
/// even with no separator before it.
List<Object> _tokenize(String d) {
  // Any letter, not just the supported ones: an unsupported command has to
  // reach the switch to be refused, and a letter dropped here would instead
  // have its arguments quietly read as the previous command's.
  final pattern = RegExp(r'[A-Za-z]|-?\d*\.?\d+(?:[eE][-+]?\d+)?');
  return [
    for (final match in pattern.allMatches(d))
      if (RegExp(r'[A-Za-z]').hasMatch(match[0]!))
        match[0]!
      else
        double.parse(match[0]!),
  ];
}
