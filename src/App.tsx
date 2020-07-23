import { useForm } from "./useForm";

export default {
  name: "App",
  setup() {
    return useForm();
  },
  onSubmit(data) {
    console.log(data);
  },
  render() {
    console.log('render....', this.test);
    return (
      <form onSubmit={this.handleSubmit(this.onSubmit)}>
        <input ref={this.register({ required: true })} name="firstName" />
        <input ref={this.register({ required: true })} name="lastName" />
        <button>Submit</button>
      </form>
    );
  }
};
