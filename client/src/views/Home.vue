<template>
  <div>
    <HomepageNoUser v-if="!$store.state.user.account"></HomepageNoUser>
    <HomepageUser v-if="$store.state.user.account"></HomepageUser>
  </div>
</template>

<script>
import HomepageNoUser from '@/components/HomepageNoUser';
import HomepageUser from '@/components/HomepageUser';

export default {
  name: 'Home',
  data() {
    return {};
  },
  metaInfo() {
    const meta = this.$t('meta.home');

    return {
      title: meta['title'] || '',
      meta: [
        {name: 'description', content: meta['description'] || ''},
        {property: 'og:title', content: meta['title'] || ''},
        {property: 'og:site_name', content: this.$t('meta.site_name') || ''},
        {property: 'og:type', content: 'website'},
        {name: 'robots', content: 'index, follow'}
      ]
    }
  },
  components: {
    HomepageNoUser,
    HomepageUser
  },
}
</script>

