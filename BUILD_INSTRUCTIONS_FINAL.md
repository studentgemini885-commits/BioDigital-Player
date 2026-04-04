# 🚀 BioDigital Player - Local APK Build Guide

আপনার মেশিনে APK বিল্ড করার জন্য সম্পূর্ণ গাইড।

## প্রয়োজনীয় সফটওয়্যার

### Windows/Mac/Linux Common:
1. **Node.js 18+** - https://nodejs.org/
2. **Java 21** - https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html
3. **Android Studio** - https://developer.android.com/studio
4. **Git** - https://git-scm.com/

### Android Studio Setup:
- Install Android SDK Platform 34+
- Install Android Build Tools 34.0.0+
- Install Android Emulator (optional)

## ধাপ ১: পরিবেশ ভেরিয়েবল সেটআপ

### Windows (PowerShell এ এই কমান্ড চালান):
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.x.x"
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"
```

### Mac/Linux:
```bash
export JAVA_HOME=/usr/libexec/java_home -v 21
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

## ধাপ ২: প্রজেক্ট সেটআপ

```bash
# সোর্স কোড ডাউনলোড (যদি Git repo থেকে)
git clone <repository-url>
cd BioDigital-Player

# বা সরাসরি ফোল্ডারে যান
cd BioDigital-Player
```

## ধাপ ৩: ডিপেন্ডেন্সি ইনস্টল

```bash
# NPM প্যাকেজ ইনস্টল
npm install

# EAS CLI ইনস্টল (অপশনাল, শুধু EAS বিল্ডের জন্য)
npm install -g eas-cli
```

## ধাপ ৪: নেটিভ কোড জেনারেট করুন

```bash
# Expo prebuild - এটি নেটিভ Android কোড তৈরি করবে
npx expo prebuild --clean
```

এই স্টেপ সাফল্যের পর `android/` ফোল্ডার generate হবে।

## ধাপ ৫: এখন দুটি অপশন আছে:

### অপশন A: Gradle কমান্ড দিয়ে বিল্ড (সবচেয়ে সহজ)

```bash
# Release APK বিল্ড
cd android
./gradlew assembleRelease

# বা এক লাইনে
./gradlew --project-dir=android assembleRelease
```

**APK লোকেশন**: `android/app/build/outputs/apk/release/app-release.apk`

### অপশন B: Android Studio GUI দিয়ে বিল্ড

1. Android Studio খুলুন
2. File > Open > বর্তমান প্রজেক্ট ফোল্ডার খুলুন
3. Build > Build Bundle(s) / APK(s) > Build APK(s) ক্লিক করুন
4. বিল্ড সম্পন্ন হওয়ার অপেক্ষা করুন

## ধাপ ৬: APK ইনস্টল করুন

```bash
# ADB দিয়ে ডিভাইস/এমুলেটরে ইনস্টল
adb install android/app/build/outputs/apk/release/app-release.apk

# বা ম্যানুয়ালি APK ফাইল ডাউনলোড করে ইনস্টল করুন
```

## বিল্ড টাইম

- প্রথমবার: **15-25 মিনিট** (সব ডিপেন্ডেন্সি ডাউনলোড)
- পরবর্তীতে: **5-10 মিনিট** (ক্যাশ থেকে)

## সম্ভাব্য সমস্যা এবং সমাধান

### Error: "ANDROID_HOME is not set"
```bash
# পরিবেশ ভেরিয়েবল সঠিকভাবে সেট করুন এবং ক্লিক করুন এবং আবার চেষ্টা করুন
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
```

### Error: "No matching variant of com.facebook.react:react-android"
```bash
# Gradle cache ক্লিয়ার করুন এবং আবার বিল্ড করুন
./gradlew clean
./gradlew assembleRelease
```

### Error: "Unsupported class file major version"
- Java সংস্করণ চেক করুন: `java -version`
- Java 21 ইনস্টল করুন এবং JAVA_HOME সেট করুন

### Build hung/stuck?
- Android Gradle Plugin syncing এ অপেক্ষা করতে পারে (প্রথমবার)
- 30+ মিনিট অপেক্ষা করুন, interrupt করবেন না

## সফল বিল্ডের সাইন

```
BUILD SUCCESSFUL in 8m 45s
50 actionable tasks: 1 executed, 49 up-to-date
```

এবং APK ফাইল তৈরি হবে:
```
android/app/build/outputs/apk/release/app-release.apk
```

## APK ফাইল আপলোড করুন (সার্ভারে শেয়ার করার জন্য)

### transfer.sh ব্যবহার করে:
```bash
curl --upload-file android/app/build/outputs/apk/release/app-release.apk \
  https://transfer.sh/BioDigital-Player.apk
```

আউটপুট একটি ডাউনলোড লিংক দেবে।

### GitHub Release এ:
```bash
gh auth login
gh release create v1.0.0 android/app/build/outputs/apk/release/app-release.apk
```

## আরও সাহায্য

- Expo ডকুমেন্টেশন: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- Android বিল্ড: https://developer.android.com/build

---

**গুরুত্বপূর্ণ**: প্রথম বিল্ডে অনেক সময় লাগবে কারণ Gradle সব ডিপেন্ডেন্সি ডাউনলোড করবে। ইন্টারনেট কানেকশন স্থিতিশীল রাখুন।

