import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator, Platform, Dimensions, RefreshControl, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { Video } from 'expo-av'; 
import * as NavigationBar from 'expo-navigation-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SettingsScreen from '../Settings/SettingsScreen';
import ShortsScreen from './ShortsScreen'; 

const DESKTOP_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FEED_TOPICS = [ "trending bangladesh", "bangla natok 2026", "bangla new song", "somoy tv live", "cricket highlights", "bangla waz short", "bengali vlog", "bangla news today" ];
const MY_API_SERVER = "http://127.0.0.1:10000"; 

global.aiMemory = global.aiMemory || {};
global.seenVideoIds = global.seenVideoIds || new Set(); 
global.playerBridge = global.playerBridge || { videoId: null, videoData: null, currentTime: 0 };

const { width } = Dimensions.get('window');

export default function HomeScreen({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [miniVideo, setMiniVideo] = useState(null);

  const [activeTab, setActiveTab] = useState('Home');
  const [activeFeedTab, setActiveFeedTab] = useState('Video'); // নতুন: ভিডিও এবং লাইভ টগল
  
  const [videos, setVideos] = useState([]);
  const [liveVideos, setLiveVideos] = useState([]); // নতুন: লাইভ ভিডিও
  const [liveChannels, setLiveChannels] = useState([]); // নতুন: লাইভ চ্যানেল লিস্ট
  const [liveChannelQuery, setLiveChannelQuery] = useState(''); // নতুন: লাইভ চ্যানেল সার্চ

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShortId, setSelectedShortId] = useState(null);

  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [thumbQuality, setThumbQuality] = useState('High');
  const [activeQuery, setActiveQuery] = useState('');

  const getAlgorithmicTopic = async () => {
    try {
      const subs = await AsyncStorage.getItem('subscribedChannels');
      const parsedSubs = subs ? JSON.parse(subs) : [];

      const suffixes = ["", "today", "new", "2026", "latest"];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

      if (parsedSubs.length > 0 && Math.random() < 0.10) {
          const randomSub = parsedSubs[Math.floor(Math.random() * parsedSubs.length)].name;
          const subQueries = [`${randomSub} latest`, `${randomSub} related`, randomSub];
          const selectedSubQuery = subQueries[Math.floor(Math.random() * subQueries.length)];
          return `${selectedSubQuery} ${suffix}`.trim();
      }

      const randomTopic = FEED_TOPICS[Math.floor(Math.random() * FEED_TOPICS.length)];
      return `${randomTopic} ${suffix}`.trim();
    } catch (e) {
      console.log(e);
    }
    return FEED_TOPICS[Math.floor(Math.random() * FEED_TOPICS.length)];
  };

  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        const subs = await AsyncStorage.getItem('subscribedChannels');
        if (subs) {
            setSubscribedChannels(JSON.parse(subs));
        }
        const quality = await AsyncStorage.getItem('thumbnailQuality');
        if (quality) setThumbQuality(quality);

        if (!activeQuery) {
            const initialTopic = await getAlgorithmicTopic();
            setActiveQuery(initialTopic);
        }
      } catch (e) {}
    };

    if (isFocused) {
      loadGlobalData();
      if (global.playerBridge && global.playerBridge.videoId) {
         setMiniVideo({ ...global.playerBridge });
      } else {
         setMiniVideo(null);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (route?.params?.executeSearch) {
        setActiveTab('Home'); setSearchQuery(route.params.executeSearch); setActiveQuery(route.params.executeSearch);
    }
    if (route?.params?.targetTab) setActiveTab(route.params.targetTab);
  }, [route?.params]);

  useEffect(() => {
    if (activeQuery) {
        fetchRealVideos(activeQuery, true);
    }
    if (Platform.OS === 'android') NavigationBar.setVisibilityAsync("hidden");
  }, [activeQuery, activeFeedTab]);

  useEffect(() => {
    const intervalId = setInterval(async () => {
        const newTopic = await getAlgorithmicTopic();
        setActiveQuery(newTopic);
    }, 10 * 60 * 1000); 
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const newTopic = await getAlgorithmicTopic();
    setActiveQuery(newTopic);
  };

  const loadMoreVideos = async () => {
    if (isFetchingMore || loading) return; 
    setIsFetchingMore(true);
    
    // লাইভ মোডে থাকলে সার্চ কুয়েরি থেকে ডাটা আনবে, অন্যথায় নতুন টপিক
    const nextQuery = activeFeedTab === 'Live' ? (liveChannelQuery || activeQuery) : await getAlgorithmicTopic();
    await fetchRealVideos(nextQuery, false); 
    
    setIsFetchingMore(false);
  };

  const getHighQualityThumbnail = (thumbnailObj, videoId) => {
    if (thumbQuality === 'Data Saver' && videoId) return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`; 
    if (!thumbnailObj || !thumbnailObj.thumbnails || thumbnailObj.thumbnails.length === 0) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let bestImgUrl = thumbnailObj.thumbnails[thumbnailObj.thumbnails.length - 1].url;
    return bestImgUrl.startsWith('//') ? 'https:' + bestImgUrl : bestImgUrl;
  };

  const getVerticalShortsThumbnail = (videoId) => {
    return `https://i.ytimg.com/vi/${videoId}/oardefault.jpg`;
  };

  // আপডেট: মূল ফেচিং অ্যালগরিদম লাইভ এবং ভিডিওর জন্য সমন্বয় করা হয়েছে
  const fetchRealVideos = async (query, isNewSearch = false, retryCount = 0) => {
    if (isNewSearch && retryCount === 0) { setLoading(true); } 
    
    const targetQuery = activeFeedTab === 'Live' ? `${query} live now` : query;

    try {
      const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(targetQuery)}`, {
        headers: { 'User-Agent': DESKTOP_AGENT, 'Accept-Language': 'en-US,en;q=0.9' }
      });
      const htmlText = await response.text();
      let match = htmlText.match(/ytInitialData\s*=\s*({.+?});/) || htmlText.match(/var ytInitialData = (.*?);<\/script>/);
      
      if (match && match[1]) {
        const jsonData = JSON.parse(match[1]);
        
        const extractedVideos = [];
        const extractedShorts = [];
        const extractedLiveChannels = [];
        
        const extractNodes = (node) => {
          if (Array.isArray(node)) node.forEach(extractNodes);
          else if (node && typeof node === 'object') {
            if (node.videoRenderer) {
                const vid = node.videoRenderer;
                const channelName = vid.ownerText?.runs?.[0]?.text || vid.longBylineText?.runs?.[0]?.text || '';
                const titleText = vid.title?.runs?.[0]?.text?.toLowerCase() || '';
                
                const isAtHandle = channelName.trim().startsWith('@');
                const hasShortText = titleText.includes('short') || titleText.includes('শর্ট');
                const isLive = JSON.stringify(vid).includes("BADGE_STYLE_TYPE_LIVE_NOW");
                
                if (isAtHandle || hasShortText) {
                    extractedShorts.push({
                        videoId: vid.videoId,
                        headline: { simpleText: vid.title?.runs?.[0]?.text },
                        viewCountText: { simpleText: vid.shortViewCountText?.simpleText || vid.viewCountText?.simpleText }
                    });
                } else {
                    const data = {
                      id: vid.videoId, title: vid.title?.runs?.[0]?.text || 'No Title', channel: channelName || 'Channel',
                      views: vid.shortViewCountText?.simpleText || vid.viewCountText?.simpleText || 'N/A', 
                      duration: vid.lengthText?.simpleText || '', publishedTime: vid.publishedTimeText?.simpleText || '',
                      thumbnail: getHighQualityThumbnail(vid.thumbnail, vid.videoId), 
                      avatar: getHighQualityThumbnail(vid.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail, null),
                      type: 'video', isLive: isLive
                    };

                    if (activeFeedTab === 'Live') {
                        if (isLive) {
                            extractedVideos.push(data);
                            extractedLiveChannels.push({
                                id: vid.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || data.channel, 
                                name: data.channel, 
                                avatar: data.avatar
                            });
                        }
                    } else {
                        extractedVideos.push(data);
                    }
                }
            } else if (node.channelRenderer && activeFeedTab === 'Live') {
                const ch = node.channelRenderer;
                if (JSON.stringify(ch).includes("BADGE_STYLE_TYPE_LIVE_NOW")) {
                    extractedLiveChannels.push({
                        id: ch.channelId, name: ch.title?.simpleText, 
                        avatar: ch.thumbnail?.thumbnails?.[0]?.url,
                    });
                }
            } else if (node.reelItemRenderer) {
                extractedShorts.push(node.reelItemRenderer);
            } else {
                Object.values(node).forEach(extractNodes);
            }
          }
        };
        extractNodes(jsonData);
        
        const freshVideos = extractedVideos.filter(vid => {
            if (global.seenVideoIds.has(vid.id)) return false;
            global.seenVideoIds.add(vid.id);
            return true;
        });

        const freshShorts = extractedShorts.filter(short => {
            if (global.seenVideoIds.has(short.videoId)) return false;
            global.seenVideoIds.add(short.videoId);
            return true;
        });

        if (global.seenVideoIds.size > 1000) {
            const iterator = global.seenVideoIds.values();
            for (let i = 0; i < 200; i++) global.seenVideoIds.delete(iterator.next().value);
        }

        const formattedShorts = freshShorts.map(short => ({
            id: short.videoId, title: short.headline?.simpleText || 'Short Video', views: short.viewCountText?.simpleText || 'N/A',
            thumbnail: getVerticalShortsThumbnail(short.videoId), type: 'short'
        }));

        let combinedFeed = freshVideos;

        if (activeFeedTab === 'Video' && formattedShorts.length > 0) {
            const uniqueShorts = formattedShorts.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i);
            combinedFeed.splice(0, 0, { id: 'shelf_' + Date.now() + Math.random(), type: 'shorts_shelf', shorts: uniqueShorts });
        }

        if (combinedFeed.length === 0 && isNewSearch && retryCount < 3) {
            const fallbackQuery = await getAlgorithmicTopic();
            return fetchRealVideos(fallbackQuery, true, retryCount + 1);
        }

        if (activeFeedTab === 'Live') {
            setLiveVideos(isNewSearch ? combinedFeed : [...liveVideos, ...combinedFeed]);
            const allChannels = isNewSearch ? extractedLiveChannels : [...liveChannels, ...extractedLiveChannels];
            const uniqueChannels = Array.from(new Map(allChannels.map(item => [item.name, item])).values());
            setLiveChannels(uniqueChannels);
        } else {
            setVideos(isNewSearch ? combinedFeed : [...videos, ...combinedFeed]);
        }
      }
    } catch (e) {} finally { setLoading(false); setRefreshing(false); }
  };

  const toggleSubscription = async (channelName, avatarUrl) => {
    try {
      let subs = await AsyncStorage.getItem('subscribedChannels');
      subs = subs ? JSON.parse(subs) : [];
      const isSubbed = subs.some(s => s.name === channelName);
      if (isSubbed) {
        subs = subs.filter(s => s.name !== channelName);
      } else {
        subs.push({ id: Date.now().toString(), name: channelName, avatar: avatarUrl });
      }
      await AsyncStorage.setItem('subscribedChannels', JSON.stringify(subs));
      setSubscribedChannels(subs);
    } catch (e) {}
  };

  const handleVideoPress = (item) => {
    global.playerBridge = { videoId: null, videoData: null, currentTime: 0 };
    setMiniVideo(null);
    navigation.navigate('Player', { videoId: item.id, videoData: item });
  };
  
  const handleChannelPress = (item) => navigation.navigate('Channel', { channelName: item.channel, channelAvatar: item.avatar });

  const renderVideoItem = ({ item }) => {
    if (item.type === 'shorts_shelf') {
      return (
        <View style={styles.shortsShelfContainer}>
          <View style={styles.shortsShelfHeader}>
            <Image source={{uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/YouTube_play_buttom_icon_%282013-2017%29.svg'}} style={{width: 24, height: 24, tintColor: '#FF0000'}} />
            <Text style={styles.shortsShelfTitle}>Shorts</Text>
          </View>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={item.shorts}
            keyExtractor={(s, index) => s.id + index.toString()}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({item: short}) => (
              <TouchableOpacity 
                style={styles.shortItemCard} 
                activeOpacity={0.9} 
                onPress={() => {
                  setSelectedShortId(short.id);
                  setActiveTab('Shorts');
                }}
              >
                <Image source={{ uri: short.thumbnail }} style={styles.shortThumbnailImage} />
                <View style={styles.shortTextOverlay}>
                  <Text style={styles.shortTitleText} numberOfLines={2}>{short.title}</Text>
                  <Text style={styles.shortViewsText}>{short.views}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      );
    }

    const isSubscribed = subscribedChannels.some(sub => sub.name === item.channel);
    return (
      <View style={styles.videoCard}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => handleVideoPress(item)}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
          {item.isLive ? (
              <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>
          ) : item.duration ? (
              <View style={styles.durationBadge}><Text style={styles.durationText}>{item.duration}</Text></View>
          ) : null}
        </TouchableOpacity>
        
        <View style={styles.videoInfo}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => handleChannelPress(item)}>
            <Image source={{ uri: item.avatar }} style={styles.channelAvatar} />
          </TouchableOpacity>
          
          <View style={styles.textContainer}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => handleVideoPress(item)}>
              <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.8} onPress={() => handleChannelPress(item)}>
              <Text style={styles.meta}>{item.channel} • {item.views} {item.publishedTime ? `• ${item.publishedTime}` : ''}</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={[styles.nativeSubBtn, isSubscribed && styles.nativeSubbedBtn]} onPress={() => toggleSubscription(item.channel, item.avatar)}>
            <Text style={[styles.nativeSubText, isSubscribed && styles.nativeSubbedText]}>{isSubscribed ? 'Subscribed' : 'Subscribe'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // নতুন: লাইভ চ্যানেলের হেডার
  const LiveHeader = () => {
    const filteredChannels = liveChannels.filter(ch => ch.name?.toLowerCase().includes(liveChannelQuery.toLowerCase()));

    return (
      <View style={styles.liveHeaderContainer}>
        <View style={styles.liveSearchBox}>
          <TextInput 
            style={styles.liveInput} 
            placeholder="লাইভ চ্যানেল খুঁজুন..." 
            placeholderTextColor="#888"
            value={liveChannelQuery}
            onChangeText={setLiveChannelQuery}
            onSubmitEditing={() => fetchRealVideos(liveChannelQuery, true)} 
            returnKeyType="search"
          />
          <TouchableOpacity onPress={() => fetchRealVideos(liveChannelQuery, true)}>
            <Ionicons name="search" size={20} color="#AAA" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>লাইভ চ্যানেলসমূহ</Text>
        <FlatList 
          horizontal 
          showsHorizontalScrollIndicator={false}
          data={filteredChannels}
          keyExtractor={(item, index) => item.id + index.toString()}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.liveChanItem} onPress={() => navigation.navigate('Channel', { channelName: item.name, channelAvatar: item.avatar })}>
              <View style={styles.liveAvatarWrapper}>
                <Image source={{ uri: item.avatar }} style={styles.liveAvatar} />
                <View style={styles.miniLiveBadge} />
              </View>
              <Text style={styles.liveChanName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={{color: '#888', fontStyle: 'italic'}}>কোনো চ্যানেল পাওয়া যায়নি...</Text>}
        />
      </View>
    );
  };

  const MiniPlayer = () => {
    const [miniStreamUrl, setMiniStreamUrl] = useState(null);

    useEffect(() => {
      let isMounted = true;
      if (miniVideo && miniVideo.videoId) {
        const fetchMiniStream = async () => {
          try {
            const targetUrl = `https://www.youtube.com/watch?v=${miniVideo.videoId}`;
            const apiUrl = `${MY_API_SERVER}/api/extract?url=${encodeURIComponent(targetUrl)}&quality=144&t=${Date.now()}`;
            const res = await fetch(apiUrl);
            const data = await res.json();
            
            if (data.success && data.url && isMounted) {
              setMiniStreamUrl(data.url);
            }
          } catch (e) { console.log(e); }
        };
        fetchMiniStream();
      }
      return () => { isMounted = false; };
    }, [miniVideo]);

    if (!miniVideo || !miniVideo.videoId) return null;

    return (
      <TouchableOpacity 
        style={styles.miniPlayerContainer} 
        activeOpacity={1} 
        onPress={() => {
          global.playerBridge = { videoId: null, videoData: null, currentTime: 0 };
          setMiniVideo(null);
          navigation.navigate('Player', { videoId: miniVideo.videoId, videoData: miniVideo.videoData });
        }}
      >
        <View style={styles.miniPlayerContent}>
          <View style={styles.miniPlayerVideoWrapper}>
             {miniStreamUrl ? (
                <Video 
                  source={{ uri: miniStreamUrl }}
                  style={styles.miniPlayerVideo}
                  shouldPlay
                  isMuted={false}
                  resizeMode="cover"
                  positionMillis={miniVideo.currentTime || 0}
                />
             ) : (
                <Image 
                  source={{ uri: miniVideo.videoData?.thumbnail || `https://i.ytimg.com/vi/${miniVideo.videoId}/hqdefault.jpg` }} 
                  style={styles.miniPlayerVideo} 
                />
             )}
             <View style={styles.miniPlayerOverlay} />
          </View>

          <View style={styles.miniPlayerTextContainer}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>{miniVideo.videoData?.title || 'Unknown Title'}</Text>
            <Text style={styles.miniPlayerSubTitle} numberOfLines={1}>{miniVideo.videoData?.channel || 'Unknown Channel'}</Text>
          </View>

          <TouchableOpacity style={styles.miniPlayerClose} onPress={() => { global.playerBridge = { videoId: null, videoData: null, currentTime: 0 }; setMiniVideo(null); }}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // আপনার অরিজিনাল "ME" ট্যাবের মেনু আইটেম
  const MeMenuItem = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.meMenuItem} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#00BFA5" style={styles.meMenuIcon} />
      <Text style={styles.meMenuText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0F0F0F" barStyle="light-content" translucent={true} />
      
      {activeTab !== 'Shorts' && activeTab !== 'ME' && activeTab !== 'Settings' && (
        <View style={styles.topSection}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
               <Ionicons name="logo-youtube" size={28} color="#FF0000" />
               <Text style={styles.logoText}>MyTube</Text>
            </View>
            <TouchableOpacity style={styles.searchBar} activeOpacity={0.8} onPress={() => navigation.navigate('Search')}>
              <Text style={{ flex: 1, color: '#888', fontSize: 14 }}>{searchQuery || "সার্চ..."}</Text>
              <Ionicons name="search" size={18} color="#AAA" />
            </TouchableOpacity>
          </View>
          
          {/* নতুন: ভিডিও এবং লাইভ টগল বাটন */}
          <View style={styles.toggleRow}>
            <TouchableOpacity style={[styles.toggleBtn, activeFeedTab === 'Video' && styles.activeToggle]} onPress={() => setActiveFeedTab('Video')}>
              <Text style={[styles.toggleText, activeFeedTab === 'Video' && styles.activeToggleText]}>ভিডিও</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.toggleBtn, activeFeedTab === 'Live' && styles.activeToggle]} onPress={() => setActiveFeedTab('Live')}>
              <Text style={[styles.toggleText, activeFeedTab === 'Live' && styles.activeToggleText]}>লাইভ</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.mainContent}>
        {activeTab === 'Home' ? (
          loading && (activeFeedTab === 'Video' ? videos.length === 0 : liveVideos.length === 0) ? ( 
            <ActivityIndicator size="large" color="#FF0000" style={{ flex: 1, justifyContent: 'center' }} /> 
          ) : (
            <FlatList 
              ListHeaderComponent={activeFeedTab === 'Live' ? <LiveHeader /> : null}
              data={activeFeedTab === 'Video' ? videos : liveVideos} 
              renderItem={renderVideoItem} 
              keyExtractor={(item, index) => item.id + index.toString()} 
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF0000" />} 
              onEndReached={loadMoreVideos}
              onEndReachedThreshold={0.5} 
              ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#FF0000" style={{ marginVertical: 20 }} /> : null}
            />
          )
        ) : activeTab === 'Shorts' ? (
          <ShortsScreen initialVideoId={selectedShortId} />
        ) : activeTab === 'Settings' ? (
          <SettingsScreen />
        ) : activeTab === 'ME' ? (
          <View style={styles.meContainer}>
             <View style={styles.meHeaderProfile}>
                 <Ionicons name="person-circle" size={80} color="#555" />
                 <Text style={styles.meName}>MyTube User</Text>
                 <Text style={styles.meEmail}>Manage your account</Text>
             </View>
             {/* আপনার অরিজিনাল মেনু হুবহু রিস্টোর করা হয়েছে */}
             <View style={styles.meMenuWrapper}>
                 <MeMenuItem icon="time-outline" text="HISTORY" onPress={() => navigation.navigate('History')} />
                 <MeMenuItem icon="download-outline" text="DOWNLOAD" onPress={() => {}} />
                 <MeMenuItem icon="notifications-outline" text="MY SUBSCRIBE" onPress={() => navigation.navigate('Subscriptions')} />
                 <MeMenuItem icon="settings-outline" text="SETTINGS" onPress={() => setActiveTab('Settings')} />
                 <MeMenuItem icon="mail-outline" text="SUPPORT TO GMAIL" onPress={() => {}} />
             </View>
          </View>
        ) : null}
      </View>

      {/* অরিজিনাল নেটিভ মিনি প্লেয়ার */}
      {activeTab === 'Home' && <MiniPlayer />}

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('Home')} style={styles.tab}><Ionicons name={activeTab==='Home'?'home':'home-outline'} size={24} color={activeTab==='Home'?'#FFF':'#888'} /><Text style={[styles.tabText, activeTab==='Home' && {color:'#FFF'}]}>Home</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('Shorts')} style={styles.tab}><Ionicons name={activeTab==='Shorts'?'play-circle':'play-circle-outline'} size={24} color={activeTab==='Shorts'?'#FFF':'#888'} /><Text style={[styles.tabText, activeTab==='Shorts' && {color:'#FFF'}]}>Shorts</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('ME')} style={styles.tab}><Ionicons name={(activeTab==='ME' || activeTab==='Settings') ? 'person' : 'person-outline'} size={24} color={(activeTab==='ME' || activeTab==='Settings') ? '#FFF' : '#888'} /><Text style={[styles.tabText, (activeTab==='ME' || activeTab==='Settings') && {color:'#FFF'}]}>ME</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  topSection: { backgroundColor: '#0F0F0F', borderBottomWidth: 1, borderBottomColor: '#222' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, width: '100%' },
  logoContainer: { flexDirection: 'row', alignItems: 'center', width: 105 },
  logoText: { color: '#FFF', fontSize: 16, fontWeight: 'bold', marginLeft: 4, letterSpacing: -0.5 },
  searchBar: { flex: 1, flexDirection: 'row', backgroundColor: '#222', borderRadius: 20, marginHorizontal: 8, paddingHorizontal: 12, alignItems: 'center', height: 38 },
  
  toggleRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 10 },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 6, borderRadius: 15, marginRight: 10, backgroundColor: '#222' },
  activeToggle: { backgroundColor: '#FFF' },
  toggleText: { color: '#AAA', fontSize: 13, fontWeight: 'bold' },
  activeToggleText: { color: '#000' },

  mainContent: { flex: 1, backgroundColor: '#0F0F0F' },
  videoCard: { marginBottom: 15 },
  thumbnail: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#111' },
  durationBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0, 0, 0, 0.8)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  durationText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  liveBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#FF0000', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  liveText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  videoInfo: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: '#333' },
  textContainer: { flex: 1, paddingRight: 10 },
  title: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  meta: { color: '#AAA', fontSize: 12, marginTop: 4 },
  
  shortsShelfContainer: { paddingVertical: 15, borderTopWidth: 4, borderBottomWidth: 4, borderColor: '#222', marginBottom: 15, backgroundColor: '#0F0F0F' },
  shortsShelfHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  shortsShelfTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  shortItemCard: { width: width * 0.4, height: width * 0.7, marginRight: 12, borderRadius: 10, overflow: 'hidden', backgroundColor: '#222', position: 'relative' },
  shortThumbnailImage: { width: '100%', height: '100%', resizeMode: 'cover' }, 
  shortTextOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, paddingTop: 30, backgroundColor: 'rgba(0,0,0,0.6)' },
  shortTitleText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginBottom: 4, textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2, lineHeight: 18 },
  shortViewsText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  
  nativeSubBtn: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginLeft: 5 },
  nativeSubText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  nativeSubbedBtn: { backgroundColor: '#222' },
  nativeSubbedText: { color: '#FFF' },

  liveHeaderContainer: { padding: 12, borderBottomWidth: 4, borderBottomColor: '#222' },
  liveSearchBox: { flexDirection: 'row', backgroundColor: '#222', borderRadius: 10, paddingHorizontal: 12, alignItems: 'center', height: 40, marginBottom: 15 },
  liveInput: { flex: 1, color: '#FFF', fontSize: 14 },
  sectionTitle: { color: '#FFF', fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
  liveChanItem: { width: 80, alignItems: 'center', marginRight: 15 },
  liveAvatarWrapper: { position: 'relative' },
  liveAvatar: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#FF0000' },
  miniLiveBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FF0000', borderWidth: 2, borderColor: '#0F0F0F' },
  liveChanName: { color: '#AAA', fontSize: 11, marginTop: 6, textAlign: 'center' },
  
  tabBar: { flexDirection: 'row', height: 60, borderTopWidth: 1, borderTopColor: '#222', backgroundColor: '#0F0F0F' },
  tab: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabText: { fontSize: 10, color: '#888', marginTop: 4 },
  
  meContainer: { flex: 1, backgroundColor: '#0F0F0F' },
  meHeaderProfile: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  meName: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  meEmail: { color: '#AAA', fontSize: 14, marginTop: 4 },
  meMenuWrapper: { paddingHorizontal: 20 },
  meMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#222' },
  meMenuIcon: { marginRight: 20 },
  meMenuText: { color: '#FFF', fontSize: 16, fontWeight: '500' },
  
  // অরিজিনাল মিনি প্লেয়ারের স্টাইল
  miniPlayerContainer: { position: 'absolute', bottom: 60, width: '100%', height: 60, backgroundColor: '#212121', borderBottomWidth: 1, borderBottomColor: '#333', zIndex: 100 },
  miniPlayerContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  miniPlayerVideoWrapper: { width: 100, height: 60, position: 'relative', backgroundColor: '#000' },
  miniPlayerVideo: { width: '100%', height: '100%', backgroundColor: '#000' },
  miniPlayerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  miniPlayerTextContainer: { flex: 1, paddingHorizontal: 10 },
  miniPlayerTitle: { color: '#FFF', fontSize: 13, fontWeight: 'bold' },
  miniPlayerSubTitle: { color: '#AAA', fontSize: 11 },
  miniPlayerClose: { padding: 15 }
});