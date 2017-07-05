<template>
  <div class="user-view">
    <template v-if="product">
      <div v-for="item in product">
        <p>{{item.product_name}}</p>
      </div>
    </template>
  </div>
</template>

<script>

export default {
  name: 'user-view',

  computed: {
    product () {
      return this.$store.state.product
    }
  },

  asyncData ({ store}) {
    return store.dispatch('FETCH_PRODUCT')
  }
}
</script>

<style lang="stylus">
.user-view
  background-color #fff
  box-sizing border-box
  padding 2em 3em
  h1
    margin 0
    font-size 1.5em
  .meta
    list-style-type none
    padding 0
  .label
    display inline-block
    min-width 4em
  .about
    margin 1em 0
  .links a
    text-decoration underline
</style>
