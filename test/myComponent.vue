<template>
  <span class="example">{{ msg }}</span>
</template>
<script>


  import './myModule.mjs'

  export default {
    data () {
      return {
        msg: 'world!'
      }
    }
  }
</script>

<style scoped>
  .example {
    color: red;
  }
</style>
