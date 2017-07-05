<template>
  <div id='slider' v-if='productList.length > 0'>
    <ul id="tab">
      <li v-for='name, key in tabs' :data-tab='key' @click='clickTab' :class='selectedTab === key ? "active": ""'>{{name}}</li>
    </ul>
    <ul class='list'>
      <li v-for='product in filterdProducts' @click='redirectUrl("/#/product/" + product.product_id)'>
        <!-- <router-link :to="{name: 'ProductDetail', params: {id: product.product_id}}"> -->
        <a>
          <img v-lazy='product.product_pic_url + "!custom.jpg"'>
          <div class='info'>
            <h2>
              {{product.product_name.replace('雪球-', '')}}
            </h2>
            <p v-for='desc in product.product_advantage'>{{desc}}</p>
            <div class="tags">
              <span :class='product.product_type'>{{readableType(product.product_type)}}</span>
              <span>{{product.product_brand.name}}</span>
            </div>
            <div class="price">
              <strong>{{product.product_start_price}}</strong>元起
            </div>
          </div>
        </a>
        <!-- </router-link> -->
      </li>
    </ul>
    <div class="companies">
      <h2>合作保险公司</h2>
      <div class="companies_img">
        <img v-lazy='"https://xqimg.imedao.com/15bfbc0939e6f343fec44630.png!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15bfbc08b006f6d3fea73748.jpg!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15cab4ccf7e77e3feb120582.png!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15cab4e19817813fe83e1d89.png!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15cab4e4d527de3fdb0f3665.png!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15cab4e89ca7823fef5671e6.png!custom660.jpg"'>
        <img v-lazy='"https://xqimg.imedao.com/15cab49034d77b3fea560dab.png!custom660.jpg"' >
      </div>
    </div>

  </div>
  <div id='page_loading' v-else>
    <div class="page_loading_icon">
      <img src='https://assets.imedao.com/images/logos/logo-gray.png'>
    </div>
  </div>

</template>

<script>
  import xqBridge from '../util/bridge.js'
  // import wx from 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js'
  export default {
    name: 'top',
    data () {
      return {
        items: [
          {
            'url': 'https://baoxian.xueqiu.com/#/product/100874',
            'img': 'https://xqimg.imedao.com/15ccde992d75f873fe709c0a.jpg'
          },
          {
            'url': 'https://baoxian.xueqiu.com/#/product/100879',
            'img': 'https://xqimg.imedao.com/15c5d4982a815d6f3fe4faed.png'
          },
          {
            'url': 'https://xueqiu.com/3748823499/84145949',
            'img': 'https://xqimg.imedao.com/15b85df792311173fec90313.jpg'
          },
          {
            'url': 'https://baoxian.xueqiu.com/#/product/100821',
            'img': 'https://xqimg.imedao.com/15b8921ebb117b73fbdc675e.jpg'
          }
          // {
          //   'url': 'https://baoxian.xueqiu.com/#/product/100814',
          //   'img': 'https://xqimg.imedao.com/15b892249c017723fee1b095.jpg'
          // }
        ],
        tabs: {
          'ALL': '精选',
          'CHILD': '少儿',
          'ADULT': '成人',
          'PARENT': '老人',
          'TRAVEL': '旅游',
          'FAMILY': '家庭'
        },
        selectedTab: 'ALL',
        swiperOption: {
          initialSlide: 0,
          autoplay: 5000,
          direction: 'horizontal',
          grabCursor: true,
          setWrapperSize: true,
          // autoHeight: true,
          pagination: '.swiper-pagination',
          paginationClickable: true,
          lazyLoading: true,
          loop: true,
          prevButton: '.banner-swiper-button-prev',
          nextButton: '.banner-swiper-button-next'
        },
        share: {
          from: '',
          channel: ''
        }
      }
    },
    asyncData ({ store }) {
      // 触发 action 后，会返回 Promise
      return store.dispatch('FETCH_PRODUCT')
    },
    computed: {
      filterdProducts () {
        if (this.selectedTab === 'ALL') {
          return this.productList
        } else {
          return this.productList.filter(product => product.product_type === this.selectedTab)
        }
      },
      productList () {
        return this.$store.state.product
      }
    },
    // created () {
    //   this.fetchData()
    // },
    mounted () {
      // window.document.title = '雪球保险'
      const query = this.$route.query
      if (query.tab) {
        this.selectedTab = query.tab
      }
      let from
      if (query.from) {
        this.share.from = query.from
        from = 'from_' + query.from
      } else {
        from = 'home'
      }
      if (query.channel) {
        this.share.channel = query.channel
      }
      console.log(from)
      this.getShareInfo()
    },
    components: {
    },
    methods: {
      clickTab (tab) {
        // Array.from(document.querySelectorAll('#tab li')).forEach(li => li.classList.remove('active'))
        // tab.target.classList.add('active')
        this.selectedTab = tab.target.getAttribute('data-tab')
      },
      redirectUrl (url) {
        if (this.share.from) {
          url = url + '?from=' + this.share.from + '&channel=' + this.share.channel
        }
        xqBridge.redirect({
          type: 'PUSH',
          url: url
        })
      },
      readableType (type) {
        const types = {
          'CHILD': '少儿',
          'ADULT': '成人',
          'PARENT': '老人',
          'TRAVEL': '旅游',
          'LONG_INSURANCE': '长险',
          'FAMILY': '家庭'
        }
        return types[type]
      },
      getShareInfo () {
        var user = async (token) => {
          let url = '/api/insurance/product/share/channel/query.json'
          if (token) {
            url = url + '?access_token=' + token
          }
          try {
            const json = await fetch(url, {credentials: 'same-origin'})
            const data = await json.json()
            console.log(data)
            if (data.error_code) {
              this.xqShare()
              this.wxShare()
            } else {
              this.xqShare(data.data.code)
              this.wxShare(data.data.code)
            }
          } catch (error) {
            console.log(error)
          }
        }
        if (navigator.userAgent.match(/Xueqiu Android/i)) {
          xqBridge.getAccessToken({
            success: token => {
              this.access_token = token
              user(token)
            }
          })
        } else {
          user()
        }
      },
      xqShare (id) {
        console.log(id)
        if (!id) {
          id = ''
        }
        xqBridge.setRightNavigationButton({
          title: '分享',
          action: function () {
            var shareTitle = '雪球保险'
            var shareParams = {
              title: shareTitle,
              url: 'https://baoxian.xueqiu.com/#/?from=xq_share&channel=' + id,
              target: '',
              img: 'https://xqimg.imedao.com/15c3f2228dc122923f8172eb.png',
              description: '雪球保险专注于为不同人群提供专属的、高性价比保险产品，提供安全快捷的购买方式。'
            }
            xqBridge.share(shareParams)
          }
        })
      },
      /* eslint-disable */
      wxShare (id) {
        console.log(id)
        if (!id) {
          id = ''
        }
        if (navigator.userAgent.match(/MicroMessenger/i)) {
          
          fetch('/xueqiu/service/wcshare?url=' + encodeURIComponent(location.href.split('#')[0]))
            .then(response => response.json())
            .then(response =>{
              var Title = '雪球保险'
              var Desc = '雪球保险专注于为不同人群提供专属的、高性价比保险产品，提供安全快捷的购买方式。'
              var ImgUrl = 'https://xqimg.imedao.com/15c3f2228dc122923f8172eb.png'
              var Link = 'https://baoxian.xueqiu.com/#/?from=wx_share&channel=' + id
              // alert(JSON.stringify(response))
              wx.config({
                appId: response.appId,
                timestamp: response.timestamp,
                nonceStr: response.nonceStr,
                signature: response.signature,
                jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareQZone']
              })
              wx.ready(function () {
                //好友
                wx.onMenuShareAppMessage({
                  title: Title,
                  desc: Desc,
                  link: Link,
                  imgUrl: ImgUrl,
                  success: function () {
                    // 用户确认分享后执行的回调函数
                    _hmt.push(['_trackEvent', 'share', 'wx', 'message', +id])
                  },
                  cancel: function () {
                    // 用户取消分享后执行的回调函数
                  }
                })
                //朋友圈
                wx.onMenuShareTimeline({
                  title: Title,
                  link: Link,
                  imgUrl: ImgUrl,
                  success: function () {
                    // 用户确认分享后执行的回调函数
                    _hmt.push(['_trackEvent', 'share', 'wx', 'timeline', +id])
                  },
                })
                //qq好友
                wx.onMenuShareQQ({
                  title: Title, // 分享标题
                  desc: Desc, // 分享描述
                  link: Link, // 分享链接
                  imgUrl: ImgUrl, // 分享图标
                })
                //qq空间
                wx.onMenuShareQZone({
                  title: Title, // 分享标题
                  desc: Desc, // 分享描述
                  link: Link, // 分享链接
                  imgUrl: ImgUrl, // 分享图标
                })
              })
              wx.error(function(res){
                  // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                // alert(JSON.stringify(res))
              });
            })
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  #slider {
    .slider img {
      width: 100%;
      background: #EDF0F5;
    }
  }

  ul.list {
    li > a{
      display: flex;
      padding: 1.43rem 1rem;
      border-bottom: 1px solid #F3F5F7;
    }
    img {
      flex: 0 0 7rem;
      display: block;
      height: 7rem;
      margin-right: 1rem;
      border: 1px solid #EDF0F5;
    }
    a {
      color: #333;
      cursor: pointer;
    }

    h2 {
      font-size: 1.29rem;
    }

    p {
      color: #666;
      font-size: 0.93rem;
    }

    .info {
      position: relative;
      padding-bottom: 2rem;
      width: 100%;
    }

    .tags {
      position: absolute;
      left: 0;
      bottom: 0;
    }

    .price {
      position: absolute;
      right: 0;
      bottom: 0;
    }

    .tags span {
      border-radius: 0.14rem;
      padding: 0.15rem 0.4rem;
      height: 1.03rem;
      line-height: 1.03rem;
      margin-right: 0.29rem;
      border: 1px solid white;
      font-size: 0.86rem;
    }

    .tags span:nth-child(1) {
      color: white;
      background-color: #d6a16f;
      border-color: #d6a16f;
    }

    .tags span:nth-child(1).CHILD {
      background-color: #FFCB0B;
      border-color: #FFCB0B;
    }

    .tags span:nth-child(1).ADULT {
      background-color: #68C4FB;
      border-color: #68C4FB;
    }

    .tags span:nth-child(1).PARENT {
      background-color: #D6A16F;
      border-color: #D6A16F;
    }

    .tags span:nth-child(1).TRAVEL {
      background-color: #9C77E3;
      border-color: #9C77E3;
    }

    .tags span:nth-child(2) {
      color: #3fadc5;
      border-color: #3fadc5;
    }

    .price {
      color: #FF7700;
      font-size: 1.14rem;
    }

    .price strong{
      font-size: 1.14rem;
    } 
  }
  #tab {
    box-sizing: border-box;
    width: 100%;
    background-color: white;
    position: sticky;
    top: 0;
    display: flex;
    border-bottom: 1px solid #f3f5f7;
    z-index: 2;
    li {
      flex-grow: 1;
      padding: 0.93rem 0;
      margin: 0 0.2rem;
      text-align: center;
      font-size: 1.07rem;
      color: #666;
      border-bottom: 0.21rem solid #fff;
      justify-content: space-around;
      margin: 0 1rem;
      cursor: pointer;
    }

    li.active {
      color: #3fadc5;
      font-weight: bold;
      border-bottom: 0.21rem solid #3fadc5;
    }
  }

  .companies {
    border-top: 1.07rem solid rgb(243,245,247);
    padding: 0.6rem 0;
    h2 {
      font-size: 1.29rem;
      padding: 0.4rem 1.36rem;
    }
    .companies_img {
      overflow-x: scroll;
      overflow-y: hidden;
      white-space: nowrap;
    }
    img {
      height: 40px;
      border: 1px solid #EDF0F5;
      margin-left: 1rem;
      max-width: 7rem;
    }
  }


</style>
