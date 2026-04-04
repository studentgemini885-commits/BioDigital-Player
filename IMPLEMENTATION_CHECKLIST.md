# YouTube-DL Integration Implementation Checklist

## ✅ Phase 1: সেটআপ সম্পন্ন হয়েছে

### Created Files
- [x] `YtdlpModule.kt` - YouTube ভিডিও extraction করার Kotlin মডিউল
- [x] `YoutubeDLPackage.java` - Updated to register YtdlpModule
- [x] `hooks/useVideoLoader.js` - React hook ভিডিও লোড করার জন্য
- [x] `hooks/useYtdlExtraction.js` - Low-level extraction API
- [x] `YOUTUBEDL_SETUP.md` - বিস্তারিত সেটআপ গাইড
- [x] `YTDLP_QUICK_REFERENCE.md` - দ্রুত রেফারেন্স গাইড
- [x] `App.js` - YouTube-DL ইনিশিয়ালাইজেশন কোড যোগ করা হয়েছে
- [x] `app.json` - Expo প্লাগইন কনফিগারেশন

## 📋 Phase 2: Android বিল্ড সেটআপ (পরবর্তী ধাপ)

### 2.1 Prebuild তৈরি করুন
```bash
npx expo prebuild --clean
```
**যা হবে:**
- `android/` ফোল্ডার জেনারেট হবে
- Gradle বিল্ড সিস্টেম সেটআপ হবে
- Native code integration পয়েন্ট তৈরি হবে

### 2.2 Gradle Dependencies যোগ করুন
**ফাইল:** `android/app/build.gradle`

**location:** `dependencies { }` ব্লকের শেষে

```gradle
// YouTube-DL Android Library
implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'
```

**উদাহরণ:**
```gradle
dependencies {
    // ... existing dependencies ...
    
    // YouTube-DL Android Library
    implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
    implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'
}
```

### 2.3 নেটিভ মডিউল কপি করুন
```bash
mkdir -p android/app/src/main/java/com/imtiaz/biodigitaltruth/
cp android_native/com/imtiaz/biodigitaltruth/* android/app/src/main/java/com/imtiaz/biodigitaltruth/
```

**যা কপি হবে:**
- `YoutubeDLModule.java`
- `YoutubeDLPackage.java`
- `YtdlpModule.kt`

### 2.4 MainApplication.java আপডেট করুন
**ফাইল:** `android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java`

**Step 1:** Import যোগ করুন (সেরা শীর্ষে)
```java
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
```

**Step 2:** `getPackages()` মেথড খুঁজুন এবং যোগ করুন
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new YoutubeDLPackage());  // এই লাইনটি যোগ করুন
  return packages;
}
```

## 🏗️ Phase 3: বিল্ড এবং রান করুন

### 3.1 Android অ্যাপ বিল্ড করুন
```bash
npx expo run:android
```

**বা ডিভেলপমেন্ট বিল্ড:**
```bash
npx expo run:android --configuration debug
```

### 3.2 Troubleshooting
সমস্যা হলে:
```bash
# Gradle cache পরিষ্কার করুন
cd android && ./gradlew clean && cd ..

# পুনরায় চেষ্টা করুন
npx expo run:android
```

## 💻 Phase 4: PlayerScreen.js এ ইন্টিগ্রেশন

### 4.1 Hook ইমপোর্ট করুন
```javascript
import useVideoLoader from '../hooks/useVideoLoader';
```

### 4.2 PlayerScreen function এর মধ্যে যোগ করুন
```javascript
export default function PlayerScreen({ route, navigation }) {
  const { videoId, videoData = {} } = route?.params || {};
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const {
    videoStream,
    audioStream,
    streamType,
    actualQuality,
    loading,
    error,
    retry
  } = useVideoLoader(youtubeUrl, currentQuality);
  
  // বাকি কোড
}
```

### 4.3 UI এ loading এবং error হ্যান্ডেল করুন
```javascript
if (loading) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text>ভিডিও লোড হচ্ছে...</Text>
    </View>
  );
}

if (error) {
  return (
    <View style={styles.errorContainer}>
      <Text>Error: {error}</Text>
      <TouchableOpacity onPress={retry}>
        <Text>পুনরায় চেষ্টা করুন</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## 🧪 Phase 5: পরীক্ষা করা

### 5.1 বেসিক টেস্ট
```javascript
// এই ভিডিও URL পরীক্ষা করুন:
const testUrl = 'https://www.youtube.com/watch?v=9bZkp7q19f0'; // Rick Roll

// console এ দেখা যাবে:
// ✅ ভিডিও লোড সফল!
// Stream Type: combined
// Quality: 720p
```

### 5.2 Logcat মনিটর করুন
```bash
npx expo run:android -- --logcat
```

লুক করুন:
- `✅ ভিডিও লোড সফল!` message
- কোনো error কি আছে দেখুন

### 5.3 বিভিন্ন কোয়ালিটি পরীক্ষা করুন
```javascript
useVideoLoader(url, '360')  // 360p
useVideoLoader(url, '720')  // 720p
useVideoLoader(url, '1080') // 1080p
```

## 📊 Expected Results

### সফল হলে
```json
{
  "videoStream": "https://...",
  "audioStream": null,
  "streamType": "combined",
  "actualQuality": "720p",
  "loading": false,
  "error": null
}
```

### উচ্চ রেজোলিউশনে
```json
{
  "videoStream": "https://video-url...",
  "audioStream": "https://audio-url...",
  "streamType": "separate",
  "actualQuality": "1080p",
  "loading": false,
  "error": null
}
```

## 🚨 Common Issues & Fixes

| সমস্যা | কারণ | সমাধান |
|--------|------|--------|
| YtdlpModule is undefined | Module register হয়নি | MainApplication.java যাচাই করুন |
| Gradle build ব্যর্থ | ডিপেন্ডেন্সি সমস্যা | android/app/build.gradle পরীক্ষা করুন |
| Kotlin compile error | সংস্করণ mismatch | `ext { kotlin_version = '1.9.10' }` যোগ করুন |
| Network error | JitPack access সমস্যা | VPN চেষ্টা করুন বা proxy সেটআপ করুন |
| অ্যাপ ক্র্যাশ | Runtime permission | AndroidManifest.xml পরীক্ষা করুন |

## 📝 Documentation References

- **বিস্তারিত সেটআপ:** `YOUTUBEDL_SETUP.md`
- **দ্রুত রেফারেন্স:** `YTDLP_QUICK_REFERENCE.md`
- **এই চেকলিস্ট:** `IMPLEMENTATION_CHECKLIST.md`

## ✨ Next Phases (ভবিষ্যতে)

- [ ] Download functionality
- [ ] Download progress tracking
- [ ] Local caching system
- [ ] Offline playback
- [ ] Playlist support
- [ ] Subscribe to channels
- [ ] Watch history improvements
- [ ] Quality auto-selection based on network

---

**Status:** Phase 1 & 2 Ready ✅ | Phase 3-5 Manual Implementation Required
