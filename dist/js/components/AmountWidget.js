import{settings, select} from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget{ 
  constructor(element){
    super(element, settings.amountWidget.defaultValue);

    const thisWidget = this;
    thisWidget.getElements(element);
    // console.log('AmountWidget:', thisWidget);
    // console.log('constructor arguments:', element);

    
    thisWidget.initActions();
  }
  getElements(){ // Wyszukuje elementy widgetu
    const thisWidget = this;
    
    
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
    
  
  isValid(value){
    return !isNaN(value) //sprawdza, czy przekazana wartość jest liczbą "is not a number"
    && value >= settings.amountWidget.defaultMin 
    && value <= settings.amountWidget.defaultMax;
  }
  renderValue(){ //metoda służy temu, aby bierząca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  announce(){
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
  initActions(){
    const thisWidget = this;
    thisWidget.dom.input.addEventListener('change', function(){
      thisWidget.value=thisWidget.dom.input.value;
    });
    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue - 1);
    });
    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.correctValue + 1);
    });
    
  }
  
}
export default AmountWidget;