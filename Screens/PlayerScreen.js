import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList, Image, Dimensions, StatusBar, SafeAreaView, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16; 

export default function PlayerScreen({ route, navigation }) {
  const { videoId, videoData = {} } = route?.params || {};
  
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    checkSubscriptionStatus();
    fetchRelatedVideos(false);
  }, [videoId]);

  // ফিজিক্যাল ব্যাক বাটন প্রেস করলে ভিডিও যেন মিনিমাইজ হয়
  useEffect(() => {
    const backAction = () => {
      DeviceEventEmitter.emit('minimizeVideo');
      navigation.goBack();
      return true; 
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove(); 
  }, []);

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

  const AppHeader = () => (
    <View style={styles.appHeader}>
      <TouchableOpacity onPress={() => { DeviceEventEmitter.emit('minimizeVideo'); navigation.goBack(); }} style={styles.logoContainer}>
         <Ionicons name="arrow-back" size={26} color="#FFF" />
      </TouchableOpacity>
      <View style={{flex: 1}} />
      <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.headerIconBtn}>
        <Ionicons name="search" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.mainTitle}>{videoData?.title}</Text>
      <Text style={styles.mainViews}>{videoData?.views}</Text>
      
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="thumbs-up-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Like</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="download-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Download</Text></TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}><Ionicons name="share-social-outline" size={20} color="#FFF" /><Text style={styles.actionText}>Share</Text></TouchableOpacity>
      </View>
      <View style={styles.divider} />
      <View style={styles.channelRow}>
        <TouchableOpacity style={styles.channelLeft} onPress={() => navigation.navigate('Channel', { channelName: videoData.channel, channelAvatar: videoData.avatar })}>
          <Image source={{ uri: videoData.avatar }} style={styles.channelAvatar} />
          <View>
            <Text style={styles.channelName} numberOfLines={1}>{videoData.channel}</Text>
            <Text style={styles.subCount}>Subscriber Info</Text>
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
      
      <AppHeader />

      {/* গ্লোবাল প্লেয়ারটি ঠিক এই কালো ফাঁকা জায়গাটির উপরে এসে বসবে, তাই এখানে কোনো ভিডিও ট্যাগ নেই */}
      <View style={styles.playerWrapper}></View>

      <FlatList 
        ListHeaderComponent={renderHeader}
        data={relatedVideos} 
        keyExtractor={(item, index) => item.id + index.toString()} 
        renderItem={({item}) => (
          <TouchableOpacity style={styles.recCard} onPress={() => {
              DeviceEventEmitter.emit('playVideo', { videoId: item.id, videoData: item });
              navigation.push('Player', { videoId: item.id, videoData: item });
          }}>
            <Image source={{ uri: item.thumbnail }} style={styles.recThumb} />
            <View style={styles.recInfo}>
              <Text style={styles.recTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.recMeta}>{item.channel} • {item.views}</Text>
            </View>
          </TouchableOpacity>
        )}
        onEndReached={() => fetchRelatedVideos(true)}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F0F' },
    appHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, backgroundColor: '#0F0F0F', borderBottomWidth: 1, borderBottomColor: '#222' },
    logoContainer: { flexDirection: 'row', alignItems: 'center' },
    headerIconBtn: { padding: 10 },
    playerWrapper: { width: '100%', height: PLAYER_HEIGHT, backgroundColor: 'transparent' },
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