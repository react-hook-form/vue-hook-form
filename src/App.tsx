import { useForm } from './useForm'

export default {
  name: 'App',
  setup() {
    return useForm()
  },
  render() {
    return <form>
      <input ref={this.register({ requiired: true })} name="firstName" />
      <input ref={this.register({ requiired: true })} name="lastName" />
      <button>Submit</button>
    </form>
  }
}
