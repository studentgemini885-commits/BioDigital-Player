# আপনার BioDigital Player APK ডাউনলোড করুন

## অপশন ১: EAS ক্লাউড থেকে (যদি বিল্ড সফল হয়)

1. **বিল্ড স্ট্যাটাস চেক করুন:**
   ```bash
   eas build --list
   ```

2. **বিল্ড ID খুঁজুন এবং ডাউনলোড করুন:**
   ```bash
   eas build --list --platform android
   ```

3. **সফল বিল্ড থেকে APK ডাউনলোড করুন:**
   - EAS ড্যাশবোর্ডে যান: https://expo.dev/accounts/omarali_2026/projects/bio-digital-truth
   - "Builds" ট্যাবে যান
   - সবুজ চেকমার্ক সহ বিল্ড খুঁজুন
   - "Download" বোতাম ক্লিক করুন

## অপশন ২: লোকাল APK বিল্ড (যদি EAS ব্যর্থ হয়)

### প্রয়োজনীয় জিনিস:
- Android SDK সেটআপ (`$ANDROID_HOME` পরিবেশ ভেরিয়েবল)
- Java 21 বা তার উপরে
- মিনিমাম 8GB RAM

### স্টেপ:

```bash
cd /workspaces/BioDigital-Player

# ১. প্রজেক্ট প্রিবিল্ড করুন
npx expo prebuild --clean

# ২. গ্রেডল বিল্ড চালান
cd android
./gradlew assembleRelease

# ৩. APK খুঁজুন
# ফাইল এখানে থাকবে:
# android/app/build/outputs/apk/release/app-release.apk
```

### সম্ভাব্য সমস্যা সমাধান:

**Java সংস্করণ সমস্যা:**
```bash
# Java সংস্করণ চেক করুন
java -version

# Java 21 ইনস্টল করুন (যদি না থাকে)
# Ubuntu/Debian:
sudo apt-get install openjdk-21-jdk

# ম্যাক:
brew install openjdk@21
```

**Gradle cache সমস্যা:**
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

## অপশন ৩: Expo Prebuild + Local Build

```bash
# প্রজেক্ট প্রিবিল্ড করুন (Expo ব্যবহার করে native কোড জেনারেট করবে)
npx expo prebuild --clean

# তারপর local gradle দিয়ে বিল্ড করুন
cd android && ./gradlew assembleDebug

# ডিবাগ APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## APK ইনস্টল করুন

```bash
# আপনার Android ডিভাইসে (USB সংযুক্ত থাকতে হবে):
adb install /path/to/app.apk

# বা সরাসরি ডিভাইসে ফাইল কপি করে ইনস্টল করুন
```

---
**শেষ আপডেট:** $(date)
**প্রজেক্ট:** BioDigital Player YouTube-DL Integration
