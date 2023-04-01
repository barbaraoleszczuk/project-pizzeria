import{settings, select, classNames, templates, CartProduct} from '../settings.js';
import utils from '../utils.js';

class Cart{
  constructor(element) {
    const thisCart = this;
      
    thisCart.products = []; //tablica, w której przechowujemy produkty dodane do koszyka
      
    thisCart.getElements (element);
    thisCart.initActions();
        
    // console.log('new Cart', thisCart);
  }
  getElements (element) {
    const thisCart = this;                     
    
    thisCart.dom = {}; //referencje elementów DOM

    thisCart.dom.wrapper=element;
    thisCart.dom.toggleTrigger=thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList=thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice); //SelectorAll, bo występuje w koszytu w dwóch miejscach
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.adress = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
  }
  
  initActions (){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click',function(event){
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    thisCart.dom.productList.addEventListener('updated',function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove',function(event){
        
      thisCart.remove(event.detail.cartProduct);
    });
    thisCart.dom.form.addEventListener('submit',function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }
  add(menuProduct){
    // const thisCart = this;
    const thisCart = this; 
    /*generate HTML based on template*/
    const generatedHTML = templates.cartProduct(menuProduct);
    // console.log(generatedHTML);
    /*create element using utils.createElementFromHTML*/
    const generatedDOM= utils.createDOMFromHTML(generatedHTML);
      
    /*add element to menu*/
    thisCart.dom.productList.appendChild(generatedDOM);

    // console.log('adding product', menuProduct);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products',thisCart.products);
    thisCart.update();
  }
  update(){
    const thisCart = this;
    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.totalPrice = 0;

    for(let product of thisCart.products){
      thisCart.totalNumber += product.amount;
      thisCart.subtotalPrice += product.price;
    }
    if(thisCart.subtotalPrice != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
        
    } 
    else {
      thisCart.totalPrice = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    for(let item of thisCart.dom.totalPrice){
      item.innerHTML = thisCart.totalPrice;
    }
    console.log('totalNumber: ', thisCart.totalNumber, 'subtotalPrice: ', thisCart.subtotalPrice, 'totalPrice:', thisCart.totalPrice);
  }
  remove(cartProduct){
     
    const thisCart = this;
      
    cartProduct.dom.wrapper.remove();
    const productIndex = thisCart.products.indexOf(cartProduct);
    thisCart.products.splice(productIndex);
    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.adress.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
      
    fetch(url, options)
      .then(function(response) {
        return response.json();
      }).then(function(parsedResponse) {
        console.log('parsedResponse: ', parsedResponse);
      });
      
  }
      
}
export default Cart;