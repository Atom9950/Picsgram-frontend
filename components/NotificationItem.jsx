import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import Avatar from './Avatar'
import moment from 'moment'
import { acceptAccessRequest, rejectAccessRequest } from '../services/accessRequestService'
import { createNotification } from '../services/notificationService'

const NotificationItem = ({
    item,
    router,
    onActionComplete = () => {}
}

) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessed, setIsProcessed] = useState(false);

    const handleClick = () => {
        // Check notification type
        if (item?.type === 'profile_access_request') {
            // Don't navigate for access requests, show buttons instead
            return;
        }

        if (item?.type === 'profile_access_granted') {
            // Navigate to the granted profile
            try {
                let data = JSON.parse(item?.data);
                console.log('Navigating to viewerProfile with:', {
                    userId: item?.senderId,
                    grantId: data?.grantId,
                    userName: item?.sender?.name
                });
                router.push({
                    pathname: '/viewerProfile',
                    params: { 
                        userId: String(item?.senderId),
                        grantId: String(data?.grantId),
                        userName: item?.sender?.name
                    }
                });
            } catch (error) {
                console.error('Navigation error:', error);
                Alert.alert('Error', 'Failed to navigate to profile: ' + error.message);
            }
            return;
        }

        // Default behavior for other notification types
        try {
            let { postId, commentId } = JSON.parse(item?.data);
            router.push({ pathname: 'postDetails', params: { postId, commentId } });
        } catch (error) {
            console.log('Error parsing notification data:', error);
        }
    }

    const handleAcceptRequest = async () => {
        setIsProcessing(true);
        try {
            const data = JSON.parse(item?.data);
            const result = await acceptAccessRequest(data?.requestId, item?.senderId, item?.receiverId);

            if (result.success) {
                // Send notification to the requester
                const grantNotification = {
                    senderId: item?.receiverId,
                    receiverId: item?.senderId,
                    title: 'granted your profile access request',
                    type: 'profile_access_granted',
                    data: JSON.stringify({ grantId: result.data.id }),
                    is_read: false,
                };

                await createNotification(grantNotification);
                
                setIsProcessed(true);
                Alert.alert('Success', 'Profile access request accepted');
                onActionComplete();
            } else {
                Alert.alert('Error', result.msg || 'Failed to accept request');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
            console.log('acceptRequest error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectRequest = async () => {
        setIsProcessing(true);
        try {
            const data = JSON.parse(item?.data);
            const result = await rejectAccessRequest(data?.requestId);

            if (result.success) {
                setIsProcessed(true);
                Alert.alert('Success', 'Profile access request rejected');
                onActionComplete();
            } else {
                Alert.alert('Error', result.msg || 'Failed to reject request');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
            console.log('rejectRequest error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const createdAt = moment(item?.created_at).format('MMM D')

    const isAccessRequest = item?.type === 'profile_access_request';
    const isAccessGranted = item?.type === 'profile_access_granted';

  return (
    <View>
      <TouchableOpacity 
        style={styles.container} 
        onPress={handleClick}
        disabled={isAccessRequest}
        activeOpacity={isAccessRequest ? 1 : 0.7}
      >
        <Avatar
            uri = {item?.sender?.image}
            size={hp(5)}
        />

        <View style={styles.nameTitle}>
            <Text style={styles.text}>
                {
                    item.sender.name
                }
            </Text>
            <Text style={[styles.text, {color: theme.colors.textDark}]}>
                {
                    item.title
                }
            </Text>
        </View>

        {/* Action buttons for access requests */}
        {isAccessRequest ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.acceptBtn, isProcessed && styles.disabledBtn]}
              onPress={handleAcceptRequest}
              disabled={isProcessing || isProcessed}
            >
              <Text style={{ color: isProcessed ? '#999' : 'white', fontSize: 16, fontWeight: 'bold' }}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn, isProcessed && styles.disabledBtn]}
              onPress={handleRejectRequest}
              disabled={isProcessing || isProcessed}
            >
              <Text style={{ color: isProcessed ? '#999' : 'white', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : isAccessGranted ? (
          <TouchableOpacity 
            style={styles.viewBtn}
            onPress={handleClick}
          >
            <Text style={styles.viewBtnText}>View</Text>
          </TouchableOpacity>
        ) : (
          <Text style={[styles.text, {color: theme.colors.textLight}]}>
            {createdAt}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export default NotificationItem

const styles = StyleSheet.create({
    container: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  backgroundColor: 'white',
  borderWidth: 0.5,
  borderColor: theme.colors.darkLight,
  padding: 15,
  borderRadius: theme.radius.xxl,
  borderCurve: 'continuous',
},

nameTitle: {
  flex: 1,
  gap: 2,
},

text: {
  fontSize: hp(1.6),
  fontWeight: theme.fonts.medium,
  color: theme.colors.text,
},

actionButtons: {
  flexDirection: 'row',
  gap: 10,
  alignItems: 'center',
},

actionBtn: {
  padding: 8,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  minWidth: 36,
  height: 36,
},

acceptBtn: {
  backgroundColor: theme.colors.primary,
},

rejectBtn: {
  backgroundColor: theme.colors.heart,
},

disabledBtn: {
  opacity: 0.5,
},

viewBtn: {
  backgroundColor: theme.colors.primary,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
},

viewBtnText: {
  color: 'white',
  fontSize: hp(1.5),
  fontWeight: theme.fonts.semibold,
}

})