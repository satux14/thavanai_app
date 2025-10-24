// ============================================
// POLYFILLS MUST BE FIRST - BEFORE ANY IMPORTS
// ============================================
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

// Force override TextDecoder with latin1 support using Buffer
// React Native's native TextDecoder doesn't support latin1 encoding
class TextDecoderPolyfill {
  constructor(encoding = 'utf-8') {
    this.encoding = encoding.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  
  decode(input) {
    if (!input) return '';
    
    // Convert Uint8Array to Buffer
    const buffer = Buffer.from(input);
    
    // Map encoding names to Buffer-supported encodings
    const encodingMap = {
      'utf8': 'utf8',
      'utf-8': 'utf8',
      'utf16le': 'utf16le',
      'ucs2': 'ucs2',
      'latin1': 'latin1',
      'iso88591': 'latin1',
      'ascii': 'ascii',
      'binary': 'binary',
      'base64': 'base64',
      'hex': 'hex',
    };
    
    const bufferEncoding = encodingMap[this.encoding] || 'utf8';
    return buffer.toString(bufferEncoding);
  }
}

class TextEncoderPolyfill {
  encode(input) {
    return new Uint8Array(Buffer.from(input, 'utf8'));
  }
}

// Always override to ensure latin1 support
global.TextDecoder = TextDecoderPolyfill;
global.TextEncoder = TextEncoderPolyfill;

// ============================================
// NOW SAFE TO IMPORT APP AND OTHER MODULES
// ============================================
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
