import van from 'vanjs-core'
import context from '../../context'

const { link, navState } = context

const { label, input, span, br, div, h1 } = van.tags

const contextPage = () => {

  const className = (navState.val.agreement) ? 'success' : 'danger'

  return div({ style: 'text-align:center' },
    h1('The state of the context object: '),
    span({ 'class': className }, `The agreement: ${navState.val.agreement}` )
  )
}

const agreementPage = () => {

  const inputParams = {
    type: 'checkbox',
    id: 'agreement',
    name: 'agreement',
    checked: navState.val.agreement,
    onchange: (e) => (navState.val.agreement = e.target.checked),
  }

  return div(
    label(input(inputParams), 'I agree with the terms and conditions'),
    br(),
    span(link({'class': '', 'name': 'context'}, 'click here'), ' to view agreement status')
  )
}

export default agreementPage
export { contextPage }