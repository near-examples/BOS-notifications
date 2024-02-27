/* eslint-env browser, serviceworker, es6 */

'use strict';

const type2Notification = {
  'like': 'liked your post',
  'follow': 'followed you',
  'comment': 'commented your post',
  'mention': 'mentioned you',
  'devgovgigs/like': 'liked your devhub post',
  'devgovgigs/mention': 'mentioned you in a devhub post',
  'devgovgigs/edit': 'edited a devhub post',
  'devgovgigs/reply': 'replied to your devhub post',
};

self.addEventListener('install', (_) => {
  console.log('Installing service worker…');
});

self.addEventListener('activate', (_) => {
  console.log('Worker ready to handle notifications!');
});

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const notification = event.data.json();
  const action = type2Notification[notification.valueType];
  const who = `${notification.initiatedBy.substring(0, 8)}...`;

  const title = 'Near Social Notification';
  const options = {
    body: `${who} ${action}`,
    icon: '../favicon.ico',
    badge: '../favicon.ico',
    data: notification,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification);

  const notification = event.notification;
  const {valueType, receiver, actionAtBlockHeight, devhubPostId} = notification.data;
  notification.close();

  let notificationUrl = '';

  if (valueType.includes('devgovgigs')) {
    notificationUrl = `https://near.org/devhub.near/widget/app?page=post&id=${devhubPostId}`;
  } else {
    notificationUrl = `https://near.org/s/p?a=${receiver}&b=${actionAtBlockHeight}`;
  }

  event.waitUntil(
    clients.openWindow(notificationUrl)
  );
});
