const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-ef95a-firebase-adminsdk-qvcou-6eea2d719f.json')
const databaseURL = 'https://fcm-ef95a.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-ef95a/messages:send'
const deviceToken =
  'dtLEeIkym-PX4oRz_LxTHj:APA91bEeRZ6wSLsN6kc5pcJ1syFEGNoov0UlmZ-Y8p3WqR83ly56irRZpuJzw02LaXYHzkd7lEBtWeHTgPH-DEwuosatIuNgJp9h_dz8SdFRxHKm0ltV4E8QpEqg0kDeuJUfIqtNEtyJ'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()