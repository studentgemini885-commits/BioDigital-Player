import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DESKTOP_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export default function LiveScreen() {
  const navigation = useNavigation();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    fetchLiveVideos('bangla live tv news channel today', true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLiveVideos('bangla live tv news channel today', true);
  };

  const loadMoreVideos = () => {
    if (isFetchingMore || loading) return; 
    setIsFetchingMore(true);
    fetchLiveVideos('live video bangla', false);
  };

  const getHighQualityThumbnail = (thumbnailObj, videoId) => {
    if (!thumbnailObj || !thumbnailObj.thumbnails || thumbnailObj.thumbnails.length === 0) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    let bestImgUrl = thumbnailObj.thumbnails[thumbnailObj.thumbnails.length - 1].url;
    return bestImgUrl.startsWith('//') ? 'https:' + bestImgUrl : bestImgUrl;
  };

  const fetchLiveVideos = async (query, isNewSearch = false) => {
    if (isNewSearch) setLoading(true); 
    try {
      const response = await fetch(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, { headers: { 'User-Agent': DESKTOP_AGENT } });
      const htmlText = await response.text();
      let match = htmlText.match(/ytInitialData\s*=\s*({.+?});/) || htmlText.match(/var ytInitialData = (.*?);<\/script>/);
      
      if (match && match[1]) {
        const jsonData = JSON.parse(match[1]);
        const extractedVideos = [];
        
        const extractNodes = (node) => {
          if (Array.isArray(node)) node.forEach(extractNodes);
          else if (node && typeof node === 'object') {
            if (node.videoRenderer) {
                // শুধুমাত্র ভিডিওগুলো এক্সট্রাক্ট করা হচ্ছে
                extractedVideos.push(node.videoRenderer);
            } else Object.values(node).forEach(extractNodes);
          }
        };
        extractNodes(jsonData);

        const formattedVideos = extractedVideos.map(vid => ({
            id: vid.videoId, 
            title: vid.title?.runs?.[0]?.text || 'No Title', 
            channel: vid.ownerText?.runs?.[0]?.text || 'Channel',
            views: vid.shortViewCountText?.simpleText || vid.viewCountText?.simpleText || 'Live Now', 
            thumbnail: getHighQualityThumbnail(vid.thumbnail, vid.videoId), 
            avatar: getHighQualityThumbnail(vid.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail, null)
        }));

        // লাইভ স্ক্রিনের জন্য আলাদা স্টেট
        setVideos(isNewSearch ? formattedVideos : [...videos, ...formattedVideos]);
      }
    } catch (e) {
      console.error("Live fetch error:", e);
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
      setIsFetchingMore(false);
    }
  };

  const renderVideoItem = ({ item }) => (
    <View style={styles.videoCard}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Player', { videoId: item.id, videoData: item })}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.liveBadge}><Text style={styles.liveBadgeText}>LIVE</Text></View>
      </TouchableOpacity>
      
      <View style={styles.videoInfo}>
        <Image source={{ uri: item.avatar }} style={styles.channelAvatar} />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.meta}>{item.channel} • {item.views}</Text>
        </View>
      </View>
    </View>
  );

  if (loading && videos.length === 0) {
    return <ActivityIndicator size="large" color="#FF0000" style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0F0F0F' }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList 
        data={videos} 
        renderItem={renderVideoItem} 
        keyExtractor={(item, index) => item.id + index.toString()} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FF0000" />} 
        onEndReached={loadMoreVideos}
        onEndReachedThreshold={0.5} 
        ListFooterComponent={isFetchingMore ? <ActivityIndicator size="small" color="#FF0000" style={{ marginVertical: 20 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  videoCard: { marginBottom: 15 },
  thumbnail: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#111' },
  liveBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: '#FF0000', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
  liveBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  videoInfo: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  channelAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 12, backgroundColor: '#333' },
  textContainer: { flex: 1, paddingRight: 10 },
  title: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  meta: { color: '#AAA', fontSize: 12, marginTop: 4 }
});