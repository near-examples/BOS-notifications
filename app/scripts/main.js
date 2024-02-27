'use strict';

const statusDiv = document.querySelector('#status');
const registerButton = document.querySelector('#register');

let serviceWorker = undefined;

window.onload = async () => {
  statusDiv.innerHTML = "Loading ...";

  if (!('serviceWorker' in navigator && 'PushManager' in window)) {
    statusDiv.innerHTML = "Incompatible Browser :(";
    return
  }

  // Get service worker or Register a new one
  serviceWorker = await navigator.serviceWorker.getRegistration();

  if (!serviceWorker) {
    const serviceWorkedURL = new URL('sw.js', import.meta.url);
    serviceWorker = await navigator.serviceWorker.register(serviceWorkedURL);
  }

  const currentSubscription = await serviceWorker.pushManager.getSubscription();

  if (currentSubscription) {
    statusDiv.innerHTML = "Ready to receive notifications! Go <a href='https://near.org/near/widget/ProfilePage?accountId=gagdiez.near'>like something</a>!";
  } else {
    statusDiv.innerHTML = `Please subscribe to notifications`;
    registerButton.disabled = false;
  }
}

// Register subscription
registerButton.addEventListener('click', register);

async function register() {
  if (Notification.permission === 'denied') {
    return statusDiv.innerHTML = "Please allow notifications";
  }

  statusDiv.innerHTML = "Subscribing...";

  const HOST = 'https://discovery-notifications-mainnet.near.org';
  const applicationServerKey = 'BH_QFHjBU9x3VlmE9_XM4Awhm5vj2wF9WNQIz5wdlO6hc5anwEHLu6NLW521kCom7o9xChL5xvwTsHLK4dZpVVc';

  const subscription = await serviceWorker.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  });

  const NearNotificationsPayload = {
    subscription,
    accountId: 'gagdiez.near',
    gateway: 'https://docs.near.org',
  }

  const response = await fetch(`${HOST}/subscriptions/create`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(NearNotificationsPayload),
  });
  console.log(response);

  statusDiv.innerHTML = "Ready to receive notifications! Go <a href='https://near.org/near/widget/ProfilePage?accountId=gagdiez.near'>like something</a>!";
  registerButton.disabled = true;
}