import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../constants/theme'
import { hp } from '../helpers/common'
import Avatar from './Avatar'
import moment from 'moment'
import Icon from '@/assets/icons'
import { useRouter } from 'expo-router'
import ProfileAccessModal from './ProfileAccessModal'
import { useAuth } from '../contexts/AuthContext'

const CommentItem = ({
    item,
    canDelete= false,
    onDelete = ()=>{},
    highlight=false
}) => {
    const router = useRouter();
    const { user } = useAuth();

    const createdAt = moment(item.created_at).format('MMM d');

    const handleDelete = () => {
        Alert.alert(
            "Are you sure?",
            `Do you want to delete this comment?`,
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

    const handleUserPress = () => {
        console.log('handleUserPress called from CommentItem');
        console.log('Current user:', user?.id);
        console.log('Comment author:', item?.userId);
        
        // Don't show request if it's the current user's comment
        if (user?.id === item?.userId) {
            console.log('Skipping - own comment');
            return;
        }

        console.log('Showing ProfileAccessModal from CommentItem');
        // Show profile access request modal
        ProfileAccessModal(
            item?.user?.name,
            user?.id,
            item?.userId,
            () => {
                console.log('Profile access request sent successfully');
            },
            (error) => {
                console.log('Profile access request error:', error);
            }
        );
    }
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleUserPress} activeOpacity={0.6}>
        <Avatar
          uri={item?.user?.image}
        />
      </TouchableOpacity>
      <View style={[styles.content, highlight && styles.highlight]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
            <TouchableOpacity style={styles.nameContainer} onPress={handleUserPress} activeOpacity={0.6}>
                <Text style={styles.text}>
                    {
                        item?.user?.name
                    }
                </Text>

                <Text>•</Text>

                <Text style={[styles.text, {color:theme.colors.textLight}]}>
                    {
                        createdAt
                    }
                </Text>
            </TouchableOpacity>
            {
                canDelete &&(

            <TouchableOpacity onPress={handleDelete}>
                <Icon name='delete' size={20} color={theme.colors.heart}/>
            </TouchableOpacity>
                )
            }
        </View>
        <Text style={[styles.text, {fontWeight: 'normal'}]}>
          {
              item?.text
          }
        </Text>
      </View>
    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({
container: {
  flex: 1,
  flexDirection: 'row',
  gap: 7,
},

content: {
  backgroundColor: 'rgba(0,0,0,0.06)',
  flex: 1,
  gap: 5,
  paddingHorizontal: 14,
  paddingVertical: 10,
  borderRadius: theme.radius.md,
  borderCurve: 'continuous',
},

highlight: {
  borderWidth: 0.2,
  backgroundColor: 'white',
  borderColor: theme.colors.dark,
  shadowColor: theme.colors.dark,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 5
},

nameContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 3,
},

text: {
  fontSize: hp(1.6),
  fontWeight: theme.fonts.medium,
  color: theme.colors.textDark,
}


})