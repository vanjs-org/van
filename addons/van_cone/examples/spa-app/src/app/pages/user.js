import van from 'vanjs-core'
import { userDB } from './users'

const { br, h1, p, table, tr, td, div } = van.tags

const userNotFound = p({ style: 'text-align:center' }, 'user id was not found')

const profileCol = (label, data) => 
  tr(
    td({class: 'profile-left-col'}, label), 
    td(data)
  )

const userProfile = (userData) => {
  return () => table({class: 'centered-container'},
    profileCol('first:', userData.first),
    profileCol('middle:', userData.middle),
    profileCol('last:', userData.last),
    profileCol('age:', userData.age)
  )
}

const userPage = (params) => {

  const userId = params.userId
  const userData = userDB[userId]

  return div(
    h1(`User ${userId}`),
    br(),
    div((userData) ? userProfile(userData) : userNotFound)
  )
}

export default userPage
