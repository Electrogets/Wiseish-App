import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ErrorPopup = ({ isVisible, onClose, errorMessage }) => {
	if (!isVisible) {
		return null;
	}

	return (
		<View style={styles.errorPopup}>
			<Icon name="close" size={30} color="red" />
			<Text style={styles.errorPopupText}>{errorMessage}</Text>
			<TouchableOpacity onPress={onClose}>
				<Icon name="times-circle" size={20} color="black" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	errorPopup: {
		flex:1,
		flexDirection: 'row',
		// position: 'absolute',
		top: '0%',
		left: '45%',
		width: '60%',
		backgroundColor: '#fff',
		padding: 10,
		borderRadius: 10,
		elevation: 5,
		flexDirection: 'row',
		alignItems: 'center',
	},
	errorPopupText: {
		fontSize: 18,
		top: 4,
		right: -6,
		fontWeight: 'bold',
		marginBottom: 10,
		color: '#000',
	},
});

export default ErrorPopup;
