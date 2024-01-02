import van from 'vanjs-core'
import context from '../../context'

const { link, navState } = context

const { label, input, span, br, section } = van.tags

const agreementPage = () => {

  const inputParams = {
    type: 'checkbox',
    id: 'agreement',
    name: 'agreement',
    checked: navState.val.agreement,
    onchange: (e) => (navState.val.agreement = e.target.checked),
  }

  return section(
    label(input(inputParams), 'I agree with the terms and conditions'),
    br(),
    span(link({'class': '', 'name': 'context'}, 'click here'), ' to view agreement status')
  )
}

export default agreementPage
