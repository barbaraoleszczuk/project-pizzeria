import { templates, select } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
class Booking{
  constructor(element){
    const thisBooking=this;
    thisBooking.render(element);
    thisBooking.initWidgets();

  }
  render(element){
    const thisBooking = this;

    thisBooking.dom = {
      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
    };
    //generate HTML
    const generatedHTML = templates.bookingWidget(); 
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    /*find Booking container*/
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /*add element to booking*/
    bookingContainer.appendChild(thisBooking.element);
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    
    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});    
  }
}

export default Booking;