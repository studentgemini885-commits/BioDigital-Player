import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { DeviceEventEmitter } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16;
const MY_API_SERVER = "http://127.0.0.1:10000";

export default function GlobalPlayer() {
  const navigation = useNavigation();
  const videoRef = useRef(null);
  const [playerState, setPlayerState] = useState('hidden'); // 'hidden', 'full', 'mini'
  const [videoData, setVideoData] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    // ভিডিও প্লে করার কমান্ড রিসিভ করা
    const playSubscription = DeviceEventEmitter.addListener('playVideo', async (data) => {
      if (videoData?.id === data.videoId) {
          setPlayerState('full');
          return;
      }
      setVideoData(data.videoData);
      setPlayerState('full');
      setStreamUrl(null);
      setIsPlaying(true);

      try {
        const targetUrl = `https://www.youtube.com/watch?v=${data.videoId}`;
        const apiUrl = `${MY_API_SERVER}/api/extract?url=${encodeURIComponent(targetUrl)}&quality=720&t=${Date.now()}`;
        const res = await fetch(apiUrl);
        const json = await res.json();
        if(json.success && json.url) setStreamUrl(json.url);
      } catch(e) { console.error(e); }
    });

    // ভিডিও মিনিমাইজ করার কমান্ড রিসিভ করা
    const minimizeSubscription = DeviceEventEmitter.addListener('minimizeVideo', () => {
      setPlayerState('mini');
    });

    return () => { 
        playSubscription.remove(); 
        minimizeSubscription.remove(); 
    }
  }, [videoData]);

  if (playerState === 'hidden') return null;

  const togglePlay = async () => {
     if (!videoRef.current) return;
     const status = await videoRef.current.getStatusAsync();
     if (status.isPlaying) { 
         await videoRef.current.pauseAsync(); 
         setIsPlaying(false); 
     } else { 
         await videoRef.current.playAsync(); 
         setIsPlaying(true); 
     }
  };

  const closePlayer = async () => {
     if (videoRef.current) await videoRef.current.pauseAsync();
     setPlayerState('hidden');
     setVideoData(null);
     setStreamUrl(null);
  };

  // Full Screen Mode (Player Screen এর উপরে বসবে)
  if (playerState === 'full') {
     return (
       <View style={styles.fullContainer} pointerEvents="box-none">
          <View style={styles.videoWrapper}>
              {streamUrl ? (
                 <Video ref={videoRef} source={{ uri: streamUrl }} style={styles.video} shouldPlay={isPlaying} useNativeControls resizeMode="contain" />
              ) : (
                 <View style={styles.loadingBox}><Text style={{color: '#AAA'}}>Loading Video...</Text></View>
              )}
          </View>
       </View>
     );
  }

  // Mini Player Mode (Home/Search Screen এর নিচে ভাসবে)
  return (
     <TouchableOpacity style={styles.miniContainer} activeOpacity={1} onPress={() => {
        setPlayerState('full');
        navigation.navigate('Player', { videoId: videoData.id, videoData: videoData });
     }}>
        <View style={styles.miniVideoWrapper}>
           {streamUrl ? (
              <Video ref={videoRef} source={{ uri: streamUrl }} style={styles.video} shouldPlay={isPlaying} resizeMode="cover" isMuted={false} />
           ) : <View style={styles.loadingBox} />}
        </View>
        <View style={styles.miniTextWrapper}>
           <Text style={styles.miniTitle} numberOfLines={1}>{videoData?.title}</Text>
           <Text style={styles.miniChannel} numberOfLines={1}>{videoData?.channel}</Text>
        </View>
        <TouchableOpacity onPress={togglePlay} style={styles.miniBtn}>
           <Ionicons name={isPlaying ? "pause" : "play"} size={26} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={closePlayer} style={styles.miniBtn}>
           <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>
     </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fullContainer: { position: 'absolute', top: 55, left: 0, width: width, height: PLAYER_HEIGHT, zIndex: 9999, backgroundColor: '#000' },
  videoWrapper: { flex: 1, backgroundColor: '#000' },
  video: { width: '100%', height: '100%' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  miniContainer: { position: 'absolute', bottom: 60, left: 0, width: '100%', height: 60, backgroundColor: '#212121', borderTopWidth: 1, borderTopColor: '#333', flexDirection: 'row', alignItems: 'center', zIndex: 9999, elevation: 10 },
  miniVideoWrapper: { width: 110, height: 60, backgroundColor: '#000' },
  miniTextWrapper: { flex: 1, paddingHorizontal: 10, justifyContent: 'center' },
  miniTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  miniChannel: { color: '#AAA', fontSize: 11 },
  miniBtn: { padding: 12 }
});