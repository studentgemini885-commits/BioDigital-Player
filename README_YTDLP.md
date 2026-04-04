# 🎬 YouTube-DL Android Integration - Complete Setup

আপনার BioDigital Player অ্যাপে YouTube ভিডিও স্ট্রিমিং যোগ করা হয়েছে!

## 📦 কি যোগ হয়েছে?

### 1. **Native Module (Kotlin)**
- `YtdlpModule.kt` - YouTube থেকে ভিডিও স্ট্রিম URL এক্সট্র্যাক্ট করে
- JSON format এ ভিডিও, অডিও এবং মেটাডেটা রিটার্ন করে

### 2. **React Native Bridge**
- `YoutubeDLModule.java` - Initialization লজিক
- `YoutubeDLPackage.java` - Native modules registration (আপডেট করা হয়েছে)

### 3. **React Hooks**
- `useVideoLoader.js` - সম্পূর্ণ ভিডিও লোডিং লজিক
- `useYtdlExtraction.js` - Low-level extraction API

### 4. **Configuration**
- `app.json` - Expo plugins এবং JitPack config
- `App.js` - YouTube-DL initialization on startup
- `plugins/with-youtubedl-module.js` - Gradle dependency plugin

### 5. **Documentation**
- `YOUTUBEDL_SETUP.md` - বিস্তারিত সেটআপ গাইড
- `YTDLP_QUICK_REFERENCE.md` - দ্রুত রেফারেন্স
- `IMPLEMENTATION_CHECKLIST.md` - ধাপে ধাপে চেকলিস্ট

## 🚀 দ্রুত শুরু (5 ধাপে)

### ধাপ 1: Prebuild তৈরি করুন
```bash
npx expo prebuild --clean
```

### ধাপ 2: Gradle Dependency যোগ করুন
`android/app/build.gradle` এ `dependencies { }` ব্লকে:
```gradle
implementation 'com.github.yausername.youtubedl-android:library:0.16.+'
implementation 'com.github.yausername.youtubedl-android:ffmpeg:0.16.+'
```

### ধাপ 3: Native মডিউল কপি করুন
```bash
mkdir -p android/app/src/main/java/com/imtiaz/biodigitaltruth/
cp android_native/com/imtiaz/biodigitaltruth/* android/app/src/main/java/com/imtiaz/biodigitaltruth/
```

### ধাপ 4: MainApplication.java আপডেট করুন
```java
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;

@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  packages.add(new YoutubeDLPackage());  // এই লাইন যোগ করুন
  return packages;
}
```

### ধাপ 5: বিল্ড এবং রান করুন
```bash
npx expo run:android
```

## 💻 PlayerScreen.js এ ব্যবহার করুন

```javascript
import useVideoLoader from '../hooks/useVideoLoader';

export default function PlayerScreen({ route, navigation }) {
  const { videoId } = route?.params || {};
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // ভিডিও লোড করুন
  const {
    videoStream,
    audioStream,
    streamType,
    actualQuality,
    loading,
    error
  } = useVideoLoader(youtubeUrl, '720');
  
  // loading/error UI...
  
  // ভিডিও প্লেয়ার সেট করুন
  if (videoStream) {
    return <Video source={{ uri: videoStream }} />;
  }
}
```

## 📊 YtdlpModule আউটপুট

```json
{
  "success": true,
  "url": "https://rr..-...mp4",
  "audioUrl": null,
  "streamType": "combined",
  "actualQuality": "720p",
  "captions": []
}
```

**স্ট্রিম টাইপ:**
- `"combined"`: একটি ফাইলে audio + video
- `"separate"`: আলাদা audio এবং video (1080p+)

## 🎯 ফিচার

✅ YouTube ভিডিও এক্সট্র্যাকশন  
✅ মাল্টিপল কোয়ালিটি সাপোর্ট (360p - 4320p)  
✅ এক্সপোনেনশিয়াল URL fallback logic  
✅ অটোমেটিক অডিও/ভিডিও separation  
✅ Caption সাপোর্ট (placeholder)  
✅ এরর হ্যান্ডলিং এবং retry লজিক  
✅ Coroutine-based async operations  

## 📁 ফাইল স্ট্রাকচার

```
BioDigital-Player/
├── android_native/                    # Native Android modules
│   └── com/imtiaz/biodigitaltruth/
│       ├── YoutubeDLModule.java      # Init logic
│       ├── YoutubeDLPackage.java     # Registration (updated)
│       └── YtdlpModule.kt            # Main extraction ✨
│
├── hooks/                             # React hooks
│   ├── useVideoLoader.js             # High-level hook ✨
│   └── useYtdlExtraction.js          # Low-level API ✨
│
├── plugins/                           # Build plugins
│   └── with-youtubedl-module.js      # Gradle config
│
├── Screens/
│   └── PlayerScreen.js               # Integration point
│
├── App.js                            # Initialization (updated)
├── app.json                          # Config (updated)
│
└── Documentation/
    ├── YOUTUBEDL_SETUP.md           # Detailed guide
    ├── YTDLP_QUICK_REFERENCE.md     # Quick ref
    ├── IMPLEMENTATION_CHECKLIST.md   # Step-by-step
    └── README_YTDLP.md              # এই ফাইল
```

## 🐛 সমস্যা সমাধান

### "YtdlpModule is not available"
→ MainApplication.java চেক করুন, YoutubeDLPackage import এবং register করা আছে কিনা?

### Gradle build ফেইল
→ JitPack Maven repo চেক করুন app.json এ `"extraMavenRepos": ["https://jitpack.io"]`

### Kotlin compile error
→ `android/build.gradle` এ সেট করুন: `ext { kotlin_version = '1.9.10' }`

### Runtime crash
→ Logcat দেখুন: `npx expo run:android -- --logcat`

## 📚 ডকুমেন্টেশন

- **Detailed Setup:** `YOUTUBEDL_SETUP.md`
- **Quick Reference:** `YTDLP_QUICK_REFERENCE.md`
- **Implementation Steps:** `IMPLEMENTATION_CHECKLIST.md`

## 🔄 ওয়ার্কফ্লো

1. ইউজার একটি YouTube ভিডিও খুলে
2. PlayerScreen componentএ `useVideoLoader` hook ট্রিগার হয়
3. `YtdlpModule.extractVideoInfo()` ক্যাল হয় (Kotlin)
4. yt-dlp জিসন ফরম্যাটে data রিটার্ন করে
5. React component streaming URLs পায়
6. Expo Video component ভিডিও প্লে করে

## 🎓 কিভাবে কাজ করে

### YtdlpModule Extraction Logic:

1. **Request তৈরি:** yt-dlp এর জন্য কনফিগার করা হয় JSON output এর জন্য
2. **Formats Parse:** সব available ফরম্যাট থেকে best match খোঁজা হয়
3. **Quality Selection:** 
   - কম্বাইন্ড স্ট্রিম প্রথম চেষ্টা (audio + video একসাথে)
   - না পেলে আলাদা streams খোঁজা হয়
   - Fallback অপশন থাকে সবসময়
4. **JSON রেসপন্স:** Streaming URLs এবং মেটাডেটা রিটার্ন

### useVideoLoader Hook:

1. React component mount হলে ট্রিগার হয়
2. Native module call করে (async)
3. Loading/Error states ম্যানেজ করে
4. Retry functionality প্রদান করে
5. Streaming URLs component এ pass করে

## 🌐 URL Format Support

✅ `youtube.com/watch?v=VIDEO_ID`  
✅ `youtu.be/VIDEO_ID`  
✅ `youtube.com/playlist?list=PLAYLIST_ID`  
✅ Short URLs, playlists, channels  

## 🔒 সিকিউরিটি

- No API keys needed (yt-dlp এর মাধ্যমে)
- URLs locally generate করা হয়
- Direct streaming, no server proxy প্রয়োজন
- YouTube's ToS পর্যবেক্ষণ করুন

## 🚀 পরবর্তী ফেজ

- [ ] Download functionality
- [ ] Download progress
- [ ] Cache management
- [ ] Offline playback
- [ ] Playlist downloads
- [ ] Channel subscriptions
- [ ] Watch history sync

## 📞 সাপোর্ট

কোনো সমস্যা হলে:
1. IMPLEMENTATION_CHECKLIST.md চেক করুন
2. Logcat output দেখুন
3. YTDLP_QUICK_REFERENCE.md এ troubleshooting দেখুন

---

**Status:** ✅ Phase 1-2 Complete | Ready for Phase 3 Implementation

**Last Updated:** 2026-04-04
