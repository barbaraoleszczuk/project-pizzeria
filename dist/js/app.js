import{settings, select, classNames} from './settings.js';

import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = { //obekt tworzący instancje
  
  initPages: function(){
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    const idFromHash = window.location.hash.replace('#/', '');
    
    let pageMatchingHash = thisApp.pages[0].id;
    for(let page of thisApp.pages){
      if(page.id == idFromHash){
        pageMatchingHash = page.id;
        break;
      }
    }
    //console.log('pageMatchingHash',pageMatchingHash);
    thisApp.activatePages(pageMatchingHash);
    
    for(let link of thisApp.navLinks ){
      link.addEventListener('click', function(event){
        const clickedElement=this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#','');
        /* run thisApp.activatePaged with that id */
        thisApp.activatePages(id);
        /*change URL hash */
        window.location.hash = '#/'+ id;
      });
    }
  },
  activatePages: function(pageId){
    const thisApp = this;
    /* add class "active" to matching pages, remove from non-matching*/
    for(let page of thisApp.pages){
      // if( page.Id==pageId){
      //   page.classList.add(classNames.pages.active);
      // }else{
      //   page.classList.remove(classNames.pages.active);
      // }
      page.classList.toggle(classNames.pages.active,page.id==pageId);
    } 
  
    /* add class "active" to matching links, remove from non-matching*/
    for(let link of thisApp.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href')=='#'+ pageId);
    }
  },

  initMenu: function(){
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
  
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
    /*const testProduct = new Product();
    console.log('testProduct:', testProduct);*/
  },
  initData: function(){
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;
    fetch(url)
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);

        // save response as this.App.data.products
        thisApp.data.products = parsedResponse;

        //execute initMenu method
        thisApp.initMenu();
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  initBooking: function (){
    const thisApp = this;
    // find container of page rezervation
    const containerRezerv = document.querySelector(select.containerOf.booking);
    //tworzyła nową instancję klasy Booking i przekazywała do konstruktora kontener, który przed chwilą znaleźliśmy,
    thisApp.booking = new Booking(containerRezerv);
  },
  initCart: function(){
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function(event){
      app.cart.add(event.detail.product);
    });
  },
  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initCart();
    thisApp.initData();
    thisApp.initBooking();
  },
};
app.init();



