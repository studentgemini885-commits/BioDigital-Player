# 📱 MainApplication.java - Quick Visual Guide

## এই গাইড ব্যবহার করুন যখন:
- ✅ প্রিবিল্ড চালানো শেষ হয়েছে
- ✅ `android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java` ফাইল খুঁজে পেয়েছেন

---

## 🎯 3 মিনিটের কাজ

### STEP 1: দুটি Import যোগ করুন (ফাইলের শীর্ষে)

**খুঁজুন:**
```java
package com.imtiaz.biodigitaltruth;

import android.app.Application;
import android.content.Context;
import ...
```

**যোগ করুন (অন্য imports এর সাথে):**
```java
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;
```

✅ **Result:**
```java
package com.imtiaz.biodigitaltruth;

import android.app.Application;
import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
...
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;  // ✨ নতুন
import com.imtiaz.biodigitaltruth.YtdlpPackage;     // ✨ নতুন
```

---

### STEP 2: getPackages() মেথড খুঁজুন

**এমন কিছু খুঁজুন:**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here
  // add(MyReactNativePackage())
  return packages;
}
```

---

### STEP 3: দুটি লাইন যোগ করুন

**আগে:**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here
  // add(MyReactNativePackage())
  return packages;  // ← এর আগে যোগ করবেন
}
```

**পরে:**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here
  // add(MyReactNativePackage())
  packages.add(new YoutubeDLPackage());  // ✨ যোগ করুন
  packages.add(new YtdlpPackage());      // ✨ যোগ করুন
  return packages;
}
```

---

## 📸 বাস্তব উদাহরণ

### পূর্ণ MainApplication.java (সরলীকৃত)

```java
package com.imtiaz.biodigitaltruth;

import android.app.Application;
import android.content.Context;
import android.content.res.Configuration;
import androidx.annotation.NonNull;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.soloader.SoLoader;
import expo.modules.ApplicationLifecycleDispatcher;
import expo.modules.ReactNativeHostWrapper;
import java.lang.reflect.InvocationTargetException;
import java.util.List;

// ✨ নতুন: YouTube-DL packages
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;

public class MainApplication extends Application implements ReactApplication {
  
  private final ReactNativeHost mReactNativeHost = 
    new ReactNativeHostWrapper(this,
      new ReactNativeHost(this) {
        
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          
          // ✨ নতুন: YouTube-DL packages যোগ করুন
          packages.add(new YoutubeDLPackage());  // Initialization
          packages.add(new YtdlpPackage());      // Video extraction
          
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      });

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
    // ... বাকি কোড ...
    ApplicationLifecycleDispatcher.onApplicationCreate(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }
}
```

---

## ✔️ পরে যাচাই করুন

সংরক্ষণ করার পর:

```
☑ Imports যোগ হয়েছে?
☑ উভয় packages.add() লাইন আছে?
☑ কোন syntax error নেই?
☑ ফাইল save হয়েছে?
```

---

## 🎯 এর পর কি?

```bash
# বিল্ড করুন
npx expo run:android

# অথবা ক্লাউডে বিল্ড করুন
eas build --platform android --profile preview
```

---

## 🆘 সমস্যা হলে

### "YtdlpPackage cannot be resolved"
→ Native modules `android/app/src/main/java/com/imtiaz/biodigitaltruth/` তে আছে কিনা চেক করুন

### "Package added twice"  
→ getPackages() মেথডে একবার শুধু যোগ করুন

### Build error
→ Gradle clean করুন: `cd android && ./gradlew clean && cd ..`

---

**Complete!** ✨ এখন বিল্ড করতে প্রস্তুত! 🚀
