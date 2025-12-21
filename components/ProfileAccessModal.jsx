import { Alert, ActivityIndicator } from 'react-native';
import { createAccessRequest } from '../services/accessRequestService';
import { createNotification } from '../services/notificationService';

const ProfileAccessModal = async (senderName, senderId, receiverId, onSuccess, onError) => {
    Alert.alert(
        'View Profile Request',
        `Do you want to send a view profile request to ${senderName}?`,
        [
            {
                text: 'Cancel',
                onPress: () => console.log('Request cancelled'),
                style: 'cancel'
            },
            {
                text: 'Yes',
                onPress: async () => {
                    try {
                        try {
                            // Create access request
                            console.log('Creating access request:', { senderId, receiverId });
                            const result = await createAccessRequest(senderId, receiverId);
                            console.log('Access request result:', result);

                            if (result.success) {
                                // Send notification to receiver
                                const notify = {
                                    senderId: senderId,
                                    receiverId: receiverId,
                                    title: 'wants to view your profile',
                                    type: 'profile_access_request',
                                    data: JSON.stringify({ requestId: result.data.id }),
                                    is_read: false,
                                };

                                console.log('Creating notification:', notify);
                                const notifyResult = await createNotification(notify);
                                console.log('Notification creation result:', notifyResult);
                                
                                if (!notifyResult.success) {
                                    console.error('Notification creation failed:', notifyResult);
                                }
                                
                                if (onSuccess) {
                                    onSuccess();
                                }

                                Alert.alert('Success', 'Profile access request sent!');
                            } else {
                                console.error('Request creation failed:', result.msg);
                                if (onError) {
                                    onError(result.msg);
                                }
                                Alert.alert('Error', result.msg || 'Failed to send request');
                            }
                        } catch (error) {
                            console.error('ProfileAccessModal catch error:', error);
                            Alert.alert('Error', error.message || 'Something went wrong');
                        }
                    } catch (error) {
                        console.log('ProfileAccessModal error:', error);
                        if (onError) {
                            onError(error.message);
                        }
                        Alert.alert('Error', 'Something went wrong');
                    }
                },
                style: 'default'
            }
        ]
    );
};

export default ProfileAccessModal;
