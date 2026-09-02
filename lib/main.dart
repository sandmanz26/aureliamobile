import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/sign_in_screen.dart';

void main() {
  runApp(const AureliaApp());
}

class AureliaApp extends StatelessWidget {
  const AureliaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aurelia',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const SignInScreen(),
    );
  }
}
