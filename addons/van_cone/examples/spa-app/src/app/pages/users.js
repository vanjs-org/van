import van from 'vanjs-core'
import context from '../../context'

const { link } = context

const { div, br, h1, ul, li, p, span } = van.tags

const userDB = [
  {first: 'Pilar', middle: 'Maria', last: 'Mendoza', age: 42},
  {first: 'John', middle: 'R', last: 'Doe', age: 42},
  {first: 'Ashley', middle: 'P', last: 'Smith', age: 47},
  {first: 'Timothy', middle: 'Robert', last: 'Johnson', age: 47}
]

const userListItem = (user, userId) => 
  li(
    link({name: 'user', params: {userId: userId}, class: ''}, `${user.last}, ${user.first}`)
  )

const usersPage = (params, query) => {

  let users = userDB
  
  if (query.sort === 'asc') users = userDB.sort((a, b) => (a.last > b.last) ? 1 : -1)
  if (query.sort === 'desc') users = userDB.sort((a, b) => (a.last > b.last) ? -1 : 1)

  return div(
    h1('Users'),
    br(),
    div({class: 'centered-container', style: 'width: 42%'},
      p('sort: ',
        link({name: 'users', class: '', query: {sort: 'asc'}}, 'asc'),
        span(' '),
        link({name: 'users', class: '', query: {sort: 'desc'}}, 'desc')
      ),
      ul(
        users.map((user, userId) => userListItem(user, userId))
      )
    )
  )
}

export default usersPage
export { userDB }