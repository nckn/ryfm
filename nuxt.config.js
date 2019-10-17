const resolve = require('path').resolve

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'RYFM',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'fragment', content: '!' },
      { name: 'robots', content: 'index, follow' }
      // { hid: 'description', name: 'description', content: 'Nuxt.js project' }
    ],
    link: [
      { rel: 'stylesheet', type: 'image/x-icon', href: 'https://fonts.googleapis.com/css?family=Karla' }
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      // { type: 'text/javascript', src: 'https://wchat.freshchat.com/js/widget.js' }
    ]
  },
  mode: 'universal',
  server: {
    port: 8000, // default: 3000
    host: '0.0.0.0', // default: localhost
  },
  /*
  ** Router 
  */
  router: {
    base: process.env.DEPLOY_ENV === 'STATIC' ? '/ryfm/' : '/'
  },
  plugins: [
    {src: '~/plugins/ant-design-vue', ssr: false}
  ],
  build: {
    extend (config, ctx) {
      ctx.loaders.less.javascriptEnabled = true
      ctx.loaders.less.modifyVars = {
        // 'font-family':                  'ProximaNovaReg',
        'primary-color':                '#479ff1'
      }
    }
  }

}
