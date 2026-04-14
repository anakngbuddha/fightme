import PusherClient from 'pusher-js';

// Hardcoded or environment-based Pusher credentials
const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY || 'YOUR_PUSHER_KEY';
const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'YOUR_PUSHER_CLUSTER';

export const pusherClient = new PusherClient(pusherKey, {
  cluster: pusherCluster,
  authEndpoint: '/api/pusher-auth',
});
