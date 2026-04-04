# MainApplication.java/kt - YtdlpPackage Integration Guide

## 🎯 আপনার করার কাজ

প্রিবিল্ড চালানোর পর, `android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java` ফাইলে যান এবং নিচের পরিবর্তনগুলি করুন।

---

## 🔍 ধাপ 1: ফাইল খুঁজুন

**পথ:**
```
android/app/src/main/java/com/imtiaz/biodigitaltruth/MainApplication.java
```

---

## 📝 ধাপ 2: Import যোগ করুন (ফাইলের শীর্ষে)

ফাইলের শুরুতে (অন্য imports এর সাথে) এই লাইনগুলি যোগ করুন:

```java
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;
```

**Example:**
```java
package com.imtiaz.biodigitaltruth;

import android.app.Application;
import ...other imports...

// ✨ YouTube-DL Packages
import com.imtiaz.biodigitaltruth.YoutubeDLPackage;
import com.imtiaz.biodigitaltruth.YtdlpPackage;
```

---

## 🔧 ধাপ 3: getPackages() মেথড খুঁজুন

ফাইলের মধ্যে `getPackages()` নামে একটি মেথড খুঁজুন। এটি দেখতে এমন হবে:

```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here, for example:
  // add(MyReactNativePackage())
  return packages;
}
```

---

## ✨ ধাপ 4: YtdlpPackage যোগ করুন

**আগে:**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here, for example:
  // add(MyReactNativePackage())
  return packages;
}
```

**পরে:**
```java
@Override
protected List<ReactPackage> getPackages() {
  List<ReactPackage> packages = new PackageList(this).getPackages();
  // Packages that cannot be autolinked yet can be added manually here, for example:
  // add(MyReactNativePackage())
  packages.add(new YoutubeDLPackage());  // YouTube-DL initialization
  packages.add(new YtdlpPackage());      // Video extraction ✨
  return packages;
}
```

---

## 📋 সম্পূর্ণ Example

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

// ✨ YouTube-DL Packages (নতুন)
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
          
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
          
          // ✨ Add YouTube-DL packages (নতুন)
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
        Class<?> aClass = Class.forName("com.imtiaz.biodigitaltruth.ReactNativeFlipper");
        aClass.getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, this, getReactNativeHost().getReactInstanceManager());
      } catch (ClassNotFoundException e) {
      } catch (NoSuchMethodException e) {
      } catch (IllegalAccessException e) {
      } catch (InvocationTargetException e) {
      }
    }
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

## ✅ যাচাই করুন

পরিবর্তনের পর নিশ্চিত করুন:

- [x] YoutubeDLPackage import করা আছে?
- [x] YtdlpPackage import করা আছে?
- [x] উভয় packages.add() করা আছে?
- [x] ফাইল সংরক্ষণ করা হয়েছে?
- [x] কোনো syntax error নেই?

---

## 🐛 সমস্যা হলে

### Error: "YtdlpPackage cannot be resolved"
**সমাধান:**
1. Native modules সঠিক জায়গায় কপি করা হয়েছে কিনা চেক করুন
2. পাথ: `android/app/src/main/java/com/imtiaz/biodigitaltruth/YtdlpPackage.kt`

### Error: "Package cannot be added twice"
**সমাধান:**
1. getPackages() মেথডে duplicate না করে শুধু একবার যোগ করুন
2. পুরো ফাইল দেখুন duplicate আছে কিনা

### File not found after prebuild
**সমাধান:**
1. প্রিবিল্ড সম্পূর্ণ হয়েছে কিনা চেক করুন
2. Path সঠিক কিনা যাচাই করুন: `android/app/src/main/java/.../MainApplication.java`

---

## 📖 সম্পূর্ণ ওয়ার্কফ্লো

```
1. npx expo prebuild --clean
   ↓
2. android/app/build.gradle এ ডিপেন্ডেন্সি যোগ করুন
   ↓
3. android_native/* থেকে ফাইল কপি করুন
   ↓
4. MainApplication.java আপডেট করুন (এই গাইড)
   ↓
5. eas build:configure
   ↓
6. eas build --platform android
```

---

## 🎯 পরবর্তী ধাপ

এটি সম্পূর্ণ করার পর:

```bash
# বিল্ড করুন
npx expo run:android

# অথবা ক্লাউড বিল্ড
eas build --platform android --profile preview
```

---

**Important:** এই ফাইল প্রিবিল্ড চালানোর **পর** ব্যবহার করুন!
