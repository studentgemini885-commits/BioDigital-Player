import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { DeviceEventEmitter } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

export default function DownloadScreen({ navigation }) {
  const [downloads, setDownloads] = useState([]);
  const [activeDownloads, setActiveDownloads] = useState({}); // লাইভ ডাউনলোডের স্টেট
  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) loadDownloads();
  }, [isFocused]);

  // [FIX]: প্লেয়ার স্ক্রিন থেকে পাঠানো লাইভ সিগন্যাল রিসিভ করা হচ্ছে
  useEffect(() => {
    const progressSub = DeviceEventEmitter.addListener('live_download_progress', (data) => {
      setActiveDownloads(prev => ({ ...prev, [data.id]: data }));
    });

    const completeSub = DeviceEventEmitter.addListener('live_download_complete', (data) => {
      setActiveDownloads(prev => {
        const newState = { ...prev };
        delete newState[data.id];
        return newState;
      });
      loadDownloads(); // ডাউনলোড শেষ হলে মেইন লিস্ট আপডেট হবে
    });

    return () => {
      progressSub.remove();
      completeSub.remove();
    };
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await AsyncStorage.getItem('recorded_downloads');
      if (data) setDownloads(JSON.parse(data));
    } catch (e) { console.error(e); }
  };

  const deleteDownload = async (id) => {
    Alert.alert("মুছে ফেলুন", "আপনি কি এই ডাউনলোডের রেকর্ডটি মুছে ফেলতে চান?", [
      { text: "না" },
      { text: "হ্যাঁ", onPress: async () => {
          const newList = downloads.filter(item => item.id !== id);
          setDownloads(newList);
          await AsyncStorage.setItem('recorded_downloads', JSON.stringify(newList));
        }
      }
    ]);
  };

  // [FIX]: ভিডিও প্লে করার আগে পারমিশন চেক করা হচ্ছে
  const handlePlayVideo = async (item) => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("পারমিশন প্রয়োজন", "এই লোকাল ভিডিওটি প্লে করার জন্য আপনার স্টোরেজ পারমিশন প্রয়োজন।");
        return;
      }
      
      navigation.navigate('Player', {
        videoId: item.videoId,
        videoData: {
          id: item.videoId,
          title: item.title,
          channel: 'Downloaded File',
          thumbnail: item.thumbnail,
          localUri: item.localUri || item.url
        }
      });
    } catch (error) {
      console.error("Playback error:", error);
    }
  };

  // লাইভ ডাউনলোডের UI রেন্ডার
  const renderActiveItem = ({ item }) => (
    <View style={styles.activeCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.meta}>ডাউনলোড হচ্ছে... {item.progress}%</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
        </View>
      </View>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardMain} activeOpacity={0.8} onPress={() => handlePlayVideo(item)}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.meta}>{item.quality} • {item.type?.toUpperCase()} • {item.date}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteDownload(item.id)}>
        <Ionicons name="trash-outline" size={22} color="#FF4444" />
      </TouchableOpacity>
    </View>
  );

  const activeList = Object.values(activeDownloads);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#0F0F0F" barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ডাউনলোডসমূহ</Text>
      </View>

      <FlatList 
        data={downloads}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          activeList.length > 0 ? (
            <View style={{ marginBottom: 15 }}>
              <Text style={styles.sectionTitle}>চলমান ডাউনলোড ({activeList.length})</Text>
              {activeList.map(item => <React.Fragment key={item.id}>{renderActiveItem({ item })}</React.Fragment>)}
              <View style={styles.divider} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          activeList.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="download-outline" size={80} color="#333" />
              <Text style={styles.emptyText}>কোনো ডাউনলোড পাওয়া যায়নি</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F0F' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  list: { padding: 10 },
  sectionTitle: { color: '#00BFA5', fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  activeCard: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center', borderColor: '#00BFA5', borderWidth: 1 },
  card: { flexDirection: 'row', backgroundColor: '#1A1A1A', borderRadius: 10, marginBottom: 12, overflow: 'hidden', alignItems: 'center' },
  cardMain: { flex: 1, flexDirection: 'row', padding: 10 },
  thumb: { width: 120, height: 68, borderRadius: 6, backgroundColor: '#333' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { color: '#FFF', fontSize: 14, fontWeight: '500', marginBottom: 4 },
  meta: { color: '#AAA', fontSize: 12, marginBottom: 5 },
  progressBarBg: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden', width: '100%' },
  progressBarFill: { height: '100%', backgroundColor: '#00BFA5' },
  deleteBtn: { padding: 15 },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 10 },
  empty: { flex: 1, marginTop: 100, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#555', fontSize: 16, marginTop: 15 }
});