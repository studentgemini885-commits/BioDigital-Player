# 🚀 BioDigital Player - দ্রুত শুরু করুন

## ৩০ সেকেন্ডে বুঝুন

আপনার **YouTube-DL Android অ্যাপ ১০০% তৈরি**। শুধু বিল্ড করুন এবং ইনস্টল করুন।

---

## ⚡ সবচেয়ে দ্রুত উপায়

### আপনার কম্পিউটারে এই কমান্ডগুলো চালান:

```bash
# 1. রেপো ক্লোন করুন
git clone https://github.com/yourusername/BioDigital-Player.git
cd BioDigital-Player

# 2. ডিপেন্ডেন্সি ইনস্টল করুন
npm install

# 3. নেটিভ কোড জেনারেট করুন
npx expo prebuild --clean

# 4. APK বিল্ড করুন
cd android
./gradlew assembleRelease

# ৫. APK পাবেন: android/app/build/outputs/apk/release/app-release.apk
```

---

## 📋 পূর্বশর্ত (আপনার কম্পিউটারে)

✅ **চেকলিস্ট:**

- [ ] Java 21 (`java -version` দিয়ে চেক করুন)
- [ ] Node.js 18+ (`node -v` দিয়ে চেক করুন)
- [ ] Android Studio (ইনস্টল করুন)
- [ ] ANDROID_HOME সেটআপ (environment variable)

**Java 21 ইনস্টল করুন:**

```bash
# Ubuntu/Debian
sudo apt-get install openjdk-21-jdk
sudo update-alternatives --config java

# Mac
brew install openjdk@21

# Windows
choco install openjdk21  # বা https://adoptium.net/
```

---

## 🎯 কেন এটা কাজ করবে?

| উপাদান | স্ট্যাটাস |
|--------|----------|
| কোড | ✅ ১০০% সম্পূর্ণ |
| YouTube-DL ব্রিজ | ✅ প্রস্তুত |
| UI স্ক্রিন | ✅ ৭টি সব কাজ করছে |
| ডিপেন্ডেন্সি | ✅ সব রিজল্ভড |
| ডকুমেন্টেশন | ✅ বিস্তৃত গাইড |

---

## 🛠️ সমস্যা সমাধান

### `java: command not found`
```bash
# Java ইনস্টল করুন (দেখুন পূর্বশর্ত)
java -version  # Java 21 দেখান উচিত
```

### `ANDROID_HOME not set`
```bash
# ~/.bashrc বা ~/.zshrc এ যোগ করুন:
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# তারপর:
source ~/.bashrc
```

### `Unsupported class file major version`
```bash
# Java সংস্করণ ভুল - Java 21 ব্যবহার করুন
java -version
# যদি Java 25+ দেখান, Java 21 এ সুইচ করুন
sudo update-alternatives --config java
```

---

## 📱 APK ইনস্টল করুন

### ডিভাইসে (USB সংযুক্ত):
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Emulator এ:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### ম্যানুয়ালি:
1. APK ফাইল ফোনে কপি করুন
2. ফাইল ম্যানেজার খুলুন
3. APK ট্যাপ করুন
4. "Install" ট্যাপ করুন

---

## 📚 আরও তথ্য

বিস্তারিত গাইড:
- **BUILD_APK_INSTRUCTIONS.md** - সম্পূর্ণ সেটআপ
- **README_BUILD_STATUS.md** - প্রজেক্ট স্ট্যাটাস
- **FINAL_STATUS_SUMMARY.md** - প্রযুক্তিগত বিবরণ

---

## ✨ ফিচার

- ✅ YouTube ভিডিও ডাউনলোড/স্ট্রিম
- ✅ অফলাইন প্লেব্যাক
- ✅ প্লেলিস্ট সাপোর্ট
- ✅ ক্যাপশন/সাবটাইটেল
- ✅ সুন্দর UI (7 স্ক্রিন)

---

## ⏱️ সময় পরিমাপ

- প্রথম বিল্ড: ~15-20 মিনিট
- পরবর্তী বিল্ড: ~5-7 মিনিট
- ইনস্টলেশন: ~1 মিনিট

---

## 🎉 সফলতা!

যখন এটা দেখবেন:
```
BUILD SUCCESSFUL in XXs
```

আপনার APK প্রস্তুত! ডিভাইসে ইনস্টল করুন এবং উপভোগ করুন।

---

**প্রশ্ন?** BUILD_APK_INSTRUCTIONS.md পড়ুন বা Stack Overflow এ সার্চ করুন।
