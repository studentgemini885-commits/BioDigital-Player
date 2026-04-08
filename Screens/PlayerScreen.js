import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList, Image, Dimensions, StatusBar, SafeAreaView, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av'; // [FIX]: ব্যাকগ্রাউন্ড অডিওর জন্য যুক্ত করা হলো

const { width, height } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16; 
const MY_API_SERVER = "http://127.0.0.1:10000"; 

export default function PlayerScreen({ route, navigation }) {
  const { videoId, videoData = {} } = route?.params || {};

  const [relatedVideos, setRelatedVideos] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isExpandedDesc, setIsExpandedDesc] = useState(false);

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadStep, setDownloadStep] = useState('selection'); 
  const [downloadLinks, setDownloadLinks] = useState([]);
  const [downloadType, setDownloadType] = useState('');

  const [isDownloading, setIsDownloading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      DeviceEventEmitter.emit('maximizeVideo');
      return () => DeviceEventEmitter.emit('minimizeVideo');
    }, [])
  );

  // [FIX]: স্ক্রিন অফ করলেও অডিও/ভিডিও চলার জন্য অডিও ইঞ্জিন কনফিগারেশন
  useEffect(() => {
    const enableBackgroundAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) { console.log(e); }
    };
    enableBackgroundAudio();
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();
    fetchRelatedVideos(false);
    if (videoId && videoData) {
        DeviceEventEmitter.emit('playVideo', { videoId: videoId, videoData: videoData });
    }
  }, [videoId]);

  const checkSubscriptionStatus = async () => {
    try {
      const subs = await AsyncStorage.getItem('subscribedChannels');
      const parsedSubs = subs ? JSON.parse(subs) : [];
      setIsSubscribed(parsedSubs.some(s => s.name === videoData.channel));
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

  const handleDownloadExecute = async (item) => {
    setShowDownloadModal(false);
    setIsDownloading(true);
    setTimeout(() => setIsDownloading(false), 1000);

    const downloadId = Date.now().toString(); 
    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        const existingDownloads = await AsyncStorage.getItem('recorded_downloads');
        let downloadList = existingDownloads ? JSON.parse(existingDownloads) : [];

        downloadList.unshift({ 
            id: downloadId, videoId, title: videoData.title, thumbnail: videoData.thumbnail, 
            quality: item.quality, type: downloadType, isCompleted: false, progress: 0, date: new Date().toLocaleDateString() 
        });
        await AsyncStorage.setItem('recorded_downloads', JSON.stringify(downloadList));

        const apiUrl = `${MY_API_SERVER}/api/aria-download?id=${downloadId}&url=${encodeURIComponent(targetUrl)}&quality=${item.quality}&type=${downloadType}&title=${encodeURIComponent(videoData.title)}`;
        fetch(apiUrl).catch(e => console.log(e));

    } catch (error) {
        console.error("Initiation Error:", error);
    }
  };

  const handleDownloadInit = (type) => {
    setDownloadType(type);
    setDownloadStep('fetching');
    fetchDownloadLinks(type);
  };

  const fetchDownloadLinks = async (type) => {
    try {
      const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const apiUrl = `${MY_API_SERVER}/api/extract?url=${encodeURIComponent(targetUrl)}&action=download`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success && data.availableLinks) {
        setDownloadLinks(data.availableLinks);
        setDownloadStep('list');
      } else {
        Alert.alert("ত্রুটি", "কোনো লিংক পাওয়া যায়নি।");
        setShowDownloadModal(false);
      }
    } catch (error) {
      Alert.alert("সার্ভার এরর", "আপনার Termux সার্ভারটি সচল আছে কিনা যাচাই করুন।");
      setShowDownloadModal(false);
    }
  };

  // [FIX]: অফলাইন প্লেলিস্ট রেন্ডার করার লজিক
  const fetchRelatedVideos = async (isLoadMore = false) => {
    if (isLoadMore) setIsLoadingMore(true);
    try {
      // যদি প্লে করা ফাইলটি অফলাইন/ডাউনলোড করা হয়
      if (videoData.localUri || videoData.channel === 'Downloaded File') {
        const stored = await AsyncStorage.getItem('recorded_downloads');
        if (stored) {
          const parsed = JSON.parse(stored);
          const offlineVids = parsed
            .filter(item => item.videoId !== videoId && item.isCompleted) // নিজেরটা বাদে বাকি কমপ্লিট ফাইলগুলো
            .map(item => ({
              id: item.videoId,
              title: item.title,
              channel: 'Downloaded File',
              views: `অফলাইন • ${item.quality} • ${item.type?.toUpperCase()}`,
              thumbnail: item.thumbnail,
              localUri: item.localUri,
              type: item.type
            }));
          setRelatedVideos(offlineVids);
        }
        setIsLoadingMore(false);
        return;
      }

      // অনলাইনের জন্য ডিফল্ট লজিক
      const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(videoData.channel || "trending bangla")}`);
      const text = await response.text();
      const match = text.match(/var ytInitialData = (.*?);<\/script>/);
      if (!match) return;
      const jsonData = JSON.parse(match[1]);
      const extractedVids = [];
      const extractNodes = (node) => {
        if (Array.isArray(node)) node.forEach(extractNodes);
        else if (node && typeof node === 'object') {
          if (node.videoRenderer && node.videoRenderer.videoId !== videoId) {
            extractedVids.push({ 
              id: node.videoRenderer.videoId, title: node.videoRenderer.title?.runs?.[0]?.text, 
              channel: node.videoRenderer.ownerText?.runs?.[0]?.text, views: node.videoRenderer.viewCountText?.simpleText, 
              thumbnail: `https://i.ytimg.com/vi/${node.videoRenderer.videoId}/hqdefault.jpg`,
              avatar: node.videoRenderer.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url
            });
          } else Object.values(node).forEach(extractNodes);
        }
      };
      extractNodes(jsonData);
      setRelatedVideos(isLoadMore ? [...relatedVideos, ...extractedVids] : extractedVids.slice(0, 15));
    } catch (e) {} finally { setIsLoadingMore(false); }
  };

  const renderHeader = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.titleRow}>
         <TouchableOpacity activeOpacity={0.8} onPress={() => setIsExpandedDesc(!isExpandedDesc)} style={styles.titleTextContainer}>
            <Text style={styles.mainTitle} numberOfLines={isExpandedDesc ? null : 2}>{videoData?.title}</Text>
         </TouchableOpacity>
         {/* ডাউনলোড করা ফাইলে ডাউনলোড বাটন হাইড করা */}
         {!videoData.localUri && (
           <TouchableOpacity style={styles.downloadIconBtn} onPress={() => { setShowDownloadModal(true); setDownloadStep('selection'); }}>
              <Ionicons name="download-outline" size={24} color="#FFF" />
           </TouchableOpacity>
         )}
      </View>
      <View style={styles.metaRow}>
         <Text style={styles.mainViews}>{videoData?.views} {videoData?.publishedTime ? `• ${videoData.publishedTime}` : ''}</Text>
         <Text style={styles.moreText}>...more</Text>
      </View>
      <View style={styles.channelRow}>
        <TouchableOpacity style={styles.channelLeft} onPress={() => navigation.navigate('Channel', { channelName: videoData.channel, channelAvatar: videoData.avatar })}>
          <Image source={{ uri: videoData.avatar || 'https://via.placeholder.com/40' }} style={styles.channelAvatar} />
          <View style={styles.channelTextCol}>
            <Text style={styles.channelName} numberOfLines={1}>{videoData.channel}</Text>
            <Text style={styles.subCount}>{videoData.localUri ? 'Offline Storage' : 'Subscriber Info'}</Text>
          </View>
        </TouchableOpacity>
        {!videoData.localUri && (
          <TouchableOpacity style={[styles.subscribeBtn, isSubscribed && styles.subscribedBtn]} onPress={toggleSubscription}>
            <Text style={[styles.subscribeText, isSubscribed && styles.subscribedText]}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.divider} />
      {videoData.localUri && <Text style={styles.offlineListTitle}>আপনার ডাউনলোড করা অন্যান্য ফাইলসমূহ</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0F0F0F" barStyle="light-content" />
      <View style={styles.appHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
           <Ionicons name="chevron-down" size={32} color="#FFF" />
        </TouchableOpacity>
        <View style={{flex: 1}} />
        <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.headerIconBtn}>
           <Ionicons name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* [FIX]: অডিও হলে কাস্টম কভার ইমেজ এবং মিউজিক আইকন দেখানো */}
      <View style={styles.playerWrapper}>
        {videoData?.type === 'audio' && (
          <View style={styles.audioPosterContainer}>
            <Image source={{ uri: videoData.thumbnail }} style={styles.audioPosterBg} blurRadius={15} />
            <View style={styles.audioPosterOverlay}>
              <View style={styles.audioIconCircle}>
                <Ionicons name="musical-notes" size={50} color="#FFF" />
              </View>
              <Text style={styles.audioPosterText}>অডিও প্লে হচ্ছে</Text>
            </View>
          </View>
        )}
      </View>

      {isDownloading && (
        <View style={styles.toastContainer}>
           <Text style={styles.toastText}>ডাউনলোড শুরু হচ্ছে...</Text>
        </View>
      )}

      <FlatList 
        ListHeaderComponent={renderHeader}
        data={relatedVideos} 
        keyExtractor={(item, index) => item.id + index.toString()} 
        renderItem={({item}) => (
          <TouchableOpacity style={styles.recCard} onPress={() => navigation.push('Player', { videoId: item.id, videoData: item })}>
            <Image source={{ uri: item.thumbnail }} style={styles.recThumb} />
            <View style={styles.recInfo}>
              <Text style={styles.recTitle} numberOfLines={2}>{item.title}</Text>
              <Text style={styles.recMeta}>{item.channel} • {item.views}</Text>
            </View>
            {/* অফলাইন লিস্টে টাইপের আইকন দেখানো */}
            {item.localUri && (
              <View style={styles.offlineTypeIndicator}>
                <Ionicons name={item.type === 'audio' ? "musical-notes" : "videocam"} size={14} color="#00BFA5" />
              </View>
            )}
          </TouchableOpacity>
        )}
        onEndReached={() => {
           if(!videoData.localUri) fetchRelatedVideos(true); // অফলাইনে লোড মোর অফ
        }}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={showDownloadModal} transparent animationType="slide" onRequestClose={() => setShowDownloadModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ডাউনলোড অপশন</Text>
              <TouchableOpacity onPress={() => setShowDownloadModal(false)}><Ionicons name="close" size={26} color="#FFF" /></TouchableOpacity>
            </View>
            {downloadStep === 'selection' && (
              <View style={styles.selectionRow}>
                <TouchableOpacity style={styles.selectBtn} onPress={() => handleDownloadInit('video')}><Ionicons name="videocam" size={30} color="#FF0000" /><Text style={styles.selectText}>ভিডিও</Text></TouchableOpacity>
                <TouchableOpacity style={styles.selectBtn} onPress={() => handleDownloadInit('audio')}><Ionicons name="musical-notes" size={30} color="#00BFA5" /><Text style={styles.selectText}>অডিও</Text></TouchableOpacity>
              </View>
            )}
            {downloadStep === 'fetching' && <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#FF0000" /><Text style={styles.loadingText}>লিংক তৈরি হচ্ছে...</Text></View>}
            {downloadStep === 'list' && (
              <ScrollView style={styles.qualityList}>
                {downloadLinks.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.qualityItem} onPress={() => handleDownloadExecute(item)}>
                    <Text style={styles.qualityText}>{item.quality}</Text>
                    <Ionicons name="download" size={20} color="#AAA" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F0F0F' },
    appHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, height: 50 },
    headerIconBtn: { padding: 10 },
    playerWrapper: { width: '100%', height: PLAYER_HEIGHT, backgroundColor: '#000' },
    // অডিও পোস্টারের ডিজাইন
    audioPosterContainer: { flex: 1, width: '100%', height: '100%', position: 'relative', backgroundColor: '#111' },
    audioPosterBg: { width: '100%', height: '100%', opacity: 0.5 },
    audioPosterOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
    audioIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 191, 165, 0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00BFA5', marginBottom: 10 },
    audioPosterText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
    // অন্যান্য ডিজাইন
    toastContainer: { backgroundColor: '#00BFA5', padding: 10, alignItems: 'center', justifyContent: 'center' },
    toastText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
    detailsContainer: { padding: 12 },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    titleTextContainer: { flex: 1, paddingRight: 15 },
    mainTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    downloadIconBtn: { padding: 8, backgroundColor: '#272727', borderRadius: 20 },
    metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5, marginBottom: 15 },
    mainViews: { color: '#AAA', fontSize: 12 },
    moreText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 8 },
    divider: { height: 1, backgroundColor: '#222', marginVertical: 10 },
    offlineListTitle: { color: '#00BFA5', fontSize: 16, fontWeight: 'bold', marginTop: 5, marginBottom: 5 },
    channelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    channelLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    channelAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#333' },
    channelTextCol: { flex: 1 },
    channelName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    subCount: { color: '#AAA', fontSize: 12 },
    subscribeBtn: { backgroundColor: '#FFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
    subscribeText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
    subscribedBtn: { backgroundColor: '#222' },
    subscribedText: { color: '#FFF' },
    recCard: { flexDirection: 'row', padding: 10, position: 'relative' },
    recThumb: { width: 140, height: 80, borderRadius: 8, backgroundColor: '#222' },
    recInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
    recTitle: { color: '#FFF', fontSize: 14 },
    recMeta: { color: '#AAA', fontSize: 11, marginTop: 4 },
    offlineTypeIndicator: { position: 'absolute', bottom: 15, left: 15, backgroundColor: 'rgba(0,0,0,0.7)', padding: 4, borderRadius: 12 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E1E1E', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: height * 0.6 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    selectionRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 20 },
    selectBtn: { alignItems: 'center' },
    selectText: { color: '#FFF', marginTop: 10, fontSize: 16 },
    loadingContainer: { padding: 40, alignItems: 'center' },
    loadingText: { color: '#AAA', marginTop: 15 },
    qualityList: { marginBottom: 20 },
    qualityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
    qualityText: { color: '#FFF', fontSize: 16, fontWeight: '500' }
});