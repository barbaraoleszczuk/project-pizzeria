class BaseWidget{
  constructor(wrapperElement, initialValue){
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.correctValue = initialValue;
  }
  get value(){ //metoda używana do odczyta właściwości value
    const thisWidget = this;
    return thisWidget.correctValue;//zamiana value na correctValue-poprawna wartość widgetu, poprawna tzn spełniająca zasady w metodach parsValue i setValue 
  }
  set value(value){ //metoda uzywana przy każdej próbie ustawienia nowej właściwości value  
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value); // parseInt konwertuje zapis do danej liczby
    // console.log(newValue);

    /* TODO: Add validation */
    if(thisWidget.correctValue !== newValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }  
    thisWidget.renderValue();
  }
  setValue(value){
    const thisWidget = this;
    thisWidget.value = value;
  }
  parseValue(value){ //zmienia tekst na liczbę
    return parseInt(value);
  }
  isValid(value){
    return !isNaN(value); //sprawdza, czy przekazana wartość jest liczbą "is not a number"
  }
  renderValue(){ //metoda służy temu, aby bierząca wartość widgetu została wyświetlona na stronie
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce(){
    const thisWidget = this;

    const event = new CustomEvent('updated', {bubbles:true});

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;