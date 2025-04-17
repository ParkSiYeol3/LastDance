import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image} from 'react-native';
import Footer from '../components/Footer';
import { Ionicons } from '@expo/vector-icons'; // 아이콘용 (expo vector icons)

const Map = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* 상단 컨트롤 박스 */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <TextInput
          style={styles.searchInput}
          placeholder="Stores"
          placeholderTextColor="#999"
        />

        <TouchableOpacity>
          <Ionicons name="menu" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* 실제 지도는 추후 Google Maps API로 대체 */}
      <View style={styles.fakeMap}>
        <Text style={{ color: '#aaa' }}>Google Map 영역</Text>
      </View>
      <View style={styles.container2}>
        <Footer navigation={navigation} />
      </View>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#fff',
      borderRadius: 12,
      elevation: 3,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      height: 40,
      backgroundColor: '#f2f2f2',
      borderRadius: 8,
      paddingHorizontal: 12,
    },
    fakeMap: {
      flex: 1,
      backgroundColor: '#e5e5e5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container2: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
    },
  });