// import { combineReducers } from 'redux'

import notificationsReducer from './notifications'
// import profileReducer from './profile'

// export default combineReducers({
//   notifications: notificationsReducer,
//   profile: profileReducer
// })

export default {
  notifications: notificationsReducer,
  // profile: profileReducer // TODO replace this with global one
}
