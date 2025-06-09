// screens/ImagePreview.js
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ImagePreview = () => {
	const route = useRoute();
	const navigation = useNavigation();
	const { imageUrl } = route.params;

	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
				<Ionicons name='close' size={32} color='#fff' />
			</TouchableOpacity>
			<Image source={{ uri: imageUrl }} style={styles.fullImage} resizeMode='contain' />
		</View>
	);
};

export default ImagePreview;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000',
		justifyContent: 'center',
		alignItems: 'center',
	},
	fullImage: {
		width: '100%',
		height: '100%',
	},
	closeButton: {
		position: 'absolute',
		top: 40,
		right: 20,
		zIndex: 10,
	},
});
