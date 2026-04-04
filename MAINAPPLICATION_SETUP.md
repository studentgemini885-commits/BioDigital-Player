# MainApplication.java - সম্পূর্ণ Update Guide

এই ফাইলটি আপনার `android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java` তে আপডেট করার জন্য।

## 🎯 সঠিক কোড

### Import Section (ফাইলের শীর্ষে যোগ করুন)

```java
package com.imtiaz.biodigitaltruth;

// ... existing imports ...

// ✨ নতুন imports যোগ করুন:
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;
```

### getPackages() Method (খুঁজে নিন এবং আপডেট করুন)

**পূর্বে (Before):**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // packages.add(new MyReactNativePackage());
  return packages;
}
```

**পরে (After):**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // YouTube-DL এবং ভিডিও extraction packages যোগ করুন
  packages.add(new YoutubeDLPackage());  // ইনিশিয়ালাইজেশন
  packages.add(new YtdlpPackage());      // ভিডিও extraction ✨
  return packages;
}
```

---

## 📋 সম্পূর্ণ MainApplication.java টেমপ্লেট

যদি MainApplication.java সম্পূর্ণভাবে খালি বা ক্ষতিগ্রস্ত হয়, তাহলে এই টেমপ্লেট ব্যবহার করুন:

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

// ✨ YouTube-DL packages import
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;

public class MainApplication extends Application implements ReactApplication {
  private final ReactNativeHost mReactNativeHost = new ReactNativeHostWrapper(this,
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          
          // ✨ YouTube-DL packages registration
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
    SoLoader.init(this, /* native exopackage */ false);
    
    if (BuildConfig.DEBUG) {
      try {
        /*
         * We use reflection here to pick up the class that initializes Flipper,
         * since Flipper library is not available in release mode
         */
        Class<?> aClass = Class.forName("com.imtiaz.biodigitaltruth.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, this, getReactNativeHost().getReactInstanceManager());
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
    
    // YouTube-DL initialization ✨
    initializeYoutubeDL();
    
    ApplicationLifecycleDispatcher.onApplicationCreate(this);
  }

  @Override
  public void onConfigurationChanged(@NonNull Configuration newConfig) {
    super.onConfigurationChanged(newConfig);
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig);
  }

  // YouTube-DL initialization method
  private void initializeYoutubeDL() {
    try {
      com.yausername.youtubedl_android.YoutubeDL.getInstance().init(this);
      android.util.Log.d("YoutubeDL", "✅ YouTube-DL initialized successfully");
    } catch (Exception e) {
      android.util.Log.e("YoutubeDL", "❌ Failed to initialize YouTube-DL", e);
    }
  }
}
```

---

## ✅ Verification Checklist

আপডেট করার পর নিশ্চিত করুন:

- [ ] YoutubeDLPackage import করা আছে?
- [ ] YtdlpPackage import করা আছে?
- [ ] উভয় packages রেজিস্টার করা আছে getPackages() তে?
- [ ] ফাইল Save করা হয়েছে?
- [ ] কোনো syntax error নেই?

---

## 🔍 Debugging Tips

যদি error দেখেন:

### Error: "YtdlpPackage cannot be resolved"
**সমাধান:** Native মডিউল সঠিক location এ কপি করা হয়েছে কিনা চেক করুন
```bash
ls -la android/app/src/main/java/com/imtiaz/biodigitaltruth/
# YtdlpPackage.kt দেখা যাওয়া উচিত
```

### Error: "Package already added"
**সমাধান:** Duplicate registration চেক করুন getPackages() মেথডে

### Error: "YouTube-DL initialization failed"
**সমাধান:** app.json এ JitPack Maven repo আছে কিনা চেক করুন

---

## 📊 এই সেটআপের পর কি হবে?

1. **app launch হবে** → YoutubeDLPackage initialize করবে
2. **ভিডিও লোড হবে** → YtdlpPackage handle করবে
3. **extraction শুরু হবে** → YtdlpModule Kotlin code চলবে
4. **URL পাওয়া যাবে** → React component এ পাস হবে

---

**Status:** ✅ Ready for EAS Cloud Build
