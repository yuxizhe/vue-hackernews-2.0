<template>
  <div>
    <div class="nav_bar">
      <div class="container">
        <a href="/"></a>
        <h1>{{title}}</h1>
      </div>
    </div>
    <div class="wx_img">
      <img src="https://xqimg.imedao.com/15caae4f08f6203fb1c1e45e.png">
      <p>关注雪球保</p>
      <p>购买、保障更方便</p>
    </div>
    <div id="app">
      <router-view></router-view>
      <tabsList v-if="$route.path === '/' || $route.path === '/orders' || $route.path === '/error'"></tabsList>
    </div>
  </div>
  
</template>

<script>
// import tabsList from './components/Tabs.vue'

export default {
  name: 'app',
  data () {
    return {
      product: null,
      title: '雪球保险'
    }
  },
  mounted () {
    let loadingIcon = document.querySelector('#page_loading')
    if (loadingIcon) {
      loadingIcon.remove()
    }
  }
  // components: { tabsList }
}
</script>

<style>
body {
  font-family: Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f3f5f7;
  min-height: 100vh;
  -webkit-text-size-adjust: 100% !important;
}

#app {
  max-width: 600px;
  margin: auto;
  background-color: #fff;
  min-height: 100vh;
  z-index: 1;
}

* {
  margin: 0;
  padding: 0;
  font-size: 14px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

a {
  color: #3FADC5;
  text-decoration: none;
}


ul, li {
  list-style: none;
}

section {
  background: #fff;
  margin-bottom: 0.96rem;
}


#page_loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /*z-index: 10;*/
  /*background-color: rgba(0,0,0,0.5); */
}
#page_loading .page_loading_icon {
  position: absolute;
  left: 0;
  right: 0;
  top: -50px;
  bottom: 0;
  margin: auto;
  overflow: hidden;
  /*transform: translateX(-50%);*/
  animation: rotation 1s linear infinite;
  height: 3rem;
  width: 3rem;
}
#page_loading .page_loading_icon img {
  height: 3rem;
  width: 3rem;
}


 @keyframes rotation{
  from{transform:rotate(0deg)}
  to{transform:rotate(360deg)}
  }

.nav_bar {
  display: none;
  background-color: #fff;
  height: 60px;
  border-top: 3px solid #3FADC5;
  box-shadow: 0 4px 2px -2px rgba(0, 0, 0, 0.1);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 99;
}

.nav_bar .container {
  width: 960px;
  margin: auto;
  position: relative;
}

.nav_bar .container h1{
  text-align: center;
  margin: 0;
  line-height: 60px;
  font-size: 20px;
  font-weight: normal;
}

.nav_bar .container a{
  position: absolute;
  width: 140px;
  height: 40px;
  top: 14px;
  left: 0;
  background-image: url("https://xqimg.imedao.com/15cced3eb9864e33fe294293.png");
  background-size: contain;
  /*background-position: center;*/
  background-repeat: no-repeat;
}
.wx_img{
  display: none;
  width: 160px;
  height: 220px;
  position: fixed;
  background: white;
  top: 50%;
  right: 50%;
  transform: translate(480px,-50%);
}

.wx_img img {
    width: 140px;
    height: 140px;
    margin: auto;
    margin-top: 10px;
    display: block;
}
.wx_img p {
  margin: 8px 0;
  text-align: center;
  color: #666;
  font-size: 16px;
}

@media only screen and (min-width: 900px) {
  .nav_bar {
    display: block;
  }
  .wx_img{
    display: block;
  }
  #app {
    padding-top: 60px;
  }
  #tab {
    top: 63px !important;
  }
}

</style>
