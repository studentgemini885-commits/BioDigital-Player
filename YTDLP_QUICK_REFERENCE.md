# YtdlpModule - Quick Reference

## 🎬 দ্রুত শুরু করা

### 1. YtdlpModule.kt তৈরি করা হয়েছে ✅
Location: `android_native/com/imtiaz/biodigitaltruth/YtdlpModule.kt`

এটি YouTube ভিডিও থেকে স্ট্রিম URL বের করে এবং JSON রেসপন্স ফেরত দেয়।

### 2. Hooks তৈরি হয়েছে ✅
- **useVideoLoader.js** - ভিডিও লোডিংয়ের জন্য সম্পূর্ণ হুক
- **useYtdlExtraction.js** - নিম্নস্তরের extraction API

### 3. PlayerScreen.js Integration

```javascript
// PlayerScreen.js এর উপরে যোগ করুন:
import useVideoLoader from '../hooks/useVideoLoader';

// Component এর মধ্যে ব্যবহার করুন:
export default function PlayerScreen({ route, navigation }) {
  const { videoId, videoData = {} } = route?.params || {};
  const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const {
    videoStream,
    audioStream,
    streamType,
    actualQuality,
    loading,
    error
  } = useVideoLoader(youtubeUrl, currentQuality);
  
  // videoStream এবং audioStream দিয়ে ভিডিও প্লেয়ার কনফিগার করুন
}
```

## 🔧 সেটআপ চেকলিস্ট

- [x] **YtdlpModule.kt তৈরি** - Kotlin ভিডিও extraction engine
- [x] **YoutubeDLPackage.java আপডেট** - YtdlpModule রেজিস্টার করা
- [x] **Hooks তৈরি** - React integration সহজ করার জন্য
- [ ] **প্রিবিল্ড চালানো** - `npx expo prebuild --clean`
- [ ] **Gradle ডিপেন্ডেন্সি যোগ করা** - android/app/build.gradle এ
- [ ] **নেটিভ মডিউল কপি করা** - android/app/src/main/java/ এ
- [ ] **MainApplication.java আপডেট করা** - YoutubeDLPackage যোগ করতে
- [ ] **অ্যাপ বিল্ড করা** - `npx expo run:android`

## 📱 ব্যবহারের উদাহরণ

### সিম্পল ভিডিও লোড

```javascript
import useVideoLoader from '../hooks/useVideoLoader';

function MyPlayer() {
  const { videoStream, loading, error } = useVideoLoader(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );

  return (
    <>
      {loading && <Text>লোড হচ্ছে...</Text>}
      {error && <Text>Error: {error}</Text>}
      {videoStream && <Video source={{ uri: videoStream }} />}
    </>
  );
}
```

### কাস্টম কোয়ালিটি সাথে

```javascript
const { videoStream, audioStream } = useVideoLoader(
  youtubeUrl,
  '1080' // 1080p
);

// আলাদা অডিও/ভিডিও স্ট্রিম ব্যবহার করুন
if (audioStream) {
  // Separate streams mode
  playVideo(videoStream);
  playAudio(audioStream);
} else {
  // Combined stream mode
  playVideo(videoStream);
}
```

## 📊 YtdlpModule Response

```json
{
  "success": true,
  "url": "https://example.com/video.mp4",
  "audioUrl": "https://example.com/audio.m4a",
  "streamType": "separate",
  "actualQuality": "1080p",
  "captions": []
}
```

- **url**: ভিডিও স্ট্রিম URL
- **audioUrl**: অডিও স্ট্রিম URL (যদি আলাদা থাকে)
- **streamType**: "combined" বা "separate"
- **actualQuality**: সত্যিকারের quality যা পাওয়া গেছে
- **captions**: সাবটাইটেল ডেটা

## 🐛 ডিবাগিং টিপস

### Logcat দেখুন
```bash
npx expo run:android -- --logcat
```

### YtdlpModule স্ট্যাটাস চেক করুন
```javascript
import { NativeModules } from 'react-native';
console.log(NativeModules.YtdlpModule ? '✅ Available' : '❌ Not found');
```

### ম্যানুয়াল কল করুন (ডিবাগিং)
```javascript
const { YtdlpModule } = NativeModules;
YtdlpModule.extractVideoInfo('https://youtube.com/watch?v=...', '720', 'info')
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error));
```

## 📚 ফাইল রেফারেন্স

| ফাইল | উদ্দেশ্য |
|------|---------|
| `YtdlpModule.kt` | মূল extraction লজিক (Kotlin) |
| `YoutubeDLPackage.java` | নেটিভ প্যাকেজ রেজিস্ট্রেশন |
| `useVideoLoader.js` | React hook (উচ্চস্তরীয়) |
| `useYtdlExtraction.js` | Low-level extraction API |
| `App.js` | YouTube-DL ইনিশিয়ালাইজেশন |
| `app.json` | Expo কনফিগারেশন |

## ❓ সাধারণ প্রশ্ন

**Q: কেন দুটি স্ট্রিম (audio + video)?**
A: উচ্চ রেজোলিউশনে YouTube অডিও এবং ভিডিও আলাদা ফাইলে রাখে। আমরা দুটি আলাদাভাবে প্লে করে একসাথে দেখাই।

**Q: Fallback কোয়ালিটি কি?**
A: যদি চাহিদাকৃত কোয়ালিটি না পায়, তবে সর্বোচ্চ উপলব্ধ কোয়ালিটি ব্যবহার করে।

**Q: ক্যাপশন সাপোর্ট আছে?**
A: হ্যাঁ, `captions` array তে থাকবে। বর্তমানে খালি, কিন্তু আপনি সার্ভার logic যোগ করতে পারেন।

**Q: অফলাইন মোড?**
A: সরাসরি YouTube-DL থেকে পাওয়া যায় না। আপনি চাইলে locally cache করতে পারেন।

## 🚀 পরবর্তী ফেজ

1. ডাউনলোড ফাংশন যোগ করুন
2. Download progress tracking
3. Cache management
4. Offline playback support
5. Playlist support
