# 🧪 Vue Hook Form (experiential)

This is an experiential repo to port react hook form into the Vue world.

## Quickstart

```tsx
import { useForm } from "@hookform/vue";

export default {
  setup() {
    return useForm();
  },
  onSubmit(data) {
    console.log(data);
  },
  render() {
    return (
      <form onSubmit={this.handleSubmit(this.onSubmit)}>
        <input ref={this.register({ required: true })} name="firstName" />
        {this.errors.firstName && "This is required."}

        <input ref={this.register({ required: true })} name="lastName" />
        {this.errors.lastName && "This is required."}

        <input type="submit" />
      </form>
    );
  }
};
```

## Sponsors

<a href="https://underbelly.is/" target="_blank">
<img src="https://images.opencollective.com/underbelly/989a4a6/logo/256.png" width="75" height="75" />
</a>

<br />

Want your logo here? [DM on Twitter](https://twitter.com/HookForm)

## Backers

Thanks goes to all our backers! [[Become a backer](https://opencollective.com/react-hook-form#backer)].

<a href="https://opencollective.com/react-hook-form#backers">
    <img src="https://opencollective.com/react-hook-form/backers.svg?width=950" />
</a>

## Organizations

Thanks goes to these wonderful organizations! [[Contribute](https://opencollective.com/react-hook-form/contribute)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/organizations.svg?width=950" />
</a>

## Contributors

Thanks goes to these wonderful people! [[Become a contributor](CONTRIBUTING.md)].

<a href="https://github.com/react-hook-form/react-hook-form/graphs/contributors">
    <img src="https://opencollective.com/react-hook-form/contributors.svg?width=950" />
</a>
