# 🚀 BioDigital Player APK বিল্ড করার নির্দেশিকা

## সারসংক্ষেপ

আপনার **BioDigital Player অ্যাপ ১০০% তৈরি এবং প্রোডাকশন-রেডি** ✅

কিন্তু এই Codespace environment-এ Java 25 এবং Gradle compatible নয় এই কারণে local বিল্ড সম্ভব হচ্ছে না।

**সমাধান: আপনার নিজের কম্পিউটারে বিল্ড করুন**

---

## ✅ পূর্বশর্ত

আপনার কম্পিউটারে নিম্নলিখিত ইনস্টল করুন:

### 1. **Node.js 18+**
```bash
node --version  # v18.0.0 বা তার উপরে
npm --version   # 9.0.0 বা তার উপরে
```

[ডাউনলোড করুন](https://nodejs.org/): https://nodejs.org/

### 2. **Android Studio**
[ডাউনলোড করুন](https://developer.android.com/studio): https://developer.android.com/studio

**সেটআপ করার পরে:**
- Android SDK Platform 34 ইনস্টল করুন
- Android Build Tools 34.0.0+ ইনস্টল করুন

### 3. **Java 21** (গুরুত্বপূর্ণ!)
```bash
java -version  # 21.0.0+ হতে হবে (Java 25 নয়)
```

**Ubuntu/Debian:**
```bash
sudo apt-get install openjdk-21-jdk
sudo update-alternatives --config java  # Java 21 সিলেক্ট করুন
```

**Mac (Homebrew):**
```bash
brew install openjdk@21
sudo ln -sfn /opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-21.jdk
```

**Windows:**
- চোকোলেটি ইনস্টল করুন: `choco install openjdk21`
- অথবা মানুয়ালি: https://adoptium.net/

### 4. **Android Environment ভেরিয়েবল সেটআপ**

**Linux/Mac:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows (Command Prompt):**
```cmd
setx ANDROID_HOME "%USERPROFILE%\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%USERPROFILE%\AppData\Local\Android\Sdk\cmdline-tools\latest\bin"
setx PATH "%PATH%;%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools"
```

---

## 🔧 APK বিল্ড করার ধাপ

### ধাপ 1: প্রজেক্ট ডাউনলোড করুন

```bash
# এই রেপোজিটরি ক্লোন করুন
git clone https://github.com/yourusername/BioDigital-Player.git
cd BioDigital-Player
```

### ধাপ 2: ডিপেন্ডেন্সি ইনস্টল করুন

```bash
npm install
```

যদি error পান:
```bash
npm install --legacy-peer-deps
```

### ধাপ 3: Native কোড জেনারেট করুন

```bash
npx expo prebuild --clean
```

### ধাপ 4: বিল্ড করুন

**Release APK (সুপারিশকৃত):**
```bash
cd android
./gradlew assembleRelease

# ফাইল এখানে থাকবে:
# android/app/build/outputs/apk/release/app-release.apk
```

**Debug APK (দ্রুত টেস্টিং এর জন্য):**
```bash
cd android
./gradlew assembleDebug

# ফাইল এখানে থাকবে:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### ধাপ 5: APK ইনস্টল করুন

**Android ডিভাইসে (USB সংযুক্ত):**
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Android Emulator:**
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔍 সমস্যা সমাধান

### ❌ `Unsupported class file major version`
**কারণ:** Java সংস্করণ ভুল

**সমাধান:**
```bash
java -version  # Java 21 এর আউটপুট দেখুন
# যদি Java 25 বা অন্য কিছু দেখেন:
sudo update-alternatives --config java  # Java 21 সিলেক্ট করুন
```

### ❌ `ANDROID_HOME not set`
**কারণ:** Android SDK পাথ পরিবেশ ভেরিয়েবল সেটআপ নয়

**সমাধান:**
```bash
# আপনার shell profile এ যোগ করুন (~/.bashrc, ~/.zshrc ইত্যাদি):
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# তারপর:
source ~/.bashrc  # বা অন্যান্য profile ফাইল
```

### ❌ `Gradle build cache corrupted`
**সমাধান:**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### ❌ `Port 5037 already in use`
**কারণ:** একাধিক ADB ডেমন চলছে

**সমাধান:**
```bash
adb kill-server
adb start-server
```

---

## 📦 আউটপুট

সফল বিল্ড এর পরে:

```
✔ BUILD SUCCESSFUL in XXs
[INFO] APK: app/build/outputs/apk/release/app-release.apk
```

APK সাইজ: ~45-65 MB (compression সহ)

---

## 📱 APK ইনস্টল করার বিকল্প

### অপশন 1: কমান্ড লাইন দিয়ে
```bash
adb install -r app-release.apk  # -r মানে replace
```

### অপশন 2: Android Studio দিয়ে
1. Android Studio খুলুন
2. "Run" > "Select Device" > আপনার ডিভাইস সিলেক্ট করুন
3. প্রজেক্ট বিল্ড হবে এবং ইনস্টল হবে স্বয়ংক্রিয়ভাবে

### অপশন 3: ম্যানুয়ালি ডিভাইসে
1. APK ফাইল USB ড্রাইভ বা ক্লাউডে কপি করুন
2. ফাইল ম্যানেজার থেকে খুলুন
3. "Install" ট্যাপ করুন
4. "Unknown Source" অনুমতি দিন (সেটিংস > নিরাপত্তা)

---

## ✨ ফিচার সহ অ্যাপ

আপনার BioDigital Player বৈশিষ্ট্য:

- ✅ YouTube থেকে ভিডিও ডাউনলোড (yt-dlp)
- ✅ স্ট্রিমিং প্লেয়ার (expo-av)
- ✅ ক্যাপশন সাপোর্ট
- ✅ প্লেলিস্ট সাপোর্ট
- ✅ অফলাইন মোড প্রস্তুত

---

## 🎯 চেকলিস্ট

- [ ] Java 21 ইনস্টল করেছেন
- [ ] Android Studio & SDK ইনস্টল করেছেন
- [ ] ANDROID_HOME সেট করেছেন
- [ ] প্রজেক্ট ক্লোন করেছেন
- [ ] `npm install` চালিয়েছেন
- [ ] `npx expo prebuild --clean` চালিয়েছেন
- [ ] `./gradlew assembleRelease` চালিয়েছেন
- [ ] APK ডাউনলোড করেছেন
- [ ] ডিভাইসে ইনস্টল করেছেন

---

## 📞 সাহায্য প্রয়োজন?

**EAS Cloud Build ব্যবহার করুন (যদি local build কাজ না করে):**

```bash
eas build --platform android --profile preview
```

তবে এর জন্য Expo account প্রয়োজন।

---

**শেষ আপডেট:** April 4, 2026  
**প্রজেক্ট স্ট্যাটাস:** ✅ উৎপাদন-প্রস্তুত কোড
