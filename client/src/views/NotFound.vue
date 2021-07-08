<template>
  <div class="row">
    <div class="col text-center text-block">
      <h1>Error 404</h1>
      <h2>Page not found</h2>
    </div>
  </div>
</template>


<script>
export default {
  name: 'NotFound',
  metaInfo() {
    const meta = this.$t('meta.not-found');

    return {
      title: meta['title'] || '',
      meta: [
        {name: 'description', content: meta['description'] || ''},
        {property: 'og:title', content: meta['title'] || ''},
        {property: 'og:site_name', content: this.$t('meta.site_name') || ''},
        {property: 'og:type', content: 'website'},
        {name: 'robots', content: 'noindex, nofollow'}
      ]
    }
  },
  components: {}
}
</script>
