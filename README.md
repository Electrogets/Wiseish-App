This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

>**Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up _correctly_, you should see your new app running in your _Android Emulator_ or _iOS Simulator_ shortly provided you have set up your emulator/simulator correctly.

This is one way to run your app — you can also run it directly from within Android Studio and Xcode respectively.

## Step 3: Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [Introduction to React Native](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you can't get this to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.





# Folder Structure 


- [screens](D:\Wiseish\screens) - [assets](D:\Wiseish\screens\assets) -> Images and icons


-  [screens](D:\Wiseish\screens) - [auth](D:\Wiseish\screens\auth\AuthContext.js) -> [AuthContext.js](D:\Wiseish\screens\auth\AuthContext.js) (token  store and dispatch)


- [screens](D:\Wiseish\screens) - [popups](D:\Wiseish\screens\popups) -> [ErrorPopup.js](D:\Wiseish\screens\popups\ErrorPopup.js) (error popup define in this)


- [screens](D:\Wiseish\screens) - [services](D:\Wiseish\screens\services) -> [PermissionManager.js](D:\Wiseish\screens\services\PermissionManager.js) (All required android permission handled)


- [screens](D:\Wiseish\screens) - [apiclint.js](D:\Wiseish\screens\apiClint.js) (BaseURL define and dispatch from here)


- [screens](D:\Wiseish\screens) - [CustomerCountDisplay.js](D:\Wiseish\screens\CustomerCountDisplay.js) (Visitor or shopper count)


- [screens](D:\Wiseish\screens) - [GlobalStyles.js](D:\Wiseish\screens\GlobalStyles.js) (some global styles defined here)


- [screens](D:\Wiseish\screens) - [Login.js](D:\Wiseish\screens\Login.js) (Login page and authentication and geofencing defined here)

- [screens](D:\Wiseish\screens) - [NotificationHandler.js](D:\Wiseish\screens\NotificationHandler.js) (Notification channel created here and local notification created here)


- [screens](D:\Wiseish\screens) - [NotificationPage.js](D:\Wiseish\screens\NotificationPage.js) (Notification handle fetch and token authetication and dispatch)


- [screens](D:\Wiseish\screens) - [Register.js](D:\Wiseish\screens\Register.js) (handle the main form of submitting visitor and shopper data)


- [screens](D:\Wiseish\screens) - [Splash.js](D:\Wiseish\screens\SplashScreen.js) (Splash screen with animation)


- [screens](D:\Wiseish\screens) - [VisitorReminder.js](D:\Wiseish\screens\VisitorReminder.js) (Handle the visitor reminder and feeback update)


- [screens](D:\Wiseish\screens) - [SuccessPopup.js](D:\Wiseish\screens\SuccessPopup.js) (success pop display)




# Cli Commands 
```bash
# clean cache
npx react-native clean || npm start --reset-cache

# start project for Android
- npm start || npx react-native run-android 

# start project for ios
npm start || npx react-native run-ios

# install Packages
- npm install [Package-Name] || npm i [Package-Name] 

# uninstall Packages
- npm uninstall [Package-Name] -> To uninstall package from the project

# to install npm packages
- npm i || npm install 

# To prepare for a fresh build
- cd android && ./gradlew clean 

# to back to the main folder
- cd ..
```

# generate the publish ABB file of the app

- [clickhere](https://reactnative.dev/docs/signed-apk-android)

# To change the version name and code version

- current  -> versionCode = 5 && versionName = 1.0.5

- [To update](D:\Wiseish\android\app\build.gradle) in defaultconfig{} function