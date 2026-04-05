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
      // যদি একই ভিডিওতে পুনরায় চাপ দেওয়া হয়, তবে নতুন করে API কল না করে শুধু বড় করে দেবে
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

    // ভিডিও মিনিমাইজ করার কমান্ড রিসিভ করা (PlayerScreen থেকে বের হলে)
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

  // 'Single Source of Truth': স্টেট নির্ণয় করা হচ্ছে
  const isFull = playerState === 'full';

  return (
     <View style={isFull ? styles.fullContainer : styles.miniContainer} pointerEvents="box-none">
        <TouchableOpacity
          activeOpacity={isFull ? 1 : 0.8}
          // ফুল স্ক্রিনে থাকা অবস্থায় TouchableOpacity নিস্ক্রিয় থাকবে, যেন ভিডিওর নিজস্ব কন্ট্রোল কাজ করে
          onPress={() => {
             if (!isFull && videoData) {
                setPlayerState('full');
                navigation.navigate('Player', { videoId: videoData.id, videoData: videoData });
             }
          }}
          style={isFull ? styles.fullTouchable : styles.miniTouchable}
        >
           {/* মূল ভিডিও ইঞ্জিন: এটি একটিমাত্র ট্যাগ হওয়ায় আনমাউন্ট হবে না */}
           <View style={isFull ? styles.fullVideoWrapper : styles.miniVideoWrapper}>
               {streamUrl ? (
                  <Video 
                     ref={videoRef} 
                     source={{ uri: streamUrl }} 
                     style={styles.video} 
                     shouldPlay={isPlaying} 
                     useNativeControls={isFull} // শুধুমাত্র ফুল স্ক্রিনে ইউটিউব কন্ট্রোল দেখাবে
                     resizeMode={isFull ? "contain" : "cover"} 
                  />
               ) : (
                  <View style={styles.loadingBox}><Text style={{color: '#AAA'}}>Loading Video...</Text></View>
               )}
           </View>

           {/* মিনি প্লেয়ারের টেক্সট ও বাটন (শুধুমাত্র মিনি অবস্থায় রেন্ডার হবে) */}
           {!isFull && (
              <>
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
              </>
           )}
        </TouchableOpacity>
     </View>
  );
}

const styles = StyleSheet.create({
  // ফুল এবং মিনি মোডের মূল কন্টেইনার স্টাইল
  fullContainer: { position: 'absolute', top: 55, left: 0, width: width, height: PLAYER_HEIGHT, zIndex: 9999, backgroundColor: '#000' },
  miniContainer: { position: 'absolute', bottom: 60, left: 0, width: '100%', height: 60, backgroundColor: '#212121', borderTopWidth: 1, borderTopColor: '#333', zIndex: 9999, elevation: 10 },
  
  // টাচ এরিয়া স্টাইল
  fullTouchable: { flex: 1, width: '100%', height: '100%' },
  miniTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center' },

  // ভিডিও র‍্যাপার: এটিই মূলত আকৃতি পরিবর্তন করে
  fullVideoWrapper: { flex: 1, backgroundColor: '#000', width: '100%', height: '100%' },
  miniVideoWrapper: { width: 110, height: 60, backgroundColor: '#000' },

  video: { width: '100%', height: '100%' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  
  // মিনি প্লেয়ার এলিমেন্টস
  miniTextWrapper: { flex: 1, paddingHorizontal: 10, justifyContent: 'center' },
  miniTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  miniChannel: { color: '#AAA', fontSize: 11 },
  miniBtn: { padding: 12 }
});