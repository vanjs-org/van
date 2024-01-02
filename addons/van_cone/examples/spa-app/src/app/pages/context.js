import van from 'vanjs-core'
import context from '../../context'

const { navState } = context
const { p, h1, section } = van.tags

const contextPage = () => {

  const className = (navState.val.agreement) ? 'success' : 'danger'

  return section({ style: 'text-align:center' },
    h1('The state of the context object: '),
    p({ 'class': className }, `The agreement: ${navState.val.agreement}` )
  )
}

export default contextPage
