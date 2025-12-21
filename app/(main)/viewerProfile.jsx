import { Alert, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import { useAuth } from '../../contexts/AuthContext'
import { useLocalSearchParams, useRouter } from 'expo-router'
import Header from '../../components/Header'
import { hp, wp } from '../../helpers/common'
import Icon from '@/assets/icons'
import { theme } from '../../constants/theme'
import { supabase } from '../../lib/supabase'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import { FlatList } from 'react-native'
import Loading from '../../components/Loading'
import PostCard from '../../components/PostCard'
import { checkProfileAccess, useProfileAccess, deleteProfileAccess } from '../../services/accessRequestService'
import { getUserData } from '../../services/userService'

const ViewerProfile = () => {
    const { user: currentUser } = useAuth();
    const router = useRouter();
    const { userId, grantId, userName } = useLocalSearchParams();

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [hasAccess, setHasAccess] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [limit, setLimit] = useState(0);
    const [accessUsed, setAccessUsed] = useState(false);

    // Check access on mount
    useEffect(() => {
        const checkAccess = async () => {
            console.log('viewerProfile - checking access:', { currentUserId: currentUser?.id, targetUserId: userId, grantId });
            
            if (!currentUser?.id || !userId) {
                Alert.alert('Error', 'Missing profile information');
                setTimeout(() => router.back(), 500);
                return;
            }

            try {
                const result = await checkProfileAccess(currentUser.id, userId);
                console.log('checkProfileAccess result:', result);
                
                if (result.success && result.hasAccess) {
                    setHasAccess(true);
                    
                    // Mark as used immediately
                    const useResult = await useProfileAccess(grantId);
                    console.log('useProfileAccess result:', useResult);
                    if (useResult.success) {
                        setAccessUsed(true);
                    }

                    // Fetch profile user data
                    const userResult = await getUserData(userId);
                    console.log('getUserData result:', userResult);
                    if (userResult.success) {
                        setProfileUser(userResult.data);
                    }
                } else if (result.isExpired) {
                    Alert.alert('Access Expired', 'Your profile access has expired. Please request again.');
                    setTimeout(() => router.back(), 500);
                } else {
                    Alert.alert('No Access', 'You do not have access to view this profile.');
                    setTimeout(() => router.back(), 500);
                }
            } catch (error) {
                console.log('checkAccess error:', error);
                Alert.alert('Error', 'Failed to verify access');
                setTimeout(() => router.back(), 500);
            }
        };

        checkAccess();
    }, [currentUser?.id, userId]);

    // Load posts when user is available
    useEffect(() => {
        if (profileUser?.id && hasAccess) {
            getPosts();
        }
    }, [profileUser?.id, hasAccess]);

    const getPosts = async () => {
        if (!hasMore || !profileUser?.id) return null;

        const newLimit = limit + 4;
        setLimit(newLimit);

        let res = await fetchPosts(newLimit, profileUser.id);
        if (res.success) {
            if (posts.length == res.data.length) {
                setHasMore(false);
            }
            setPosts(res.data);
        }
    };

    const onRefresh = async () => {
        if (!profileUser?.id) return;

        setRefreshing(true);

        const currentPostCount = posts.length;
        const refreshLimit = currentPostCount > 0 ? currentPostCount : 4;
        setLimit(refreshLimit);
        setHasMore(true);

        let res = await fetchPosts(refreshLimit, profileUser.id);
        if (res.success) {
            setPosts(res.data);

            if (res.data.length < refreshLimit) {
                setHasMore(false);
            }
        }

        setRefreshing(false);
    };

    const handleBackPress = async () => {
        console.log('handleBackPress called with grantId:', grantId);
        // Delete the access grant when going back
        if (grantId) {
            try {
                console.log('Deleting access grant:', grantId);
                const result = await deleteProfileAccess(grantId);
                console.log('deleteProfileAccess result:', result);
            } catch (error) {
                console.log('Error deleting access:', error);
            }
        }
        console.log('Calling router.back()');
        router.back();
    };

    if (!hasAccess) {
        return (
            <ScreenWrapper bg={'white'}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Loading />
                </View>
            </ScreenWrapper>
        );
    }

    if (!profileUser) {
        return (
            <ScreenWrapper bg={'white'}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Loading />
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg={'white'}>
            <FlatList
                data={posts}
                ListHeaderComponent={
                    <UserHeader 
                        user={profileUser} 
                        router={router}
                        isGrantedAccess={true}
                        onBackPress={handleBackPress}
                    />
                }
                ListHeaderComponentStyle={{ marginBottom: 30 }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listStyle}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <PostCard
                        item={item}
                        currentUser={currentUser}
                        router={router}
                    />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                        colors={[theme.colors.primary]}
                    />
                }
                onEndReached={() => {
                    getPosts();
                }}
                onEndReachedThreshold={0}
                ListFooterComponent={
                    hasMore ? (
                        <View style={{ marginVertical: posts.length == 0 ? 100 : 30 }}>
                            <Loading />
                        </View>
                    ) : (
                        <View style={{ marginVertical: 30 }}>
                            <Text style={styles.noPosts}>No more posts</Text>
                        </View>
                    )
                }
            />
        </ScreenWrapper>
    );
};

const UserHeader = ({ user, router, isGrantedAccess, onBackPress }) => {
    console.log('UserHeader rendering with user:', user);
    
    return (
        <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4) }}>
            <View>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => {
                        console.log('Back button pressed');
                        onBackPress();
                    }}>
                        <Icon name="arrowLeft" size={24} strokeWidth={2} color={theme.colors.text} />
                    </TouchableOpacity>
                    {isGrantedAccess && (
                        <View style={styles.accessIndicator}>
                            <Text style={styles.accessText}>One Time Access</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.container}>
                <View style={{ gap: 15 }}>
                    <View style={styles.avatarContainer}>
                        <Avatar
                            uri={user?.image}
                            size={hp(12)}
                            rounded={theme.radius.xxl * 1.4}
                        />
                    </View>

                    {/* username and address */}
                    <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text style={styles.userName}>{user?.name || 'Name'}</Text>
                        <Text style={styles.infoText}>{user?.address || ''}</Text>
                    </View>

                    {/* email phone and bio */}
                    <View style={{ gap: 10 }}>
                        {user?.email && (
                            <View style={styles.info}>
                                <Icon name="mail" size={20} color={theme.colors.textLight} />
                                <Text style={styles.infoText}>{user.email}</Text>
                            </View>
                        )}
                        {user?.phoneNumber && (
                            <View style={styles.info}>
                                <Icon name="call" size={20} color={theme.colors.textLight} />
                                <Text style={styles.infoText}>{user.phoneNumber}</Text>
                            </View>
                        )}

                        {user?.bio && (
                            <View style={styles.info}>
                                <Text style={styles.infoText}>{user.bio}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );
};

export default ViewerProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 10,
    },

    accessIndicator: {
        backgroundColor: '#fef3c7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fcd34d',
    },

    accessText: {
        fontSize: hp(1.4),
        fontWeight: '600',
        color: '#92400e',
    },

    avatarContainer: {
        height: hp(12),
        width: hp(12),
        alignSelf: 'center',
    },

    userName: {
        fontSize: hp(3),
        fontWeight: '500',
        color: theme.colors.textDark,
    },

    info: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    infoText: {
        fontSize: hp(1.6),
        fontWeight: '500',
        color: theme.colors.textLight,
    },

    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },

    noPosts: {
        fontSize: hp(2),
        textAlign: 'center',
        color: theme.colors.text,
    },
});
