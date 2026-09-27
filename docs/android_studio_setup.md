# Android Studio & React Native Setup Guide (Windows)

This guide walks you through setting up Android Studio to build and run this React Native Finance App on an Android Emulator or physical device.

---

### Step 1: Install Android Studio
1. Download **Android Studio** from: https://developer.android.com/studio
2. Run the installer (`.exe`).
3. In the setup wizard, ensure the following are checked:
   - **Android Studio**
   - **Android SDK**
   - **Android SDK Platform**
   - **Android Virtual Device (AVD)**
4. Complete the installation and open Android Studio.

---

### Step 2: Install Android SDK Packages & Command Line Tools
1. In Android Studio, go to **Settings** (or **Configure / More Actions**) -> **Languages & Frameworks** -> **Android SDK**.
2. Under the **SDK Platforms** tab:
   - Check **Android 14 (API Level 34)** or **Android 15 (API Level 35)**.
3. Under the **SDK Tools** tab, check:
   - **Android SDK Build-Tools**
   - **Android SDK Command-line Tools (latest)**
   - **Android Emulator**
   - **Android SDK Platform-Tools**
4. Click **Apply** to download and install them.

---

### Step 3: Configure Windows Environment Variables
React Native CLI needs to know where your Android SDK is located.

1. Press `Win + R`, type `sysdm.cpl`, press Enter, and click **Environment Variables**.
2. Under **User variables**, click **New**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\giorgos\AppData\Local\Android\Sdk`
3. Under **User variables**, select `Path` and click **Edit**:
   - Click **New** and add: `%ANDROID_HOME%\platform-tools`
   - Click **New** and add: `%ANDROID_HOME%\emulator`
4. Click **OK** to save.

---

### Step 4: Create an Android Virtual Device (Emulator)
1. In Android Studio, open **Virtual Device Manager** (Phone icon on the top right).
2. Click **Create Device**.
3. Choose **Pixel 8** (or any phone size you prefer) and click **Next**.
4. Select the **UpsideDownCake (API 34)** or **VanillaIceCream (API 35)** system image.
5. Click **Finish**.
6. Click the **Play (▶)** button next to your virtual device to start the emulator!

---

### Step 5: Open Project in Android Studio
1. Open Android Studio.
2. Click **Open** (Open an Existing Project).
3. Browse to:
   ```
   C:\Users\giorgos\Documents\finance\mobile\android
   ```
   *(Important: Open the `android` subfolder inside `mobile`, not the root directory)*
4. Wait for Gradle to finish indexing and syncing dependencies.

---

### Step 6: Run the App
Open a PowerShell terminal in `C:\Users\giorgos\Documents\finance\mobile`:

1. Start Metro Bundler:
   ```bash
   npm run start
   ```
2. In a second terminal window (or inside Android Studio):
   ```bash
   npm run android
   ```
3. The app will compile via Gradle and launch directly inside your Android Emulator!
