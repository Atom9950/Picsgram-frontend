import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { fetchNotifications } from '../../services/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import ScreenWrapper from '../../components/ScreenWrapper'
import { useRouter } from 'expo-router';
import NotificationItem from '../../components/NotificationItem';
import Header from '../../components/Header'
import { GestureHandlerRootView } from 'react-native-gesture-handler';


const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    console.log('Notifications fetched:', res);
    if (res.success) {
      console.log('Notifications data:', res.data);
      setNotifications(res.data);
    }
  }

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prevNotifications => 
      prevNotifications.filter(notif => notif.id !== notificationId)
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper>
        <View style={styles.container}>
          <Header title='Notifications'/>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item => {
              return (
                <NotificationItem
                  item={item}
                  key={item?.id}
                  router = {router}
                  onDelete={handleDeleteNotification}
                />
              )
              
            })
          }

          {
            notifications.length === 0 &&
              <Text style={styles.noData}>No notifications yet</Text>
          }
        </ScrollView>
        </View>
      </ScreenWrapper>
    </GestureHandlerRootView>
  )
}

export default Notifications

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },

  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },

  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
