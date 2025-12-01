// utils/feedback.ts
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type FeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

class FeedbackManager {
  private sounds: { [key: string]: Audio.Sound } = {};
  private soundEnabled = true;
  private hapticsEnabled = true;

  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async triggerFeedback(type: FeedbackType = 'light') {
    // Haptic feedback
    if (this.hapticsEnabled) {
      this.triggerHaptic(type);
    }

    // Audio feedback (optional)
    if (this.soundEnabled) {
      this.playSound(type);
    }
  }

  private triggerHaptic(type: FeedbackType) {
    if (Platform.OS === 'ios') {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } else {
      // Android fallback
      const durations: { [key: string]: number } = {
        light: 10,
        medium: 20,
        heavy: 30,
        success: 15,
        warning: 25,
        error: 35,
      };
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }

  private async playSound(type: FeedbackType) {
    try {
      // Simple click sound using system audio
      if (Platform.OS === 'ios') {
        // iOS system sounds
        const soundId = type === 'success' ? 1054 : 1104;
        // Note: For production, load custom sounds
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
  }
}

export const feedback = new FeedbackManager();

// Initialize on import
feedback.initialize();