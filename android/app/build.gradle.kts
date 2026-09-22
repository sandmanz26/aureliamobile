import java.util.Properties

plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// A real release keystore, read from a file that is `.gitignore`d and does
// not exist in this checkout — so the seam is here before the keystore is,
// the same order everything else in this app (SSO, the audio engine, the
// microphone) was built in. Absent, `release` keeps signing with the debug
// key exactly as it does today; present, nothing else in this file changes.
val keystoreProperties = Properties()
val keystorePropertiesFile = rootProject.file("key.properties")
val hasReleaseKeystore = keystorePropertiesFile.exists()
if (hasReleaseKeystore) {
    keystoreProperties.load(keystorePropertiesFile.inputStream())
}

android {
    namespace = "com.aurelia.care.aurelia_mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    // 17, not the 1.8 this file carried. AGP 9 does not accept 1.8 at all.
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "com.aurelia.care.aurelia_mobile"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                storeFile = file(keystoreProperties.getProperty("storeFile"))
                storePassword = keystoreProperties.getProperty("storePassword")
                keyAlias = keystoreProperties.getProperty("keyAlias")
                keyPassword = keystoreProperties.getProperty("keyPassword")
            }
        }
    }

    buildTypes {
        release {
            // Real signing once key.properties exists (see above); until then
            // this is unchanged — the debug key, so `flutter run --release`
            // keeps working with nothing to configure. A store built this way
            // must not ship: Android and app-signing verification cannot tell
            // it apart from anyone else's debug-signed build.
            signingConfig = if (hasReleaseKeystore) {
                signingConfigs.getByName("release")
            } else {
                signingConfigs.getByName("debug")
            }
        }
    }
}

// `kotlinOptions` was removed in Kotlin 2.x; this is its replacement, and it
// takes the JvmTarget enum rather than a string.
kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
