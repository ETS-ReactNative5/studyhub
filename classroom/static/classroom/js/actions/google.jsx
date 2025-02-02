import { push } from 'connected-react-router'

import $script from 'scriptjs'

import { checkHttpStatus, getAxios } from '../utils'

import { classroomCreateClassroom, bulkStudentsUpdate, classroomFetchTeacherClassroomsList } from '../actions/classroom'

import {
  GOOGLE_RECEIVE_CLASSROOMS_LIST, GOOGLE_INIT_STATE_CHANGED
  // , GOOGLE_RECEIVE_CLASSROOMS_STUDENTS_LIST
} from '../constants'

// TODO as Open Source we must replace this values with data from dev or AWS environment while webpack compiling bundle
var CLIENT_ID = '1090448644110-r8o52h1sqpbq7pp1j8ougcr1e35qicqg.apps.googleusercontent.com'
var API_KEY = 'AIzaSyBNaX7xo_Vo08-myCDEzY4AKZkkfyJYIc8'

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/classroom.courses.readonly' +
  ' https://www.googleapis.com/auth/classroom.rosters.readonly' +
  ' https://www.googleapis.com/auth/classroom.profile.emails'

// var DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/classroom/v1/rest']

export function googleInitStateChanged (gapiInitState) {
  return {
    type: GOOGLE_INIT_STATE_CHANGED,
    payload: {
      gapiInitState
    }
  }
}

export function gapiInitialize () {
  return (dispatch, state) => {
    function handleClientLoad () {
      gapi.load('client:auth2', initGapiClient)
      // gapi.load('client:auth2', {'callback': initGapiClient})
    }

    function initGapiClient () {
      gapi.client.init({
        // discoveryDocs: DISCOVERY_DOCS,
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        scope: SCOPES
      }).then(function () {
        gapi.client.load('classroom', 'v1', () => {
          dispatch(googleInitStateChanged(true))
        })
      }).catch(e => {
        console.log('error:', e)
      })
    }
    $script('https://apis.google.com/js/api.js', function () {
      handleClientLoad()
    })
  }
}

function listCourses (callback, dispatch) {
  gapi.client.classroom.courses.list(
    {teacherId: gapi.auth2.getAuthInstance().currentUser.get()['El']}
  ).then(function (response) {
    dispatch(callback(response.result.courses))
  })
}

export function receiveGoogleClassroomsList (googleClassroomsList) {
  return {
    type: GOOGLE_RECEIVE_CLASSROOMS_LIST,
    payload: {
      googleClassroomsList
    }
  }
}

export function googleFetchClassroomList () {
  return (dispatch, state) => {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      gapi.auth2.getAuthInstance().signIn().then(function () {
        listCourses(receiveGoogleClassroomsList, dispatch)
      })
    } else {
      listCourses(receiveGoogleClassroomsList, dispatch)
    }
  }
}

function processNextPage (pageToken, googleCourseID, googleCourseStudentsList, whenAllPagesProcessedCallback) {
  var batch = gapi.client.newBatch()

  var searchRequest = function () {
    return gapi.client.classroom.courses.students.list({
      'courseId': googleCourseID,
      'pageSize': 30,
      'pageToken': pageToken
    })
  }

  var request = searchRequest()
  batch.add(request)

  batch.then(function (response) {
    for (var key in response.result) { // responses (courses)
      if ('students' in response.result[key].result) {
        for (var j = 0; j < response.result[key].result.students.length; j++) { // students
          var student = response.result[key].result.students[j]
          googleCourseStudentsList.push(
            {
              'email': student['profile']['emailAddress'],
              'first_name': student['profile']['name']['givenName'],
              'last_name': student['profile']['name']['familyName']
            }
          )
        }
      }
      if ('nextPageToken' in response.result[key].result) {
        processNextPage(response.result[key].result['nextPageToken'], googleCourseID, googleCourseStudentsList, whenAllPagesProcessedCallback)
      } else {
        // stop paginations and save students
        whenAllPagesProcessedCallback(googleCourseStudentsList)
      }
    }
  })
}

function listCoursesStudents (googleClassrooms, refreshClassroomsStudentsList) {
  /***
   * each classroom in googleClassrooms must contain pib_classroom_uuid key
   */
  return (dispatch, state) => {
    var batch = gapi.client.newBatch()

    // save natchRequestKey/google_classroom_id map for use in response
    var requestsMap = []

    for (var i = 0; i < googleClassrooms.length; i++) {
      var searchRequest = function () {
        return gapi.client.classroom.courses.students.list({
          'courseId': googleClassrooms[i].id,
          'pageSize': 30
        })
      }
      var request = searchRequest()
      requestsMap[batch.add(request)] = googleClassrooms[i].id
    }

    batch.then(function (response) {
      for (var key in response.result) { // responses (courses)
        var googleCourseID = requestsMap[key]
        var pibClassroomID = null

        for (var i = 0; i < googleClassrooms.length; i++) {
          if (googleClassrooms[i]['id'] === googleCourseID) {
            pibClassroomID = googleClassrooms[i]['pib_classroom_uuid']
          }
        }

        if ('students' in response.result[key].result) {
          var googleCourseStudentsList = []

          // create googleCourseStudentsList with pib classroom id
          for (var j = 0; j < response.result[key].result.students.length; j++) { // students
            var student = response.result[key].result.students[j]
            googleCourseStudentsList.push(
              {
                'email': student['profile']['emailAddress'],
                'first_name': student['profile']['name']['givenName'],
                'last_name': student['profile']['name']['familyName']
              }
            )
          }
        }

        // if have next page then create a new query
        if ('nextPageToken' in response.result[key].result) {
          processNextPage(response.result[key].result['nextPageToken'],
            googleCourseID,
            googleCourseStudentsList,
            (allpagesgoogleCourseStudentsList) => {
              dispatch(bulkStudentsUpdate(pibClassroomID, allpagesgoogleCourseStudentsList, 'google', refreshClassroomsStudentsList))
            })
        } else {
          if (pibClassroomID) {
            dispatch(bulkStudentsUpdate(pibClassroomID, googleCourseStudentsList, 'google', refreshClassroomsStudentsList))
          } else {
            dispatch(classroomFetchTeacherClassroomsList())
          }
        }
      }
    })
  }
}

export function googleFetchAndSaveClassroomsStudents (classrooms, refreshClassroomsStudentsList) {
  return (dispatch, state) => {
    if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
      gapi.auth2.getAuthInstance().signIn().then(function () {
        dispatch(listCoursesStudents(classrooms, refreshClassroomsStudentsList))
      })
    } else {
      dispatch(listCoursesStudents(classrooms, refreshClassroomsStudentsList))
    }
  }
}

export function googleSaveClassroomsWithStudents (googleClassrooms, googleCourseSelected) {
  return (dispatch, state) => {
    for (var i = 0; i < googleClassrooms.length; i++) {
      var googleClassRoom = googleClassrooms[i]
      var newClassroom = {}
      newClassroom['name'] = googleClassRoom['name']
      newClassroom['course_uuid'] = googleCourseSelected.uuid
      newClassroom['external_classroom'] = {}
      newClassroom['external_classroom']['external_id'] = googleClassRoom['id']
      newClassroom['external_classroom']['name'] = googleClassRoom['name']
      newClassroom['external_classroom']['teacher_id'] = googleClassRoom['ownerId']
      newClassroom['external_classroom']['code'] = googleClassRoom['enrollmentCode']
      newClassroom['external_classroom']['alternate_link'] = googleClassRoom['alternateLink']

      var getCallback = function (j) {
        return (createdClassroom) => {
          // add pib_classroom_uuid to each google classroom for students update
          googleClassrooms[j]['pib_classroom_uuid'] = createdClassroom.uuid
          if (j === googleClassrooms.length - 1) {
            dispatch(googleFetchAndSaveClassroomsStudents(googleClassrooms))
          }
        }
      }

      // create classroom
      dispatch(classroomCreateClassroom(newClassroom,
        false,
        getCallback(i)
      ))
    }
  }
}
