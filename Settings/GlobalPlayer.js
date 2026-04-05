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
        if (json.success && json.url) setStreamUrl(json.url);
      } catch(e) { console.error(e); }
    });

    const minimizeSubscription = DeviceEventEmitter.addListener('minimizeVideo', () => {
      setPlayerState('mini');
    });

    return () => { 
        playSubscription.remove(); 
        minimizeSubscription.remove(); 
    };
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

  const isFull = playerState === 'full';

  return (
     <View style={isFull ? styles.fullContainer : styles.miniContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={isFull ? 1 : 0.9}
          onPress={() => {
             if (!isFull && videoData) {
                setPlayerState('full');
                navigation.navigate('Player', { videoId: videoData.id, videoData: videoData });
             }
          }}
          style={isFull ? styles.fullTouchable : styles.miniTouchable}
        >
           {/* ইউটিউবের অফিশিয়াল অ্যাসপেক্ট রেশিও এবং ডাইমেনশন অনুযায়ী ভিডিও র‍্যাপার */}
           <View style={isFull ? styles.fullVideoWrapper : styles.miniVideoWrapper}>
               {streamUrl ? (
                  <Video 
                     ref={videoRef} 
                     source={{ uri: streamUrl }} 
                     style={styles.video} 
                     shouldPlay={isPlaying} 
                     useNativeControls={isFull} 
                     resizeMode={isFull ? "contain" : "cover"} 
                  />
               ) : (
                  <View style={styles.loadingBox} />
               )}
           </View>

           {/* মিনি প্লেয়ারের টেক্সট ও বাটন (ইউটিউবের এক্স্যাক্ট এলাইনমেন্ট) */}
           {!isFull && (
              <View style={styles.miniControlsRow}>
                <View style={styles.miniTextWrapper}>
                   <Text style={styles.miniTitle} numberOfLines={1}>{videoData?.title}</Text>
                   <Text style={styles.miniChannel} numberOfLines={1}>{videoData?.channel}</Text>
                </View>
                <View style={styles.miniActionButtons}>
                   <TouchableOpacity onPress={togglePlay} style={styles.miniBtn}>
                      <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFF" />
                   </TouchableOpacity>
                   <TouchableOpacity onPress={closePlayer} style={styles.miniBtn}>
                      <Ionicons name="close" size={26} color="#FFF" />
                   </TouchableOpacity>
                </View>
              </View>
           )}
        </TouchableOpacity>
        
        {/* ইউটিউবের মতো নিচে একটি চিকন রেড প্রগ্রেস বার (Visual representation) */}
        {!isFull && <View style={styles.miniProgressBar} />}
     </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: { position: 'absolute', top: 55, left: 0, width: width, height: PLAYER_HEIGHT, zIndex: 9999, backgroundColor: '#000' },
  // মিনি প্লেয়ারের ইউটিউব স্ট্যান্ডার্ড ডাইমেনশন
  miniContainer: { position: 'absolute', bottom: 60, left: 0, width: '100%', height: 56, backgroundColor: '#212121', zIndex: 9999, elevation: 10 },
  
  fullTouchable: { flex: 1, width: '100%', height: '100%' },
  miniTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center' },

  fullVideoWrapper: { flex: 1, backgroundColor: '#000', width: '100%', height: '100%' },
  // উচ্চতা 56 হলে 16:9 অনুপাতে প্রস্থ হবে প্রায় 100
  miniVideoWrapper: { width: 100, height: 56, backgroundColor: '#000' },

  video: { width: '100%', height: '100%' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  
  miniControlsRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  miniTextWrapper: { flex: 1, paddingHorizontal: 12, justifyContent: 'center' },
  miniTitle: { color: '#FFF', fontSize: 13, fontWeight: '500', marginBottom: 2 },
  miniChannel: { color: '#AAA', fontSize: 12 },
  
  miniActionButtons: { flexDirection: 'row', alignItems: 'center', paddingRight: 8 },
  miniBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  
  // ইউটিউবের সিগনেচার বটম রেড লাইন
  miniProgressBar: { position: 'absolute', bottom: 0, left: 0, width: '100%', height: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }
});