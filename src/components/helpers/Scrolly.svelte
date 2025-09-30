<script>
  import { onMount } from 'svelte';

  let {
    root = null,
    top = 0,
    bottom = 0,
    increments = 100,
    value = $bindable(0),
    children
  } = $props();

  let steps = [];
  let intersectionObservers = [];
  let container;

  onMount(() => {
    steps = Array.from(container.querySelectorAll('.step'));

    const threshold = [];
    const count = increments + 1;
    for (let i = 0; i < count; i++) {
      threshold.push(i / increments);
    }

    const marginTop = top ? top * -1 : 0;
    const marginBottom = bottom ? bottom * -1 : 0;

    const options = {
      root,
      rootMargin: `${marginTop}px 0px ${marginBottom}px 0px`,
      threshold
    };

    const observers = steps.map((step, i) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            value = i;
          }
        });
      }, options);

      observer.observe(step);
      return observer;
    });

    intersectionObservers = observers;

    return () => {
      intersectionObservers.forEach(observer => observer.disconnect());
    };
  });
</script>

<div bind:this={container} class="scrolly-container">
  {@render children()}
</div>

<style>
  .scrolly-container {
    position: relative;
  }
</style>