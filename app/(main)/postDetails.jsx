import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { hp, wp } from '../../helpers/common';
import { theme } from '../../constants/theme';
import { ScrollView } from 'react-native';
import PostCard from '../../components/PostCard';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/Loading';
import Input from '../../components/Input';
import Icon from '@/assets/icons'
import { Alert } from 'react-native';
import CommentItem from '../../components/CommentItem';
import { supabase } from '../../lib/supabase';
import { getUserData } from '../../services/userService';
import { createNotification } from '../../services/notificationService';

const PostDetails = () => {
    const {postId, commentId} = useLocalSearchParams();
    const {user} = useAuth();
    const router = useRouter();
    const inputRef = useRef(null)
    const commentRef = useRef('')
    const [post, setPost] = useState(null)
    const [startLoding, setStartLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleNewComment = async (payload) => {
      console.log('got new comment: ', payload)
      if(payload.new){
        let newComment = {...payload.new};
        let res = await getUserData(newComment.userId)
        newComment.user = res.success? res.data: {},
        setPost(prevPost => {
          return{
            ...prevPost,
            comments: [newComment, ...prevPost.comments],
          }
        })

      }
    }

    console.log("postId received: ", postId)
    console.log("post details: ", post)

useEffect(() => {
  // Only fetch if postId exists and is not undefined
  if(postId && postId !== 'undefined') {
    console.log("Valid postId, fetching details...")
    
    // Set up real-time subscription
    let commentChannel = supabase
      .channel('comments')
      .on(
        'postgres_changes', 
        {
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments', 
          filter: `postId=eq.${postId}`
        }, 
        handleNewComment
      )
      .subscribe();
    
    // Fetch initial data
    getPostDetails();
    
    return () => {
      supabase.removeChannel(commentChannel);
    }
  } else {
    console.log("No valid postId, skipping fetch")
    setStartLoading(false);
  }
}, [postId])



    const getPostDetails = async() => {
      console.log("Fetching post with ID:", postId)
      
      //fetch post details here
      let res = await fetchPostDetails(postId);
      console.log("Fetch result:", res)
      
      if(res.success) {
        setPost(res.data);
      }
      setStartLoading(false);
    }

    const onNewComment = async () =>{
      if(!commentRef.current) return null;

      let data = {
        userId: user?.id,
        postId: post?.id,
        text: commentRef.current
      };

      //create comment
      setLoading(true);
      let res = await createComment(data);
      setLoading(false)

      if(res.success){
        //send notification to the owner of this post

        if(user.id != post.userId){
          //send notification
          let notify = {
            senderId: user.id,
            receiverId: post.userId,
            title: 'commented on your post',
            data: JSON.stringify({postId: post.id, commentId: res?.data?.id}),
          }
          createNotification(notify);
        }


        inputRef?.current?.clear();
        commentRef.current = '';
        Alert.alert("Success", "Your comment was posted successfully")
      }else{
        Alert.alert("Error", "Something went wrong")
      }
    }

    //delete comment
    const onDeleteComment = async (comment) => {
      console.log('Deleting comment: ', comment)

      let res = await removeComment(comment?.id);
      if(res.success){
        setPost(prevPost=>{
          let updatedPost = {...prevPost};
          updatedPost.comments = updatedPost?.comments.filter(c => c.id != comment?.id);
          return updatedPost;
        })
      }else{
        Alert.alert("Error", "Something went wrong");
      }

    }

    //delete post
    const onDeletePost = async (item) => {

      //delete post logic here
      let res = await removePost(post?.id);
      if(res.success){
        Alert.alert("Success", "Your post was deleted successfully")
        router.back()
      }else{
        Alert.alert("Error", "Something went wrong");
      }
    }

    //edit post
    const onEditPost = async(item) => {
      router.back();
      router.push({pathname: 'newPost', params:{...item}})
    }

    if(startLoding){
      return(
        <View style={styles.center}>
         <Loading/>
        </View>
      )
    }

    // If no post and not loading, show not found
    if(!post){
      return(
        <View style={[styles.center, {justifyContent: 'flex-start', marginTop: 100}]}>
          <Text style={styles.notFound}>Post not found! ☹️</Text>
        </View>
      )
    }

    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <PostCard
            item={{...post, comments: [{count: post?.comments?.length}]}}
            currentUser={user}
            router={router}
            hasShadow={false}
            showMoreIcon={false}
            showDelete={true}
            onDelete={onDeletePost}
            onEdit={onEditPost}
          />

          {/* comment input */}
          <View style={styles.inputContainer}>
            <Input
              inputRef={inputRef}
              placeholder='Add a comment...'
              onChangeText={value => commentRef.current = value}
              placeholderTextColor={theme.colors.textLight}
              containerStyle={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}
            />

            {
              loading ? (
                <View style={styles.loading}>
                  <Loading size='small'/>
                </View>
              ) : (
                <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                  <Icon name="send" color={theme.colors.primaryDark}/>
                </TouchableOpacity>
              )
            }
          </View>

          {/* comments list */}
          <View style={{marginVertical: 15, gap: 17}}>
            {
              post?.comments?.map(comment =>
                <CommentItem
                  key={comment?.id?.toString()}
                  item={comment}
                  highlight = {comment.id == commentId}
                  canDelete= {user?.id === comment?.userId || user.id === post?.userId}
                  onDelete={onDeleteComment}
                />
              )
            }

            {
              post?.comments?.length == 0 &&
              <Text style={{color: theme.colors.text, marginLeft: 5}}>No comments yet...</Text>
            }
          </View>
        </ScrollView>
      </View>
    )
}

export default PostDetails

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: wp(7),
    marginTop: 40
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },

  list: {
    paddingHorizontal: wp(4),
  },

  sendIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: 'continuous',
    height: hp(5.8),
    width: hp(5.8)
  },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },

  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },

  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scale: 1.3 }]
  }
})