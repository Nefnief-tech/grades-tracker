# React Native Crypto Fix

The issue is that CryptoJS needs a React Native compatible crypto implementation.

## Install react-native-crypto-js:

```bash
cd f:\grade-tracker-v2\mobile
npm install react-native-crypto-js
```

## Alternative: Install crypto-js with react-native-get-random-values:

```bash
cd f:\grade-tracker-v2\mobile
npm install react-native-get-random-values
```

Then import it at the top of your App.js:

```javascript
import 'react-native-get-random-values';
```