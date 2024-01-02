import van from 'vanjs-core'

const { div, p } = van.tags

const notFoundPage = () => {
  
  console.log('function notFoundPage', window.location.pathname)

  return div(
    p({style: 'text-align:center'}, `page not found: ${window.location.pathname}`),
  )
}

export default notFoundPage
