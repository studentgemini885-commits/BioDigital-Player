import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions, FlatList, SafeAreaView, StatusBar, Image, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { Video } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');
const MY_API_SERVER = "http://127.0.0.1:10000"; 
const TEMP_CACHE_LIMIT = 86400000; // ২৪ ঘণ্টা

export default function ShortsScreen({ initialVideoId, route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  const [shortsList, setShortsList] = useState([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [mergedOfflineShorts, setMergedOfflineShorts] = useState([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [customCount, setCustomCount] = useState('');
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setIsOffline(!state.isConnected));
    return () => unsubscribe();
  }, []);

  const fetchShorts = async (count = 10) => {
    if (isOffline) return;
    try {
        const res = await fetch(`${MY_API_SERVER}/api/get-shorts?count=${count}`);
        const data = await res.json();
        if (data.success && data.shorts.length > 0) {
            setShortsList(prev => [...prev, ...data.shorts.filter(s => !prev.find(p => p.videoId === s.videoId))]);
        }
    } catch (e) {}
  };

  const loadOfflineData = async () => {
    try {
        const now = Date.now();
        let tempSaved = await AsyncStorage.getItem('temp_cached_shorts');
        let permSaved = await AsyncStorage.getItem('permanent_shorts');
        let tempParsed = tempSaved ? JSON.parse(tempSaved) : [];
        let permParsed = permSaved ? JSON.parse(permSaved) : [];

        const validTemp = tempParsed.filter(item => (now - item.timestamp <= TEMP_CACHE_LIMIT));
        setMergedOfflineShorts([...permParsed, ...validTemp]);
    } catch (e) {}
  };

  useFocusEffect(useCallback(() => { if (isOffline) loadOfflineData(); }, [isOffline]));

  useEffect(() => {
    const initId = initialVideoId || route?.params?.videoId;
    const start = async () => {
        if (initId && !isOffline) await fetch(`${MY_API_SERVER}/api/add-shorts?ids=${initId}`);
        fetchShorts(10);
        loadOfflineData();
    };
    start();
  }, []);

  const cacheVideoTemporarily = async (item) => {
    if (isOffline) return;
    try {
        let tempSaved = await AsyncStorage.getItem('temp_cached_shorts');
        let parsed = tempSaved ? JSON.parse(tempSaved) : [];
        if (parsed.some(s => s.videoId === item.videoId)) return;

        const res = await fetch(`${MY_API_SERVER}/api/download-short-bg?id=${item.videoId}&type=temp`);
        const data = await res.json();
        if (data.success) {
            parsed.push({ ...item, uri: data.localUrl, timestamp: Date.now() });
            if (parsed.length > 50) parsed.shift();
            await AsyncStorage.setItem('temp_cached_shorts', JSON.stringify(parsed));
        }
    } catch (e) {}
  };
const startBulkDownload = async (targetCount) => {
    if (!targetCount || isNaN(targetCount)) return;
    setShowDownloadModal(false);
    setIsBulkDownloading(true);
    setBulkProgress({ current: 0, total: targetCount });

    let downloaded = 0;
    let permSaved = await AsyncStorage.getItem('permanent_shorts');
    let permParsed = permSaved ? JSON.parse(permSaved) : [];

    while (downloaded < targetCount) {
        try {
            const res = await fetch(`${MY_API_SERVER}/api/get-shorts?count=1`);
            const data = await res.json();
            if (data.success && data.shorts.length > 0) {
                const item = data.shorts[0];
                const dlRes = await fetch(`${MY_API_SERVER}/api/download-short-bg?id=${item.videoId}&type=perm`);
                const dlData = await dlRes.json();
                if (dlData.success) {
                    permParsed.push({ ...item, uri: dlData.localUrl, isPermanent: true });
                    downloaded++;
                    setBulkProgress({ current: downloaded, total: targetCount });
                    await AsyncStorage.setItem('permanent_shorts', JSON.stringify(permParsed));
                }
            }
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) { break; }
    }
    setIsBulkDownloading(false);
    Alert.alert("সফল", "ডাউনলোড সম্পন্ন হয়েছে।");
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.shortContainer}>
      <Video 
        source={{ uri: isOffline ? item.uri : item.url }}
        style={StyleSheet.absoluteFill}
        shouldPlay={index === visibleIndex && isFocused}
        isLooping
        resizeMode="contain" // [FIX]: ছোট এবং বড় স্ক্রিন সব ভিডিওর জন্য বেস্ট সলিউশন
      />
      <View style={styles.overlay}>
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color="#FFF" /></TouchableOpacity>
          <View style={styles.topRightActions}>
            {!isOffline && (
              <TouchableOpacity style={styles.topActionBtn} onPress={() => setShowDownloadModal(true)}>
                <Ionicons name="cloud-download-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.topActionBtn} onPress={() => setShowSettingsModal(true)}>
              <Ionicons name="settings-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.bottomSection}>
          <View style={styles.infoCol}>
            <Text style={styles.channelText}>@{item.channel} {item.isPermanent && "• Saved"}</Text>
            <Text style={styles.titleText}>{item.title}</Text>
          </View>
          <View style={styles.actionCol}>
            <TouchableOpacity style={styles.actionBtn}><Ionicons name="heart" size={35} color="#FFF" /><Text style={styles.actionLabel}>Like</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Ionicons name="chatbubble" size={32} color="#FFF" /><Text style={styles.actionLabel}>Comment</Text></TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}><Ionicons name="arrow-redo" size={35} color="#FFF" /><Text style={styles.actionLabel}>Share</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar hidden />
      {isBulkDownloading && (
        <View style={styles.progressToast}><Text style={styles.progressText}>ডাউনলোড হচ্ছে... {bulkProgress.current} / {bulkProgress.total}</Text></View>
      )}
      <FlatList
        data={isOffline ? mergedOfflineShorts : shortsList}
        keyExtractor={(item, index) => (item.videoId || index).toString()}
        renderItem={renderItem}
        pagingEnabled
        onViewableItemsChanged={useRef(({ viewableItems }) => {
          if (viewableItems.length > 0) {
            setVisibleIndex(viewableItems[0].index);
            if (!isOffline) {
                cacheVideoTemporarily(shortsList[viewableItems[0].index]);
                if (viewableItems[0].index >= shortsList.length - 3) fetchShorts(5);
            }
          }
        }).current}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />

      {/* ডাউনলোড এবং সেটিংস মডাল এখানে আগের মতোই থাকবে... */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  shortContainer: { width: width, height: height, backgroundColor: '#000' },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 },
  topHeader: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  topRightActions: { flexDirection: 'row' },
  topActionBtn: { marginLeft: 20, opacity: 0.6 },
  bottomSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 100 },
  infoCol: { flex: 1 },
  channelText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  titleText: { color: '#FFF', fontSize: 14 },
  actionCol: { alignItems: 'center' },
  actionBtn: { alignItems: 'center', marginBottom: 20 },
  actionLabel: { color: '#FFF', fontSize: 12, marginTop: 5 },
  progressToast: { position: 'absolute', top: 50, alignSelf: 'center', backgroundColor: 'rgba(0,191,165,0.9)', padding: 10, borderRadius: 20, zIndex: 10 },
  progressText: { color: '#000', fontWeight: 'bold' }
});