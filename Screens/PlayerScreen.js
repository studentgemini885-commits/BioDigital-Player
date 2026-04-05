import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList, Image, Dimensions, StatusBar, SafeAreaView, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePlayerStore } from './PlayerStore'; // পাথ মিলিয়ে নিবেন

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16; 
const MY_API_SERVER = "http://127.0.0.1:10000"; 

global.appSettings = global.appSettings || {};

const getNumericQuality = (q) => {
    if (!q) return '720';
    if (q.includes('Auto') || q.includes('Normal')) return '720';
    if (q.includes('75p') || q.includes('Anti') || q.includes('Low')) return '144'; 
    if (q.includes('144p') || q.includes('240p') || q.includes('360p') || q.includes('480p') || q.includes('720p') || q.includes('1080p')) return q.replace('p', '');
    if (q.includes('1440p') || q.includes('2K')) return '1440';
    if (q.includes('2160p') || q.includes('4K') || q.toLowerCase().includes('4k')) return '2160';
    if (q.includes('4320p') || q.includes('8K') || q.toLowerCase().includes('8k')) return '4320';
    return '720'; 
};

export default function PlayerScreen({ route, navigation }) {
  const { videoId, videoData = {} } = route?.params || {};
  const { videoId: globalVideoId, setVideoConfig, setPlayerState, actualQuality } = usePlayerStore();
  
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const initProcess = async () => {
      setErrorMessage(null);
      checkSubscriptionStatus();
      
      // যদি এই ভিডিওটি আগে থেকেই গ্লোবাল প্লেয়ারে থাকে, তাহলে নতুন করে কল করবে না
      if (globalVideoId === videoId) {
          setPlayerState('full');
          setLoadingUrl(false);
      } else {
          setLoadingUrl(true);
          fetchVideoFromLocalServer(global.appSettings?.normalVideo || '720p');
      }
      fetchRelatedVideos(false);
    };
    initProcess();
  }, [videoId]);

  useEffect(() => {
    const backAction = () => {
      handleGoBack('Home');
      return true; 
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove(); 
  }, [videoId]);

  const handleGoBack = (targetScreen = 'Home', params = {}) => {
    if (usePlayerStore.getState().videoUrl) {
        setPlayerState('mini');
    }
    navigation.navigate(targetScreen, params);
  };

  const fetchVideoFromLocalServer = async (qualityStr) => {
    try {
      const numericQuality = getNumericQuality(qualityStr);
      const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const apiUrl = `${MY_API_SERVER}/api/extract?url=${encodeURIComponent(targetUrl)}&quality=${numericQuality}&t=${Date.now()}`;
      
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.url) {
        let actualQ = qualityStr.includes('75p') ? 'Data Saver Mode (Lowest)' : (data.actualQuality || `${numericQuality}p`);
        // গ্লোবাল প্লেয়ারে ডেটা ট্রান্সফার
        setVideoConfig(videoId, videoData, data.url, data.audioUrl, data.streamType, data.captions || [], actualQ);
      } else {
        setErrorMessage(data.error || "লিংক বের করতে সমস্যা হয়েছে।");
      }
    } catch (error) {
      setErrorMessage("টারমাক্স সার্ভার কানেক্ট করা যাচ্ছে না।");
    } finally {
      setLoadingUrl(false);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const subs = await AsyncStorage.getItem('subscribedChannels');
      const subbed = (subs ? JSON.parse(subs) : []).some(s => s.name === videoData.channel);
      setIsSubscribed(subbed);
    } catch (e) {}
  };

  const toggleSubscription = async () => {
    try {
      let subs = await AsyncStorage.getItem('subscribedChannels');
      subs = subs ? JSON.parse(subs) : [];
      const exists = subs.some(s => s.name === videoData.channel);
      if (exists) subs = subs.filter(s => s.name !== videoData.channel);
      else subs.push({ id: Date.now().toString(), name: videoData.channel, avatar: videoData.avatar });
      await AsyncStorage.setItem('subscribedChannels', JSON.stringify(subs));
      setIsSubscribed(!exists);
    } catch (e) {}
  };

  const fetchRelatedVideos = async (isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    try {
      let query = videoData.channel || "trending bangla";
      if (isLoadMore && videoData.title) query = videoData.title.split(' ').slice(0, 3).join(' ') + " " + Math.floor(Math.random() * 100);
      const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
      const match = (await response.text()).match(/var ytInitialData = (.*?);<\/script>/);
      if (!match || !match[1]) return;
      
      const extractedVids = [];
      const extractNodes = (node) => {
        if (Array.isArray(node)) node.forEach(extractNodes);
        else if (node && typeof node === 'object') {
          if (node.videoRenderer && node.videoRenderer.videoId && node.videoRenderer.videoId !== videoId) {
            extractedVids.push({ 
              id: node.videoRenderer.videoId, title: node.videoRenderer.title?.runs?.[0]?.text, 
              channel: node.videoRenderer.ownerText?.runs?.[0]?.text || 'Channel', views: node.videoRenderer.viewCountText?.simpleText, 
              thumbnail: `https://i.ytimg.com/vi/${node.videoRenderer.videoId}/hqdefault.jpg`,
              avatar: node.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url
            });
          } else Object.values(node).forEach(extractNodes);
        }
      };
      extractNodes(JSON.parse(match[1]));
      
      if (isLoadMore) setRelatedVideos(prev => [...prev, ...extractedVids.filter(v => !prev.find(p => p.id === v.id)).slice(0, 10)]);
      else setRelatedVideos(extractedVids.slice(0, 15));
    } catch (e) {} finally { setIsLoadingMore(false); }
  };

  const renderHeader = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.mainTitle}>{videoData?.title || "Video Title"}</Text>
      <Text style={styles.mainViews}>{videoData?.views || "N/A views"} • {actualQuality}</Text>
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="thumbs-up-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Like</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Download</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Share</Text></TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.channelRow}>
        <TouchableOpacity style={styles.channelLeft} onPress={() => handleGoBack('Channel', { channelName: videoData.channel, channelAvatar: videoData.avatar })}>
          <Image source={{ uri: videoData.avatar }} style={styles.channelAvatar} />
          <View>
            <Text style={styles.channelName} numberOfLines={1}>{videoData.channel}</Text>
            <Text style={styles.subCount}>1.2M subscribers</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]} onPress={toggleSubscription}>
          <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.divider} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0F0F0F" barStyle="light-content" translucent={false} />
      
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => handleGoBack('Home')} style={styles.logoContainer}>
           <Ionicons name="logo-youtube" size={28} color="#FF0000" /><Text style={styles.logoText}>MyTube</Text>
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity onPress={() => handleGoBack('Search')} style={styles.headerIconBtn}><Ionicons name="search" size={24} color="#FFF" /></TouchableOpacity>
      </View>

      {/* প্লেস হোল্ডার: এর উপরে গ্লোবাল ভিডিও বসবে */}
      <View style={styles.playerWrapper}>
        {loadingUrl ? (
          <View style={{alignItems: 'center'}}>
             <ActivityIndicator size="large" color="#FF0000" />
             <Text style={{color: '#AAA', marginTop: 10, fontSize: 12}}>Loading Video...</Text>
          </View>
        ) : errorMessage ? (
          <View style={{alignItems: 'center'}}>
            <Ionicons name="alert-circle" size={40} color="#FF4444" />
            <Text style={{color: '#FF4444', textAlign: 'center', marginTop: 10}}>{errorMessage}</Text>
          </View>
        ) : null}
      </View>

      <FlatList 
        ListHeaderComponent={renderHeader} data={relatedVideos} keyExtractor={(item, index) => item.id + index.toString()} 
        renderItem={({item}) => (
          <TouchableOpacity style={styles.recCard} onPress={() => navigation.push('Player', { videoId: item.id, videoData: item })}>
            <Image source={{ uri: item.thumbnail }} style={styles.recThumb} />
            <View style={styles.recInfo}>
              <Text style={styles.recTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.recMeta}>{item.channel} • {item.views}</Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={() => fetchRelatedVideos(true)} onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="large" color="#FF0000" style={{margin: 20}} /> : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F0F' },
    appHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, backgroundColor: '#0F0F0F', borderBottomWidth: 1, borderBottomColor: '#222' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    logoText: { color: '#FFF', fontSize: 19, fontWeight: 'bold', marginLeft: 6, letterSpacing: -0.5 },
    headerIconBtn: { padding: 10 },
    playerWrapper: { width: '100%', height: PLAYER_HEIGHT, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
    detailsContainer: { padding: 15 },
    mainTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', lineHeight: 24 },
    mainViews: { color: '#AAA', fontSize: 13, marginTop: 5, marginBottom: 15 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 },
    actionBtn: { alignItems: 'center', backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
    actionText: { color: '#FFF', fontSize: 12, marginTop: 4 },
    divider: { height: 1, backgroundColor: '#222', marginTop: 15 },
    channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
    channelLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    channelAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#333' },
    channelName: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    subCount: { color: '#AAA', fontSize: 12 },
    subscribeBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    subscribeText: { color: '#000', fontSize: 13, fontWeight: 'bold' },
    subscribedBtn: { backgroundColor: '#222' },
    subscribedText: { color: '#FFF' },
    recCard: { flexDirection: 'row', padding: 10 },
    recThumb: { width: 140, height: 80, borderRadius: 8, backgroundColor: '#222' },
    recInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    recTitle: { color: '#FFF', fontSize: 14, marginBottom: 4 },
    recMeta: { color: '#AAA', fontSize: 11 }
});