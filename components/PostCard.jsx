import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { theme } from '../constants/theme'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'
import Icon from '@/assets/icons'
import RenderHtml from 'react-native-render-html';
import { Image } from 'expo-image'
import { getSupabaseFileUrl } from '../services/imageService'
import { useVideoPlayer, VideoView } from 'expo-video'
import { createPostLike, removePostLike } from '../services/postService'
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Loading from './Loading'
import { createNotification } from '../services/notificationService'
import ImageModal from './ImageModal'

const textStyles = {
    color: theme.colors.dark,
    fontSize: hp(1.75)
}

const tagsStyles = {
  body: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  },
  div: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  },
  p: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
    marginBottom: 4,
  },
  ol: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  },
  ul: {
    color: theme.colors.dark,
    fontSize: hp(1.75),
  },
  h1: {
    color: theme.colors.dark,
    fontSize: hp(2.5),
    fontWeight: 'bold',
    marginBottom: 8,
    width: '100%', // ADD THIS
  },
  h4: {
    color: theme.colors.dark,
    fontSize: hp(2),
    fontWeight: '600',
    marginBottom: 6,
    width: '100%', // ADD THIS
  },
  strong: {
    fontWeight: 'bold',
  },
  b: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  i: {
    fontStyle: 'italic',
  },
  span: {
    color: theme.colors.dark, // ADD THIS ENTIRE SPAN SECTION
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
    fontStyle: 'italic',
    marginVertical: 8,
  },
  code: {
    backgroundColor: theme.colors.gray,
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
};

const renderersProps = {
  img: {
    enableExperimentalPercentWidth: true,
  },
};

const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow = true,
    showMoreIcon = true,
    showDelete = false,
    onDelete = () => {},
    onEdit = () => {},
}) => {

    // DEBUG LOGGING
    // console.log("=== PostCard Debug ===");
    // console.log("Item received:", item);
    // console.log("Item ID:", item?.id);
    // console.log("Item type:", typeof item?.id);
    // console.log("Router exists:", !!router);
    // console.log("showMoreIcon:", showMoreIcon);
    // console.log("=====================");

    const shadowStyles = {
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    }

    const [likes, setLikes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
      setLikes(item?.postLikes || []);
    }, [item?.postLikes])

    // Create video player for video posts
    const isVideo = item?.file && item.file.includes('postVideos');
    const videoSource = isVideo ? getSupabaseFileUrl(item?.file)?.uri : null;
    const player = useVideoPlayer(videoSource, player => {
      if(player) {
        player.loop = true;
      }
    });

    const openPostDetails = () => {
      if(!showMoreIcon) return null;
      
      console.log("=== Navigation Debug ===");
      console.log("Attempting to navigate with ID:", item?.id);
      console.log("ID type:", typeof item?.id);
      console.log("Router:", router);
      console.log("========================");
      
      // Make sure item.id exists
      if(!item?.id) {
        console.error("ERROR: No item.id found!");
        Alert.alert("Error", "Post ID not found");
        return;
      }
      
      // Navigation
      try {
        router.push({
          pathname: '/postDetails',
          params: { postId: String(item.id) }
        });
        console.log("Navigation called successfully");
      } catch (error) {
        console.error("Navigation error:", error);
        Alert.alert("Error", "Failed to navigate: " + error.message);
      }
    }

    // Like button functionality
    const onLike = async() => {
      if(liked) {
        // remove like
        let updatedLikes = likes.filter(like => like.userId != currentUser?.id);
        setLikes([...updatedLikes])
        let res = await removePostLike(item?.id, currentUser?.id);
        console.log('removed like: ', res);
  
        if(!res.success) {
          Alert.alert("Error", "Something went wrong!");
        }

      } else {
         // create like
         let data = {
           userId: currentUser?.id,
           postId: item?.id
         }
         setLikes([...likes, data])
         let res = await createPostLike(data);
         console.log('added like: ', res);
      
         if(res.success) {
           // Send notification to post owner
           if(currentUser?.id != item?.userId) {
             let notify = {
               senderId: currentUser?.id,
               receiverId: item?.userId,
               title: 'liked your post',
               data: JSON.stringify({postId: item?.id}),
               is_read: false,
             }
             createNotification(notify);
           }
         } else {
           Alert.alert("Error", "Something went wrong!");
         }
       }
    }

    const onShare = async () => {
      if(item?.file) {
        // Get the file URL
        const fileUrl = getSupabaseFileUrl(item?.file);
        
        // Check if URL exists before attempting download
        if(fileUrl?.uri) {
          try {
            // Create proper file path with extension
            const fileName = item.file.split('/').pop();
            const fileExtension = fileName.includes('.') ? '' : (item.file.includes('postImages') ? '.png' : '.mp4');
            const localPath = `${FileSystem.documentDirectory}${fileName}${fileExtension}`;
            
            console.log('Downloading from:', fileUrl.uri);
            console.log('Downloading to:', localPath);
            
            // Download the file
            setLoading(true);
            const downloadResult = await FileSystem.downloadAsync(
              fileUrl.uri,
              localPath
            );
            setLoading(false);
            
            console.log('Download result:', downloadResult);
            
            // Check if sharing is available
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
              // Share the downloaded file
              await Sharing.shareAsync(downloadResult.uri, {
                dialogTitle: 'Share Post',
                mimeType: item.file.includes('postImages') ? 'image/png' : 'video/mp4',
              });
            } else {
              Alert.alert('Error', 'Sharing is not available on this device');
            }
            
          } catch (error) {
            console.log('Error sharing file:', error);
            Alert.alert('Error', 'Failed to share the file');
          }
        } else {
          console.log('File URL is null or undefined');
          Alert.alert('Error', 'File not found');
        }
      } else {
        // If there's no file, just share the text
        let content = {message: stripHtmlTags(item?.body)};
        Share.share(content);
      }
    }

    const handleDeletePost = () => {
      Alert.alert(
                  "Are you sure?",
                  `Do you want to delete this post?`,
                  [
                    {
                      text: "Cancel",
                      onPress: () => console.log("Cancel Pressed"),
                      style: "cancel"
                    },
                    { text: "OK",
                      onPress: () => onDelete(item),
                      style: 'destructive'
                   }
                  ]
                )
    }

    const createdAt = moment(item?.created_at).format('MMM D')
    const liked = likes.filter(like => like.userId == currentUser?.id)[0] ? true : false;

    return (
      <>
      <ImageModal 
        visible={modalVisible} 
        imageUri={getSupabaseFileUrl(item?.file)}
        onClose={() => setModalVisible(false)}
      />
      <View style={[styles.container, hasShadow && shadowStyles]}>
        <View style={styles.header}>
          {/* user info and post time */}
          <View style={styles.userInfo}>
              <Avatar
                  size={hp(4.5)}
                  uri={item?.user?.image}
                  rounded={theme.radius.md}
              />
              <View style={{gap: 2}}>
                  <Text style={styles.username}>{item?.user?.name}</Text>
                  <Text style={styles.postTime}>{createdAt}</Text>
              </View>
          </View>

          {
            showMoreIcon && (
              <TouchableOpacity onPress={openPostDetails}>
                <Icon name='threeDotsHorizontal' size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
              </TouchableOpacity>
            )
          }

          {
            showDelete && currentUser.id == item?.userId && (
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => onEdit(item)}>
                  <Icon name='edit' size={hp(2.5)} strokeWidth={2} color={theme.colors.text} />
                </TouchableOpacity>
                 <TouchableOpacity onPress={handleDeletePost}>
                  <Icon name='delete' size={hp(2.5)} strokeWidth={2} color={theme.colors.heart} />
                </TouchableOpacity>
              </View>
            )
          }
        </View>

        {/* post body and media */}
        <View style={styles.content}>
          <View style={styles.postBody}>
           
           {
           item?.body &&
           <RenderHtml 
           contentWidth={wp(100)} 
           source={{html: item?.body}} 
           tagsStyles={tagsStyles}
           enableCSSInlineProcessing={true}
           ignoredStyles={["fontSize"]}
           renderersProps={renderersProps}
           defaultTextProps={{
           allowFontScaling: false,
           }}
           />
           }
          </View>

          {/* post image */}
          {
            item?.file && item?.file?.includes('postImages') && (
              <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.9}>
                <Image
                  source={getSupabaseFileUrl(item?.file)}
                  transition={100}
                  style={styles.postMedia}
                  contentFit='cover'
                />
              </TouchableOpacity>
            )
          }

          {/* post video */}
          {
            isVideo && (
              <VideoView
                style={[styles.postMedia, {height: hp(30)}]}
                player={player}
                nativeControls
                contentFit="cover"
              />
            )
          }
        </View>

        {/* like comment and share */}
        <View style={styles.footer}>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.footerButton} onPress={onLike}>
              <Icon name='heart' size={24} fill={liked ? theme.colors.heart : 'transparent'} strokeWidth={2} color={liked ? theme.colors.heart : theme.colors.textLight} />
              <Text style={styles.count}>
                {likes?.length || 0}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.footerButton} onPress={openPostDetails}>
              <Icon name='comment' size={24} strokeWidth={2} color={theme.colors.textLight} />
              <Text style={styles.count}>
                {item?.comments?.[0]?.count || 0}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            {
              loading ? (
                <Loading size='small'/>
              ) : (
                <TouchableOpacity style={styles.footerButton} onPress={onShare}>
                  <Icon name='share' size={24} strokeWidth={2} color={theme.colors.textLight} />
                </TouchableOpacity>
              )
            }
          </View>
        </View>
      </View>
      </>
    )
}

export default PostCard

const styles = StyleSheet.create({
    container: {
      gap: 10,
      marginBottom: 15,
      borderRadius: theme.radius.xxl * 1.1,
      borderCurve: 'continuous',
      padding: 10,
      paddingVertical: 12,
      backgroundColor: 'white',
      borderWidth: 0.5,
      borderColor: theme.colors.gray,
      shadowColor: '#000'
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },

    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8
    },

    username: {
      fontSize: hp(1.7),
      color: theme.colors.textDark,
      fontWeight: theme.fonts.medium,
    },

    postTime: {
      fontSize: hp(1.4),
      color: theme.colors.textLight,
      fontWeight: theme.fonts.medium,
    },

    content: {
      gap: 10,
    },

    postMedia: {
      height: hp(40),
      width: '100%',
      borderRadius: theme.radius.xl,
      borderCurve: 'continuous'
    },

    postBody: {
      marginLeft: 5,
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 15
    },

    footerButton: {
      marginLeft: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4
    },

    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 18,
    },

    count: {
      color: theme.colors.text,
      fontSize: hp(1.8)
    }
})