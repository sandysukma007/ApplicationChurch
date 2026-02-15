import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Modal, Animated } from 'react-native';

const logo = require('../assets/Logo-Santa-Clara-Bekasi-Transparant.png');

interface LoadingProps {
  visible?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ visible = true }) => {
  const [opacity] = useState(new Animated.Value(1));

  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    blinkAnimation.start();

    return () => {
      blinkAnimation.stop();
    };
  }, [opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View style={[styles.container, { opacity }]}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
});
