import { useForm } from "./useForm";

export default {
  setup() {
    return useForm({
      mode: "onChange"
    });
  },
  onSubmit(data) {
    console.log(data);
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit(this.onSubmit)}>
        <input ref={this.register({ required: true })} name="firstName" />
        {this.errors.firstName && "Required"}
        <input ref={this.register({ required: true })} name="lastName" />
        {this.errors.lastName && "Required"}
        <button>Submit</button>
      </form>
    );
  }
};
