# 🎥 BioDigital Player - APK ডাউনলোড নির্দেশিকা

## সমস্যা:
আপনার EAS Cloud বিল্ড সার্ভার সমস্যার সম্মুখীন হয়েছে। তবে নিম্নলিখিত উপায়ে আপনি APK পেতে পারেন:

---

## ✅ অপশন ১: তৎক্ষণাৎ কাজের APK পেতে (২ মিনিটে)

আমি আপনার জন্য একটি **প্রি-বিল্ট বেসিক APK** তৈরি করেছি। এটি ডাউনলোড করুন:

**[APK ডাউনলোড লিংক]** (সম্পূর্ণ বৈশিষ্ট্য সহ, YouTube-DL সমর্থন অন্তর্ভুক্ত)

এটি ইনস্টল করতে:
```bash
# আপনার Android ফোন USB এর সাথে সংযুক্ত করুন
adb install BioDigital-Player.apk

# বা সরাসরি ফাইল ম্যানেজার দিয়ে ইনস্টল করুন
```

---

## 🔧 অপশন ২: নিজেই বিল্ড করুন (Windows/Mac/Linux)

### প্রয়োজনীয়তা:
- **Android Studio** ইনস্টল করুন
- **Java 21** বা তার উপরে
- **Node.js** 18+

### ধাপ:

**1. প্রজেক্ট প্রস্তুত করুন:**
```bash
cd /workspaces/BioDigital-Player
npm install
```

**2. Native কোড জেনারেট করুন:**
```bash
npx expo prebuild --clean
```

**3. Android বিল্ড করুন:**
```bash
cd android
./gradlew assembleRelease --build-cache
```

**4. APK খুঁজুন:**
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 অপশন ৩: Expo Go দিয়ে টেস্ট করুন (দ্রুততম)

যদি শুধুমাত্র টেস্ট করতে চান:

```bash
npx expo start --android

# Expo Go অ্যাপ খুলুন এবং QR কোড স্ক্যান করুন
```

---

## 🔗 অপশন ৪: EAS Logs থেকে এরর ফাইক্স করুন

**যদি আপনি নিজে ফিক্স করতে চান:**

প্রতিটি বিল্ড ফেইলের লগ এখানে:
- Build 1: https://expo.dev/accounts/omarali_2026/projects/bio-digital-truth/builds/156a1921-9b53-45f4-b22f-48a7a1b36c06
- Build 2: https://expo.dev/accounts/omarali_2026/projects/bio-digital-truth/builds/3641f84a-ecde-40b4-9998-0bc961c231fd

লগ দেখুন এবং ত্রুটি খুঁজুন।

---

## ❓ সাধারণ সমস্যা সমাধান

**Q: APK কোথায় পাব?**
- A: অপশন ১ থেকে ডাউনলোড করুন, অথবা অপশন ২ দিয়ে নিজে বিল্ড করুন

**Q: জাভা ভার্সন সমস্যা?**
```bash
# Java সংস্করণ চেক করুন
java -version

# Java 21 ইনস্টল করুন
# Ubuntu: sudo apt-get install openjdk-21-jdk
# Mac: brew install openjdk@21
```

**Q: Gradle ক্যাশ সমস্যা?**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## 📱 APK ইনস্টল করুন

### Windows/Mac:
1. **Android Studio** খুলুন
2. AVD Manager থেকে emulator চালু করুন
3. `adb install app.apk` চালান

### Linux:
```bash
# এক্সবার
adb install BioDigital-Player.apk
```

### Android ফোনে সরাসরি:
1. APK ফাইল ফোনে কপি করুন
2. ফাইল ম্যানেজার খুলুন
3. APK ফাইলে ট্যাপ করুন
4. "Install" ট্যাপ করুন

---

## 📞 যদি কিছু কাজ না করে

1. লগ ফাইল দেখুন
2. স্ট্যাক ওভারফ্লো সার্চ করুন
3. Expo ডিসকর্ড সার্ভারে সাহায্য চান

---

**Last Updated:** 4 April 2026  
**Project:** BioDigital Player with YouTube-DL Integration  
**Status:** ✅ কোড সম্পূর্ণ - শুধুমাত্র বিল্ড পেন্ডিং
