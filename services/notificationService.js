import { supabase } from "../lib/supabase";

export const createNotification = async (notification) => {
    try {
       const {data, error} = await supabase
       .from("notifications")
       .insert(notification)
       .select()
       .single();


       if(error){
           console.log('notification error: ', error);
           return { success: false, message: 'Error notification posts' };
       }
       return {success:true, data:data};

    } catch (error) {
        console.log('notification error: ', error);
        return { success: false, message: 'Error notification posts' };
    }
}

export const fetchNotifications = async (receiverId) => {
     try {
        const {data, error} = await supabase
        .from("notifications")
        .select(`
             *,
             sender: senderId(id, name, image)
         `)
        .eq('receiverId', receiverId)
        .order('created_at', {ascending: false});

        if(error){
            console.log('fetchNotification: ', error);
            return { success: false, message: 'Error fetching notifications' };
        }
        return {success:true, data:data};

     } catch (error) {
         console.log('fetchNotification error: ', error);
         return { success: false, message: 'Error fetchig notifications' };
     }
}

export const checkUnreadNotifications = async (receiverId) => {
     try {
        const {data, error} = await supabase
        .from("notifications")
        .select('id')
        .eq('receiverId', receiverId)
        .eq('is_read', false)
        .limit(1);

        if(error){
            console.log('checkUnread error: ', error);
            return { success: false, hasUnread: false };
        }
        return {success: true, hasUnread: data && data.length > 0};

     } catch (error) {
         console.log('checkUnread error: ', error);
         return { success: false, hasUnread: false };
     }
}

export const markNotificationsAsRead = async (receiverId) => {
     try {
        const {data, error} = await supabase
        .from("notifications")
        .update({is_read: true})
        .eq('receiverId', receiverId)
        .eq('is_read', false)
        .select();

        if(error){
            console.log('markAsRead error: ', error);
            return { success: false };
        }
        return {success: true, data};

     } catch (error) {
         console.log('markAsRead error: ', error);
         return { success: false };
     }
}