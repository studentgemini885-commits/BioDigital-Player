# Step 5-6: Package Registration এবং Cloud Build

## ধাপ 5: YtdlpPackage Registration

### 5.1 MainApplication.java এ পরিবর্তন আনুন

আপনার `android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java` ফাইলটি খুলুন এবং নিচের পরিবর্তনগুলি করুন:

#### Step A: Import যোগ করুন (ফাইলের শীর্ষে)
```java
import com.imtiaz.biodigitaltruth.YtdlpPackage;
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
```

#### Step B: getPackages() মেথড খুঁজুন এবং আপডেট করুন
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new YoutubeDLPackage());  // YouTube-DL ইনিশিয়ালাইজেশন
  packages.add(new YtdlpPackage());      // ভিডিও এক্সট্র্যাকশন (নতুন)
  return packages;
}
```

**গুরুত্বপূর্ণ:** দুটি প্যাকেজই রেজিস্টার করা আবশ্যক!

---

## ধাপ 6: ক্লাউড বিল্ড কমান্ড

### 6.1 EAS Build এ APK তৈরি করুন

সব প্রস্তুত হওয়ার পর, এই কমান্ড চালান:

```bash
eas build --platform android --profile preview
```

**অথবা, দ্রুত প্রোডাকশন বিল্ড এর জন্য:**

```bash
eas build --platform android --profile production
```

### 6.2 কমান্ড সম্পর্কে বিবরণ

| Option | উদ্দেশ্য |
|--------|---------|
| `--platform android` | Android APK বিল্ড করুন |
| `--profile preview` | দ্রুত টেস্টিং এর জন্য |
| `--profile production` | স্ট্যাবল রিলিজ বিল্ড |

### 6.3 বিল্ড প্রক্রিয়া

কমান্ড চালানোর পর:

1. **EAS Login করা দরকার** (যদি আগে না করে থাকেন)
   ```bash
   eas login
   ```

2. **প্রজেক্ট সেটআপ** (প্রথমবার)
   ```bash
   eas build:configure
   ```

3. **বিল্ড শুরু হবে**
   - Cloud এ কম্পাইল হবে
   - সব ডিপেন্ডেন্সি ডাউনলোড হবে
   - APK বা AAB তৈরি হবে
   - 10-20 মিনিট সময় লাগতে পারে

4. **Download Link পাবেন**
   ```
   ✅ Build completed successfully!
   📱 APK download link: https://...
   ```

---

## 📱 সম্পূর্ণ ফাইল কম্পিলেশন চেকলিস্ট

### প্রিবিল্ড এর আগে যাচাই করুন:

- [ ] YtdlpModule.kt আছে ✅
- [ ] YtdlpPackage.kt আছে ✅ (এখনই তৈরি হয়েছে)
- [ ] YoutubeDLModule.java আছে ✅
- [ ] YoutubeDLPackage.java আছে এবং আপডেট হয়েছে ✅
- [ ] app.json এ Expo plugins কনফিগার করা আছে ✅
- [ ] App.js এ YouTube-DL initialization আছে ✅

### প্রিবিল্ড চলানোর পর যাচাই করুন:

```bash
# Prebuild রান করুন
npx expo prebuild --clean

# এরপর:
# 1. android/app/build.gradle এ ডিপেন্ডেন্সি যোগ করুন
# 2. Native মডিউল কপি করুন
# 3. MainApplication.java আপডেট করুন

# তারপর ক্লাউড বিল্ড:
eas build --platform android --profile preview
```

---

## 🚀 সম্পূর্ণ কমান্ড সিকোয়েন্স

```bash
# ১. Prebuild তৈরি করুন
npx expo prebuild --clean

# ২. Native মডিউল কপি করুন
mkdir -p android/app/src/main/java/com/imtiaz/biodigitaltruth/
cp android_native/com/imtiaz/biodigitaltruth/* android/app/src/main/java/com/imtiaz/biodigitaltruth/

# ३. android/app/build.gradle এ ডিপেন্ডেন্সি যোগ করুন (ম্যানুয়াল)
# dependencies {
#     // YouTube-DL Android Library
#     implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
#     implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'
# }

# ४. MainApplication.java আপডেট করুন (ম্যানুয়াল)
# - YtdlpPackage import করুন
# - YtdlpPackage() রেজিস্টার করুন getPackages() তে

# ५. EAS কনফিগার করুন (প্রথমবার)
eas build:configure

# ६. ক্লাউডে বিল্ড করুন
eas build --platform android --profile preview

# এবং অপেক্ষা করুন... ✅
```

---

## 📊 ফাইল ট্রি (Final)

```
android_native/
└── com/imtiaz/biodigitaltruth/
    ├── YoutubeDLModule.java      # Init module
    ├── YoutubeDLPackage.java     # Registration (updated)
    ├── YtdlpModule.kt            # Main extraction
    └── YtdlpPackage.kt           # Extraction package ✨ (নতুন)

android/app/src/main/java/com/imtiaz/biodigitaltruth/
├── YoutubeDLModule.java          # (কপি করা)
├── YoutubeDLPackage.java         # (কপি করা)
├── YtdlpModule.kt                # (কপি করা)
├── YtdlpPackage.kt               # (কপি করা) ✨
└── MainApplication.java          # (আপডেট করা)
```

---

## ❓ FAQ

**Q: EAS Build কি বিনামূল্যে?**
A: হ্যাঁ, প্রতি মাসে কিছু free builds আছে। বিস্তারিত: https://expo.dev/pricing

**Q: Preview vs Production ফার্ক কি?**
A: Preview দ্রুত বিল্ড হয় এবং testing এর জন্য। Production fully optimized এবং signed রিলিজ।

**Q: APK কোথায় পাব?**
A: বিল্ড শেষে EAS Dashboard এ download link থাকবে।

**Q: Android 15+ সাপোর্ট করে?**
A: হ্যাঁ, এবং YouTube-DL সব সাম্প্রতিক Android versions সাপোর্ট করে।

**Q: ভিডিও সরাসরি ডাউনলোড করতে চাই?**
A: `YtdlpModule.kt` এ `downloadVideo()` মেথড যোগ করুন (ভবিষ্যত ফেজ)।

---

## 🎯 Success Indicators

### বিল্ড সফল হলে আপনি দেখবেন:

```
✅ Build completed successfully
📱 Download APK: https://updates.expo.dev/...
🎉 Ready to install on Android device!
```

### বিল্ড ফেইল হলে:

```
❌ Build failed
🔍 Check logs: eas build:logs [BUILD_ID]
```

Logs চেক করতে:
```bash
eas build:logs --platform android [BUILD_ID]
```

---

## 📝 পরবর্তী পদক্ষেপ

বিল্ড সফল হওয়ার পর:

1. APK ডাউনলোড করুন
2. Android ডিভাইসে ইনস্টল করুন
3. অ্যাপ খুলুন এবং একটি ভিডিও প্লে করে দেখুন
4. Logcat চেক করুন সব কিছু সঠিক আছে কিনা

**Logcat দেখার কমান্ড:**
```bash
adb logcat | grep -E "(YtdlpModule|YouTube|Error)"
```

---

**Status:** ✅ Phase 1-2 Complete | Ready for Cloud Build
