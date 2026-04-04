# YouTube-DL Android Setup Guide

এই গাইডটি আপনার Bio-Digital Player অ্যাপে YouTube-DL ইন্টিগ্রেশন সেটআপের জন্য।

## সম্পূর্ণ সেটআপের ধাপ

### ধাপ 1: প্রিবিল্ড তৈরি করুন (Android নেটিভ কোড জেনারেট করুন)

```bash
npx expo prebuild --clean
```

এই কমান্ডটি:
- Android বিল্ড ফাইল তৈরি করবে
- `android/` ফোল্ডার জেনারেট করবে
- নেটিভ প্লাগইন প্রয়োগ করবে

### ধাপ 2: গ্র্যাডল ডিপেন্ডেন্সি ম্যানুয়ালি যোগ করুন

প্রিবিল্ড চলার পরে:

1. `android/app/build.gradle` ফাইল খুলুন
2. `dependencies { }` ব্লকের ভেতরে নিচের লাইনগুলি যোগ করুন:

```gradle
// YouTube-DL Android Library
implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'
```

### ধাপ 3: নেটিভ মডিউল কপি করুন

1. `android_native/com/imtiaz/biodigitaltruth/` থেকে ফাইলগুলি নিন
2. `android/app/src/main/java/com/imtiaz/biodigitaltruth/` এ কপি করুন

কপি করার কমান্ড:
```bash
mkdir -p android/app/src/main/java/com/imtiaz/biodigitaltruth/
cp android_native/com/imtiaz/biodigitaltruth/* android/app/src/main/java/com/imtiaz/biodigitaltruth/
```

### ধাপ 4: MainApplication.kt আপডেট করুন

`android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java` ফাইলে নিচের ইম্পোর্ট যোগ করুন:

```java
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
```

এবং `getPackages()` মেথডে `YoutubeDLPackage` যোগ করুন:

```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new YoutubeDLPackage());
  return packages;
}
```

### ধাপ 5: অ্যাপ বিল্ড এবং রান করুন

```bash
npx expo run:android
```

অথবা EAS ব্যবহার করে:

```bash
eas build --platform android
```

## ফাইলগুলির ব্যাখ্যা

- **app.json**: Expo প্লাগইন কনফিগারেশন
- **App.js**: YouTube-DL ইনিশিয়ালাইজেশন কোড
- **plugins/with-youtubedl-module.js**: Gradle ডিপেন্ডেন্সি প্লাগইন
- **android_native/**: Kotlin/Java নেটিভ মডিউল কোড

## সমস্যা সমাধান

### "YoutubeDLModule is undefined" ত্রুটি
- নেটিভ মডিউল সঠিক location এ কপি করা হয়েছে কিনা চেক করুন
- MainApplication.java এ YoutubeDLPackage যোগ করা আছে কিনা যাচাই করুন

### Build ব্যর্থ হওয়া
- Gradle dependencies সঠিকভাবে যোগ করা হয়েছে কিনা চেক করুন
- JCenter ও JitPack Maven repositories সক্রিয় আছে কিনা নিশ্চিত করুন

### Runtime ত্রুটি
- অ্যাপ permission অনুমতি চেক করুন (ইন্টারনেট, ফাইল অ্যাক্সেস)
- Logcat এ YouTube-DL ইনিশিয়ালাইজেশন মেসেজ দেখুন

## PlayerScreen.js এ ইন্টিগ্রেশন

আপনার PlayerScreen.js এ ইতিমধ্যে YtDlpModule ইমপোর্ট করা আছে। এখানে কিভাবে ব্যবহার করবেন:

### Option 1: সরাসরি NativeModules ব্যবহার করা

```javascript
import { NativeModules } from 'react-native';
const { YtdlpModule } = NativeModules;

// ভিডিও ইনফো এক্সট্র্যাক্ট করা
YtdlpModule.extractVideoInfo(
  'https://www.youtube.com/watch?v=example',
  '720',
  'info'
).then(result => {
  const videoData = JSON.parse(result);
  setVideoUrl(videoData.url);
  setAudioUrl(videoData.audioUrl);
  setStreamMode(videoData.streamType);
}).catch(error => {
  console.error('Error:', error);
});
```

### Option 2: Hook ব্যবহার করা (Recommended)

```javascript
import { useYtdlExtraction, extractStreamUrls } from '../hooks/useYtdlExtraction';

// সিম্পল ব্যবহার
const result = await useYtdlExtraction(videoUrl, quality);
if (result.success) {
  const { url, audioUrl, streamType } = result.data;
  // ভিডিও প্লেয়ারে সেট করুন
}

// অথবা সিধাসিধি stream URLs পান
const streams = await extractStreamUrls(videoUrl, '720p');
setVideoUrl(streams.videoUrl);
setAudioUrl(streams.audioUrl);
```

## YtdlpModule এর Methods

### extractVideoInfo(videoUrl, quality, action)

YouTube ভিডিও থেকে সব তথ্য এবং স্ট্রিম URL বের করে।

**Parameters:**
- `videoUrl` (string): YouTube ভিডিও URL
- `quality` (string): চাহিদাকৃত কোয়ালিটি (e.g., '720', '1080', '360')
- `action` (string): অ্যাকশন টাইপ (e.g., 'info', 'download')

**Returns:**
```json
{
  "success": true,
  "url": "video_stream_url",
  "audioUrl": "audio_stream_url or null",
  "streamType": "combined" | "separate",
  "actualQuality": "720p",
  "captions": [...]
}
```

## ফাইল স্ট্রাকচার

```
android_native/
├── com/imtiaz/biodigitaltruth/
│   ├── YoutubeDLModule.java      // ইনিশিয়ালাইজেশন
│   ├── YoutubeDLPackage.java     // প্যাকেজ রেজিস্ট্রেশন
│   ├── YtdlpModule.kt            // মূল extraction লজিক ✨ (নতুন)
│   └── YtdlpModule.kt            // Kotlin implementation ✨ (নতুন)

hooks/
└── useYtdlExtraction.js          // React Hook ✨ (নতুন)

plugins/
└── with-youtubedl-module.js      // Gradle config প্লাগইন

Screens/
└── PlayerScreen.js               // ভিডিও প্লেয়ার (ইন্টিগ্রেশন পয়েন্ট)

app.json                           // Expo কনফিগারেশন
App.js                             // YoutubeDL ইনিশিয়ালাইজেশন
```

## সম্ভাব্য সমস্যা এবং সমাধান

### "YtdlpModule is not available" ত্রুটি

**কারণ:** নেটিভ মডিউল সঠিকভাবে রেজিস্টার করা হয়নি

**সমাধান:**
1. `MainApplication.java` এ যাচাই করুন যে `YoutubeDLPackage` যোগ করা আছে
2. প্রিবিল্ড এবং বিল্ড পুনরায় চালান: `npx expo prebuild --clean && npx expo run:android`

### Kotlin Compilation Error

**কারণ:** Kotlin ডিপেন্ডেন্সি বা সংস্করণ সমস্যা

**সমাধান:**
```gradle
// android/build.gradle এ যোগ করুন:
ext {
    kotlin_version = '1.9.10'
}
```

### "com.yausername.youtubedl_android" প্যাকেজ পাওয়া যায় না

**কারণ:** JitPack Maven repository সংযোজিত নয়

**সমাধান:** app.json এ নিশ্চিত করুন:
```json
"android": {
  "extraMavenRepos": ["https://jitpack.io"]
}
```

## পরবর্তী পদক্ষেপ

1. **প্রিবিল্ড তৈরি করুন:**
   ```bash
   npx expo prebuild --clean
   ```

2. **Gradle ডিপেন্ডেন্সি যোগ করুন:** (YOUTUBEDL_SETUP.md এ বর্ণিত)

3. **নেটিভ মডিউল কপি করুন:**
   ```bash
   mkdir -p android/app/src/main/java/com/imtiaz/biodigitaltruth/
   cp android_native/com/imtiaz/biodigitaltruth/* android/app/src/main/java/com/imtiaz/biodigitaltruth/
   ```

4. **অ্যাপ বিল্ড এবং রান করুন:**
   ```bash
   npx expo run:android
   ```

5. **PlayerScreen.js এ Hook ব্যবহার করুন** ভিডিও স্ট্রিম URL পেতে

## ডাউনলোড এবং অন্যান্য ফিচার

আগামী ফেজে যোগ করুন:
- ভিডিও ডাউনলোড ফাংশন
- অডিও এক্সট্র্যাকশন
- প্লেলিস্ট ডাউনলোড
- ডাউনলোড প্রগতি ট্র্যাকিং
- ক্যাশিং এবং স্টোরেজ ম্যানেজমেন্ট
