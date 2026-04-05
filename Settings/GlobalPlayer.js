import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16;
const MINI_WIDTH = width * 0.45; 
const MINI_HEIGHT = (MINI_WIDTH * 9) / 16;

// [গুরুত্বপূর্ণ]: Termux এবং অ্যাপ একই ফোনে থাকলে 127.0.0.1 কাজ করবে। 
// যদি কাজ না করে এবং "Server Error" দেখায়, তবে এখানে আপনার ওয়াইফাইয়ের আসল আইপি দিবেন (যেমন: http://192.168.0.105:10000)
const MY_API_SERVER = "http://127.0.0.1:10000"; 

global.appSettings = global.appSettings || {};

const getNumericQuality = (q) => {
    if (!q) return '720';
    const qStr = q.toString().toLowerCase();
    if (qStr.includes('auto') || qStr.includes('normal')) return '720';
    if (qStr.includes('75p') || qStr.includes('anti') || qStr.includes('low')) return '144'; 
    if (qStr.includes('144')) return '144';
    if (qStr.includes('240')) return '240';
    if (qStr.includes('360')) return '360';
    if (qStr.includes('480')) return '480';
    if (qStr.includes('720')) return '720';
    if (qStr.includes('1080')) return '1080';
    if (qStr.includes('1440') || qStr.includes('2k')) return '1440';
    if (qStr.includes('2160') || qStr.includes('4k')) return '2160';
    return '720'; 
};

export default function GlobalPlayer() {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  
  const [playerState, setPlayerState] = useState('hidden'); 
  const [videoData, setVideoData] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // নতুন: সার্ভার এরর ট্র্যাক করার জন্য

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        let newX = pan.x._value;
        let newY = pan.y._value;
        const maxRight = 10, maxLeft = -(width - MINI_WIDTH - 20), maxDown = 20, maxUp = -(height - MINI_HEIGHT - 120);

        if (newX > maxRight) newX = maxRight;
        if (newX < maxLeft) newX = maxLeft;
        if (newY > maxDown) newY = maxDown;
        if (newY < maxUp) newY = maxUp;

        Animated.spring(pan, { toValue: { x: newX, y: newY }, friction: 6, useNativeDriver: false }).start();
      }
    })
  ).current;

  useEffect(() => {
    const playSubscription = DeviceEventEmitter.addListener('playVideo', async (data) => {
      if (videoData?.id === data.videoId) {
          setPlayerState('full');
          return;
      }
      
      setVideoData(data.videoData);
      setPlayerState('full');
      setStreamUrl(null);
      setErrorMsg(null);
      setIsPlaying(true);
      pan.setValue({ x: 0, y: 0 });

      try {
        let targetQuality = '720p';
        try {
            const savedAppSet = await AsyncStorage.getItem('appSettings');
            if (savedAppSet) {
                const parsed = JSON.parse(savedAppSet);
                if (parsed.normalVideo) targetQuality = parsed.normalVideo;
            } else {
                const savedVidQuality = await AsyncStorage.getItem('videoQuality'); 
                if (savedVidQuality) targetQuality = savedVidQuality;
                else if (global.appSettings?.normalVideo) targetQuality = global.appSettings.normalVideo;
            }
        } catch(e) { console.warn(e); }

        const numericQuality = getNumericQuality(targetQuality);
        const targetUrl = `https://www.youtube.com/watch?v=${data.videoId}`;
        const apiUrl = `${MY_API_SERVER}/api/extract?url=${encodeURIComponent(targetUrl)}&quality=${numericQuality}&t=${Date.now()}`;
        
        const res = await fetch(apiUrl);
        const json = await res.json();
        
        if (json.success && json.url) {
            setStreamUrl(json.url);
            setErrorMsg(null);
        } else {
            setErrorMsg("ভিডিও লিংক পাওয়া যায়নি!");
        }
      } catch(e) { 
        console.error(e); 
        setErrorMsg("সার্ভার কানেকশন এরর!"); // সার্ভার বন্ধ থাকলে বা আইপি ভুল থাকলে এটি দেখাবে
      }
    });

    const minimizeSubscription = DeviceEventEmitter.addListener('minimizeVideo', () => {
      setPlayerState('mini');
    });

    return () => { playSubscription.remove(); minimizeSubscription.remove(); };
  }, [videoData]);

  if (playerState === 'hidden') return null;

  const togglePlay = async () => {
     if (!videoRef.current) return;
     const status = await videoRef.current.getStatusAsync();
     if (status.isPlaying) { await videoRef.current.pauseAsync(); setIsPlaying(false); } 
     else { await videoRef.current.playAsync(); setIsPlaying(true); }
  };

  const closePlayer = async () => {
     if (videoRef.current) await videoRef.current.pauseAsync();
     setPlayerState('hidden'); setVideoData(null); setStreamUrl(null); setErrorMsg(null); pan.setValue({ x: 0, y: 0 });
  };

  const expandToFull = () => {
     if (videoData) {
        setPlayerState('full');
        navigation.navigate('Player', { videoId: videoData.id, videoData: videoData });
     }
  };

  if (playerState === 'full') {
     return (
       <View style={styles.fullContainer} pointerEvents="box-none">
          <View style={styles.fullVideoWrapper}>
             {errorMsg ? (
                <View style={styles.loadingBox}>
                    <Ionicons name="warning-outline" size={40} color="#FF4444" />
                    <Text style={{color:'#FF4444', marginTop: 10, fontWeight: 'bold'}}>{errorMsg}</Text>
                </View>
             ) : streamUrl ? (
                <Video ref={videoRef} source={{ uri: streamUrl }} style={styles.video} shouldPlay={isPlaying} useNativeControls={true} resizeMode="contain" />
             ) : (
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="#FF0000" />
                    <Text style={{color:'#AAA', marginTop: 10}}>কোয়ালিটি রিড করা হচ্ছে...</Text>
                </View>
             )}
          </View>
       </View>
     );
  }

  return (
     <Animated.View style={[styles.miniContainer, { transform: [{ translateX: pan.x }, { translateY: pan.y }] }]} {...panResponder.panHandlers}>
        <TouchableOpacity activeOpacity={0.9} style={styles.miniTouchable} onPress={expandToFull}>
           <View style={styles.miniVideoWrapper}>
               {errorMsg ? (
                  <View style={styles.loadingBox}>
                     <Ionicons name="warning" size={24} color="#FF4444" />
                  </View>
               ) : streamUrl ? (
                  <Video ref={videoRef} source={{ uri: streamUrl }} style={styles.video} shouldPlay={isPlaying} useNativeControls={false} resizeMode="cover" />
               ) : ( 
                  <View style={styles.loadingBox}>
                     <ActivityIndicator size="small" color="#FF0000" />
                  </View> 
               )}
               <View style={styles.overlay}>
                  <TouchableOpacity style={styles.miniPlayBtn} onPress={togglePlay}>
                     <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#FFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.miniCloseBtn} onPress={closePlayer}>
                     <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
               </View>
           </View>
        </TouchableOpacity>
     </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { position: 'absolute', top: 55, left: 0, width: width, height: PLAYER_HEIGHT, zIndex: 9999, backgroundColor: '#000' },
  fullVideoWrapper: { flex: 1, backgroundColor: '#000', width: '100%', height: '100%' },
  miniContainer: { position: 'absolute', bottom: 80, right: 15, width: MINI_WIDTH, height: MINI_HEIGHT, backgroundColor: '#000', zIndex: 9999, elevation: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 5 },
  miniTouchable: { flex: 1, width: '100%', height: '100%' },
  miniVideoWrapper: { flex: 1, width: '100%', height: '100%', backgroundColor: '#111', position: 'relative' },
  video: { width: '100%', height: '100%' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  miniPlayBtn: { position: 'absolute', top: '50%', left: 10, marginTop: -13 },
  miniCloseBtn: { position: 'absolute', top: 4, right: 4, padding: 2 }
});