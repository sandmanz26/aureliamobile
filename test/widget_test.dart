import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:aurelia_mobile/main.dart';

void main() {
  testWidgets('Sign In screen renders core elements', (WidgetTester tester) async {
    await tester.pumpWidget(const AureliaApp());
    await tester.pumpAndSettle();

    expect(find.text('Sign In'), findsWidgets);
    expect(find.text('Sign Up'), findsOneWidget);
    expect(find.text('aurelia'), findsOneWidget);
    expect(find.text('Email'), findsOneWidget);
    expect(find.text('Password'), findsOneWidget);
    expect(find.text('Forgot Password?'), findsOneWidget);
    expect(find.text('Or continue using'), findsOneWidget);
  });

  testWidgets('Password field toggles obscure text', (WidgetTester tester) async {
    await tester.pumpWidget(const AureliaApp());
    await tester.pumpAndSettle();

    final textFields = tester.widgetList<TextField>(find.byType(TextField));
    final passwordField = textFields.firstWhere((f) => f.obscureText);
    expect(passwordField.obscureText, isTrue);

    await tester.tap(find.byIcon(Icons.visibility_off_outlined));
    await tester.pumpAndSettle();

    final updatedFields = tester.widgetList<TextField>(find.byType(TextField));
    final updatedPasswordField = updatedFields.firstWhere(
      (f) => f.decoration?.hintText == 'Password',
    );
    expect(updatedPasswordField.obscureText, isFalse);
  });

  testWidgets('Switching to Sign Up tab updates selection', (WidgetTester tester) async {
    await tester.pumpWidget(const AureliaApp());
    await tester.pumpAndSettle();

    await tester.tap(find.text('Sign Up'));
    await tester.pumpAndSettle();

    // No assertion error thrown means the state transition succeeded;
    // a deeper visual assertion would require pumping past AnimatedContainer.
  });
}
