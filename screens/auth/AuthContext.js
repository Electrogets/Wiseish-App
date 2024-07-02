// AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { actionCreators } from '../../src/Store/masterToken/masterTokenAction';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

	const dispatch=useDispatch()

	const [user, setUser] = useState(null);

	useEffect(() => {
		const checkLogin = async () => {
			const storedUser = await AsyncStorage.getItem('user');
			if (storedUser) {
				const parsedUser = JSON.parse(storedUser);
				setUser(parsedUser);
			}
		};

		checkLogin();
	}, []);

	const login = async (username, password) => {
		try {
			const response = await axios.post(
				'https://your-auth-api.com/login',
				{ username, password }
			);

			const { access_token, refresh_token, user } = response.data.access_token;
			console.log("authtoken",response.data.access_token)

			// Store tokens and user information
			await AsyncStorage.setItem('access_token', access_token);
			await AsyncStorage.setItem('refresh_token', refresh_token);
			await AsyncStorage.setItem('user', JSON.stringify(user));
			dispatch(actionCreators.setMasterToken(response.data))

			setUser(user);
		} catch (error) {
			console.error('Login failed', error);
		}
	};

	const logout = async () => {
		// Remove tokens and user information
		await AsyncStorage.removeItem('access_token');
		await AsyncStorage.removeItem('refresh_token');
		await AsyncStorage.removeItem('user');

		setUser(null);
	};

	const isAuthenticated = async () => {
		const accessToken = await AsyncStorage.getItem('access_token');

		return !!accessToken;
	};

	const getToken = async () => {
		const accessToken = await AsyncStorage.getItem('access_token');
		return accessToken;
	};

	return (
		<AuthContext.Provider
			value={{ user, login, logout, isAuthenticated, getToken }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
