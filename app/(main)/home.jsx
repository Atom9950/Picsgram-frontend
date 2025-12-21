import { Alert, Platform, Pressable, StyleSheet, Text, View, RefreshControl } from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import ScreenWrapper from '../../components/ScreenWrapper'
import Button from '../../components/Button'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { hp, wp } from '../../helpers/common'
import { theme } from '../../constants/theme'
import Icon from '@/assets/icons'
import { useRouter } from 'expo-router'
import Avatar from '../../components/Avatar'
import { fetchPosts } from '../../services/postService'
import { FlatList } from 'react-native'
import PostCard from '../../components/PostCard'
import Loading from '../../components/Loading'
import { getUserData } from '../../services/userService'
import { checkUnreadNotifications, markNotificationsAsRead } from '../../services/notificationService'


var limit = 0;
const Home = () => {

    const {user, setAuth} = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasUnreadNotification, setHasUnreadNotification] = useState(false);
    
    // Store comment to post mapping for deletion events
    const commentPostMapRef = useRef({});

    const handlePostEvent = async(payload) => {
      // console.log('HOME - Post event received:', payload);
      if(payload.eventType == "INSERT" && payload?.new?.id){
        let newPost = {...payload.new}
        let res = await getUserData(newPost.userId);
        newPost.postLikes = [];
        newPost.comments = [{count: 0}]
        newPost.user = res.success? res.data: {};
        setPosts(prevPosts=> [newPost,...prevPosts]);
      }

      if(payload.eventType == "DELETE" && payload.old.id){
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.filter(post => post.id !== payload.old.id);
          return updatedPosts;
        })
      }

      if(payload.eventType == "UPDATE" && payload?.new?.id){
        setPosts(prevPosts => {
          let updatedPosts = prevPosts.map((post)=>{
            if(post.id==payload.new.id){
              post.body = payload.new.body;
              post.file = payload.new.file;
            }
            return post;
          });
          return updatedPosts;
        })
      }
    }

    const handleCommentEvent = async(payload) => {
      console.log('HOME - Comment event received:', payload);
      console.log('HOME - Event type:', payload.eventType);
      
      if(payload.eventType == "INSERT" && payload?.new?.id){
        const newComment = payload.new;
        console.log('HOME - INSERT - Updating post with ID:', newComment.postId);
        
        // Store the mapping for future deletion
        if(newComment.id && newComment.postId) {
          commentPostMapRef.current[newComment.id] = newComment.postId;
        }
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if(post.id === newComment.postId) {
              const newCount = (post?.comments?.[0]?.count || 0) + 1;
              console.log('HOME - Old count:', post?.comments?.[0]?.count, 'New count:', newCount);
              return {
                ...post,
                comments: [{count: newCount}]
              };
            }
            return post;
          })
        );
      }
      
      if(payload.eventType == "DELETE" && payload?.old?.id){
        const deletedComment = payload.old;
        // Get postId from our stored mapping
        const postId = commentPostMapRef.current[deletedComment.id];
        console.log('HOME - DELETE - Comment ID:', deletedComment.id, 'PostId from map:', postId);
        
        if(postId) {
          setPosts(prevPosts => 
            prevPosts.map(post => {
              if(post.id === postId) {
                const newCount = Math.max(0, (post?.comments?.[0]?.count || 0) - 1);
                console.log('HOME - Old count:', post?.comments?.[0]?.count, 'New count:', newCount);
                return {
                  ...post,
                  comments: [{count: newCount}]
                };
              }
              return post;
            })
          );
          
          // Clean up the mapping
          delete commentPostMapRef.current[deletedComment.id];
        } else {
          console.log('HOME - DELETE - PostId not found in map, will refresh on next pull');
        }
      }
    }

    const handlePostLikeEvent = async(payload) => {
      console.log('HOME - PostLike event received:', payload);
      console.log('HOME - PostLike new data:', payload.new);
      console.log('HOME - PostLike old data:', payload.old);
      
      if(payload.eventType == "INSERT" && payload?.new?.id){
        const newLike = payload.new;
        console.log('HOME - LIKE INSERT - Updating post with ID:', newLike.postId);
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            if(post.id === newLike.postId) {
              console.log('HOME - Found post to update, current likes:', post.postLikes?.length || 0);
              return {
                ...post,
                postLikes: [...(post.postLikes || []), newLike]
              };
            }
            return post;
          })
        );
      }
      
      if(payload.eventType == "DELETE" && payload?.old?.id){
        const deletedLike = payload.old;
        console.log('HOME - LIKE DELETE - Like ID:', deletedLike.id);
        
        setPosts(prevPosts => 
          prevPosts.map(post => {
            const filteredLikes = (post.postLikes || []).filter(like => like.id !== deletedLike.id);
            if(filteredLikes.length !== post.postLikes?.length) {
              console.log('HOME - Removed like from post:', post.id);
              return {
                ...post,
                postLikes: filteredLikes
              };
            }
            return post;
          })
        );
      }
    }

    const handleNewNotification = async(payload) => {
       console.log('HOME - New Notification received:', payload);
       if(payload.eventType == "INSERT" && payload.new.id && payload.new.receiverId === user.id){
         console.log('HOME - Setting unread notification for current user');
         setHasUnreadNotification(true);
       }
     }

    useEffect(() => {
       // Check for unread notifications on app launch
       const checkNotifications = async() => {
         let res = await checkUnreadNotifications(user.id);
         if(res.success && res.hasUnread) {
           setHasUnreadNotification(true);
         }
       }
       checkNotifications();

       let postChannel = supabase
         .channel('home-posts-channel')
         .on('postgres_changes', {event: '*', schema: 'public', table: 'posts'}, handlePostEvent)
         .subscribe((status) => {
           console.log('HOME - Posts channel status:', status);
         });

       let commentChannel = supabase
         .channel('home-comments-channel')
         .on('postgres_changes', {event: '*', schema: 'public', table: 'comments'}, handleCommentEvent)
         .subscribe((status) => {
           console.log('HOME - Comments channel status:', status);
         });

       let postLikeChannel = supabase
         .channel('home-postlikes-channel')
         .on('postgres_changes', {event: '*', schema: 'public', table: 'postLikes'}, handlePostLikeEvent)
         .subscribe((status) => {
           console.log('HOME - PostLikes channel status:', status);
         });

         let notificationChannel = supabase
         .channel('notifications')
         .on('postgres_changes', {event: 'INSERT', schema: 'public', table: 'notifications'}, handleNewNotification)
         .subscribe((status) => {
           console.log('HOME - Notification channel status:', status);
         });

       console.log('HOME - Subscribed to real-time channels');

       // Initial load
       getPosts();

       return() => {
         supabase.removeChannel(postChannel);
         supabase.removeChannel(commentChannel);
         supabase.removeChannel(postLikeChannel);
         supabase.removeChannel(notificationChannel);
       }
     }, [])

    const getPosts = async() => {
      if(!hasMore) return null;
      limit = limit + 4;
      
      console.log('HOME - Fetching with limit:', limit);

      let res = await fetchPosts(limit);
      if(res.success){
        console.log('HOME - Fetched posts:', res.data.length);
        
        // Debug: Log the first post's likes
        if(res.data.length > 0) {
          console.log('HOME - First post likes:', res.data[0].postLikes);
          console.log('HOME - First post like count:', res.data[0].postLikes?.length);
        }
        
        // Build comment-to-post mapping from fetched posts
        res.data.forEach(post => {
          if(post.comments && Array.isArray(post.comments)) {
            post.comments.forEach(comment => {
              if(comment.id) {
                commentPostMapRef.current[comment.id] = post.id;
              }
            });
          }
        });
        
        if(posts.length==res.data.length){
          setHasMore(false);
        }
        // Create a new array to force React to detect the change
        setPosts([...res.data])
      }
    }

    const onRefresh = async() => {
      setRefreshing(true);
      limit = 0;
      setHasMore(true);
      await getPosts();
      setRefreshing(false);
    }

  return (
    <ScreenWrapper bg={'white'}>
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>PicsGram</Text>
          <View style={styles.icons}>
            <Pressable onPress={async() => 
              {
                setHasUnreadNotification(false);
                await markNotificationsAsRead(user.id);
                router.push('notifications')
              }
            }>
              <Icon name='heart' size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
              {
                hasUnreadNotification && (
                  <View style={styles.notificationDot} />
                )
              }
            </Pressable>
            <Pressable onPress={() => router.push('newPost')}>
              <Icon name='plus' size={hp(3.2)} strokeWidth={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={() => router.push('profile')}>
              <Avatar
                uri={user?.image}
                size={hp(3.2)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>

        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyle}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => <PostCard
              item={item}
              currentUser={user}
              router={router}
          />       
          }

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
            console.log("got to the end")
          }}
          onEndReachedThreshold={0}
          ListFooterComponent={hasMore?(
            <View style={{marginVertical: posts.length==0?300: 30}}>
              <Loading/>
            </View>
          ): (
            <View style={{marginVertical:30}}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? hp(2) : 0,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: wp(4),
  },

  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },

  avatarImage: {
    height: hp(4.3),
    width: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: 'continuous',
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },

  icons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },

  listStyle: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },

  noPosts: {
    fontSize: hp(2),
    textAlign: 'center',
    color: theme.colors.text,
  },

  notificationDot: {
    position: 'absolute',
    right: -5,
    top: -5,
    height: hp(1.2),
    width: hp(1.2),
    borderRadius: 50,
    backgroundColor: theme.colors.heart,
  }
})