import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface VoiceOrderButtonProps {
  onVoiceCommand: (transcript: string) => void;
}

export default function VoiceOrderButton({ onVoiceCommand }: VoiceOrderButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [statusText, setStatusText] = useState('Tap to speak your order');
  const pulse = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef<Animated.CompositeAnimation | null>(null);
  const recognitionRef = useRef<any>(null);

  const startPulse = () => {
    pulseAnim.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulseAnim.current.start();
  };

  const stopPulse = () => {
    pulseAnim.current?.stop();
    pulse.setValue(1);
  };

  const stopListening = () => {
    recognitionRef.current?.stop?.();
    recognitionRef.current?.abort?.();
    stopPulse();
    setIsListening(false);
    setStatusText('Tap to speak your order');
  };

  const startListening = async () => {
    if (isListening) { stopListening(); return; }

    const SpeechRecognition =
      (typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      setIsListening(true);
      setStatusText('Listening...');
      startPulse();

      recognition.onresult = (event: any) => {
        let interim = '', final = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += t;
          else interim += t;
        }
        if (interim) setStatusText(`"${interim}"`);
        if (final) {
          setStatusText(`"${final}"`);
          stopPulse();
          setIsListening(false);
          setTimeout(() => setStatusText('Tap to speak your order'), 2000);
          onVoiceCommand(final.trim());
        }
      };

      recognition.onerror = (event: any) => {
        stopPulse();
        setIsListening(false);
        setStatusText(event.error === 'no-speech' ? 'No speech detected' : 'Tap to speak your order');
        setTimeout(() => setStatusText('Tap to speak your order'), 2000);
      };

      recognition.onend = () => {
        stopPulse();
        setIsListening(false);
        setTimeout(() => setStatusText('Tap to speak your order'), 1500);
      };

      recognition.start();
    } else {
      setIsListening(true);
      setStatusText('Say your order...');
      startPulse();
      setTimeout(() => {
        stopPulse();
        setIsListening(false);
        setStatusText('Tap to speak your order');
        onVoiceCommand('__native_fallback__');
      }, 3000);
    }
  };

  useEffect(() => {
    return () => { recognitionRef.current?.abort?.(); pulseAnim.current?.stop(); };
  }, []);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.btn,
        isListening && styles.btnActive,
        pressed && !isListening && { opacity: 0.88 },
      ]}
      onPress={startListening}
      accessibilityLabel={isListening ? 'Stop voice ordering' : 'Start voice ordering'}
    >
      {/* Pulse ring */}
      {isListening && (
        <Animated.View
          style={[
            styles.pulseRing,
            { transform: [{ scale: pulse }] },
          ]}
        />
      )}

      {/* Mic icon */}
      <Animated.View
        style={[
          styles.micWrap,
          isListening && styles.micWrapActive,
          { transform: [{ scale: isListening ? pulse : 1 }] },
        ]}
      >
        <MaterialIcons name={isListening ? 'mic' : 'mic-none'} size={24} color="#fff" />
      </Animated.View>

      <View style={styles.textWrap}>
        <Text style={styles.btnTitle}>{isListening ? 'Listening...' : 'Voice Order'}</Text>
        <Text style={styles.btnSub} numberOfLines={1}>{statusText}</Text>
      </View>

      {isListening ? (
        <View style={styles.stopBadge}>
          <Text style={styles.stopText}>STOP</Text>
        </View>
      ) : (
        <MaterialIcons name="graphic-eq" size={22} color="rgba(255,255,255,0.6)" />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coffeeBrown,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.coffeeLight + '44',
    shadowColor: Colors.coffeeBrown,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
    position: 'relative',
  },
  btnActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success + '66',
    shadowColor: Colors.success,
  },
  pulseRing: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.success,
    opacity: 0.25,
  },
  micWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  micWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  textWrap: { flex: 1 },
  btnTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
  },
  btnSub: {
    fontSize: Typography.fontSize.xs,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  stopBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  stopText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
