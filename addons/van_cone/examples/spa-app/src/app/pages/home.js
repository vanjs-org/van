import vanLogo from '/vanjs.svg'
import van from 'vanjs-core'

const { div, br, h1, img } = van.tags

const homePage = () => {

  return div(
    h1('Welcome to this SPA demo using VanJS and Van Cone!'),
    br(),
    div(
      { style: 'text-align:center' },
      img({ src: vanLogo, alt: 'VanJS', style: 'height:100px; width:100px' })
    )
  )
}

export default homePage
