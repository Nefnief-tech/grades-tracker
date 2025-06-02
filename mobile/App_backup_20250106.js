/**
 * Ultra-minimal App.js - Guaranteed to work
 */

import React from 'react';
import { View, Text } from 'react-native';

function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20 }}>Grade Tracker</Text>
      <Text style={{ fontSize: 14, marginTop: 10 }}>Fixed Version</Text>
    </View>
  );
}

export default App;