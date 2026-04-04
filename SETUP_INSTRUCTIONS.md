# 🚀 BioDigital Player - সম্পূর্ণ সেটআপ গাইড

## ✅ আপনার কাছে যা আছে

এই প্রকল্পে সম্পূর্ণ **YouTube-DL React Native ভিডিও প্লেয়ার অ্যাপ** অন্তর্ভুক্ত রয়েছে।

### 📦 ডেলিভারেবলস:

✅ **React Native সোর্স কোড** - সম্পূর্ণ এবং কাজ করতে প্রস্তুত
- 7টি স্ক্রিন কম্পোনেন্ট
- নেভিগেশন সেটআপ
- সব ডিপেন্ডেন্সি কনফিগার করা

✅ **নেটিভ Android ব্রিজ** (Kotlin)
- `YtdlpModule.kt` - YouTube-DL ইন্টিগ্রেশন
- `YtdlpPackage.kt` - React Native প্যাকেজ
- `MainApplication.kt` - আপডেট করা

✅ **বিল্ড কনফিগারেশন**
- `build.gradle` - সব লাইব্রেরি কনফিগার করা
- `app.json` - Expo সেটিংস
- `gradle.properties` - Gradle অপশন

✅ **সম্পূর্ণ ডকুমেন্টেশন**
- এই ফাইল আপনি পড়ছেন
- অন্যান্য গাইড ফাইলগুলি

---

## 🎯 ৩টি সহজ ধাপে APK তৈরি করুন

### ধাপ ১: আপনার মেশিনে প্রয়োজনীয় সফটওয়্যার ইনস্টল করুন

#### Windows:

1. **Java 21 ডাউনলোড ও ইনস্টল করুন**
   - https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html
   - ইনস্টল করুন: `C:\Program Files\Java\jdk-21.x.x`

2. **Android Studio ডাউনলোড ও ইনস্টল করুন**
   - https://developer.android.com/studio
   - ইনস্টল করুন এবং SDK ইনস্টল করতে দিন

3. **Node.js 18+ ডাউনলোড ও ইনস্টল করুন**
   - https://nodejs.org/

#### Mac:

```bash
# Homebrew ব্যবহার করে
brew install java21
brew install android-studio
brew install node
```

#### Linux:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install openjdk-21-jdk
sudo apt-get install nodejs npm
# Android Studio: Manual download থেকে
```

---

### ধাপ ২: পরিবেশ ভেরিয়েবল সেটআপ করুন

#### Windows (PowerShell):

```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.x.x"
$env:ANDROID_HOME = "$env:USERPROFILE\AppData\Local\Android\Sdk"
$env:PATH += ";$env:JAVA_HOME\bin;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\platform-tools"

# যাচাই করুন:
java -version
```

#### Mac/Linux:

```bash
# ~/.bashrc বা ~/.zshrc এ যোগ করুন:
export JAVA_HOME=/usr/libexec/java_home -v 21
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# তারপর চালান:
source ~/.bashrc  # বা ~/.zshrc
java -version
```

---

### ধাপ ৩: প্রকল্প সেটআপ এবং বিল্ড করুন

#### একটি টার্মিনাল খুলুন এবং এই কমান্ডগুলি চালান:

```bash
# ১. প্রকল্পে যান
cd BioDigital-Player

# ২. NPM ডিপেন্ডেন্সি ইনস্টল করুন (প্রথমবার ~3 মিনিট)
npm install

# ৩. নেটিভ Android কোড জেনারেট করুন (প্রথমবার ~2 মিনিট)
npx expo prebuild --clean

# ৪. APK বিল্ড করুন (প্রথমবার ~15-25 মিনিট)
cd android
./gradlew assembleRelease

# বা Windows এ:
# gradlew assembleRelease
```

---

## 📍 APK ফাইল পাওয়া যাবে এখানে:

```
android/app/build/outputs/apk/release/app-release.apk
```

ফাইল সাইজ: সাধারণত 50-80 MB

---

## 📱 APK ইনস্টল করুন

### অপশন A: সরাসরি ট্যাপ করুন

1. APK ফাইল আপনার Android ফোনে কপি করুন
2. File Manager খুলুন
3. APK ফাইলে ট্যাপ করুন
4. "Install" ক্লিক করুন

### অপশন B: ADB ব্যবহার করুন

```bash
# ফোন USB তে কানেক্ট করুন, তারপর:
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔧 বিল্ড সমস্যা সমাধান

### Error: "ANDROID_HOME is not set"

**সমাধান:**
```bash
# Windows:
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk

# Mac/Linux:
export ANDROID_HOME=$HOME/Android/Sdk
```

### Error: "Unsupported class file major version"

**সমাধান:** Java সংস্করণ ঠিক আছে কিনা চেক করুন

```bash
java -version
# Output: 21.x.x হওয়া উচিত

# যদি না হয়, JAVA_HOME আপডেট করুন এবং আবার চেষ্টা করুন
```

### Build খুবই ধীর বা স্টক হয়ে গেছে?

**সমাধান:** স্বাভাবিক। প্রথম বিল্ডে:
- Gradle ডাউনলোড করে (~50 MB)
- সব ডিপেন্ডেন্সি ডাউনলোড করে (~3 GB)
- কম্পাইল করে

**সাধারণ বিল্ড টাইম:**
- প্রথম বিল্ড: 15-25 মিনিট
- পরবর্তী বিল্ড: 5-10 মিনিট

### Gradle Cache সমস্যা?

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## ✨ অ্যাপের ফিচার

### কোর ফাংশনালিটি:
✅ YouTube ভিডিও ডাউনলোড করুন  
✅ মাল্টি-কোয়ালিটি সাপোর্ট (360p-4320p)  
✅ ভিডিও স্ট্রিম করুন  
✅ অফলাইন প্লেব্যাক  
✅ প্লেলিস্ট তৈরি করুন  

### ইউজার ইন্টারফেস:
✅ সুন্দর Material Design  
✅ 7টি সম্পূর্ণ স্ক্রিন  
✅ মসৃণ অ্যানিমেশন  
✅ ডার্ক থিম সাপোর্ট  
✅ দ্রুত নেভিগেশন  

### পারফরম্যান্স:
✅ দ্রুত ভিডিও এক্সট্র্যাকশন  
✅ দক্ষ মেমরি ব্যবহার  
✅ মসৃণ 60fps প্লেব্যাক  
✅ ব্যাকগ্রাউন্ড প্রসেসিং  

---

## 🛠️ টেক স্ট্যাক

**ফ্রন্টএন্ড:**
- React Native + Expo
- 658 NPM প্যাকেজ
- Material Design

**ব্যাকএন্ড:**
- Kotlin (নেটিভ Android)
- YouTube-DL (yt-dlp v0.16)
- Async কোরুটিনস

**বিল্ড সিস্টেম:**
- Gradle 8.13
- Java 21
- Android API 34+

---

## 📋 সিস্টেম প্রয়োজনীয়তা

**মিনিমাম Android:**
- Android 8.0 (API 24)
- RAM: 2 GB
- স্টোরেজ: 100 MB ফ্রি স্পেস

**বিল্ডের জন্য:**
- Java 21
- Android SDK Platform 34+
- Node.js 18+

---

## 🚀 দ্রুত রেফারেন্স কমান্ড

```bash
# ডিপেন্ডেন্সি ইনস্টল
npm install

# নেটিভ কোড জেনারেট করুন
npx expo prebuild --clean

# বিল্ড ক্লিন করুন
cd android && ./gradlew clean

# Release APK বিল্ড করুন
./gradlew assembleRelease

# Debug APK বিল্ড করুন (দ্রুত)
./gradlew assembleDebug

# ডিভাইসে ইনস্টল করুন
adb install app/build/outputs/apk/release/app-release.apk

# Gradle সিঙ্ক করুন
./gradlew sync
```

---

## 🎉 সফলতার চিহ্ন

যখন বিল্ড সফল হয়, আপনি দেখবেন:

```
BUILD SUCCESSFUL in 8m 45s
50 actionable tasks: 1 executed, 49 up-to-date
```

এবং APK ফাইল থাকবে:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📞 আরও সাহায্যের জন্য

- **Expo ডকুমেন্টেশন:** https://docs.expo.dev/
- **React Native:** https://reactnative.dev/
- **Android বিল্ড:** https://developer.android.com/build
- **Gradle:** https://gradle.org/

---

## ⚠️ গুরুত্বপূর্ণ নোট

1. **প্রথম বিল্ড ধীর হবে** - এটি স্বাভাবিক, অপেক্ষা করুন
2. **ইন্টারনেট দ্রুত থাকা প্রয়োজন** - বড় ফাইল ডাউনলোড
3. **স্টোরেজ প্রয়োজন** - ~10 GB টেম্পরারি স্পেস
4. **JAVA_HOME সঠিক হতে হবে** - নয়তো বিল্ড ব্যর্থ হবে

---

**সবকিছু প্রস্তুত! শুধু ৩টি ধাপ অনুসরণ করুন এবং আপনার APK পাবেন।** 🎬

Happy Building! 🚀
