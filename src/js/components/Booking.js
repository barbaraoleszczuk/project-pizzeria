import { templates, select, settings } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking{
  constructor(element){
    const thisBooking=this;
    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }
  render(element){ //widget Container
    const thisBooking = this;

  
    //generate HTML
    const generatedHTML = templates.bookingWidget(); 
    thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    /*find Booking container*/
    const bookingContainer = document.querySelector(select.containerOf.booking);
    /*add element to booking*/
    bookingContainer.appendChild(thisBooking.element);
  

    thisBooking.dom = {
      wrapper: element,
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
      datePicker: element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper),
    };
  }
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});  
    
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.dom.datePicker.addEventListener('updated', function(){});

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    thisBooking.dom.hourPicker.addEventListener('updated', function(){});
  }
  getData(){
    const thisBooking = this;
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParm = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);
    const params = {
      booking:[
        startDateParam,
        endDateParm
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParm
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParm
      ]
    };
    //console.log('getData params', params);
    const urls={
      booking:       settings.db.url + '/' + settings.db.booking 
                                   + '?' + params.booking.join('&'),  //właściwość ta będzie zawierać adres endpoint-u z API, który zwróci listę rezerwacji z zakresu dat
      eventsCurrent: settings.db.url + '/' + settings.db.event   
                                   + '?' + params.eventsCurrent.join('&'), //zwróci listę wydarzeń jednorazowych
      eventsRepeat:  settings.db.url + '/' + settings.db.event  
                                   + '?' + params.eventsRepeat.join('&'), //zwróci listę wydarzeń cyklicznych
    };
    //console.log('getData urls', urls);
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        //console.log('bookings', bookings);  
        //console.log('eventsCurrent', eventsCurrent);
        //console.log('eventsRepeat', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {}; //obiekt, który będzie przechowywał informacje o zarezerwowanych stolikach
    
    for(let item of bookings){ //zmienna item o właściwościach: data, godzina, dł. rezerwacji, nr stolika
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;
    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
      console.log('thisBooking.booked',thisBooking.booked );
    }
  }
  makeBooked(date, hour, duration,table){
    const thisBooking = this;

    if( typeof thisBooking.booked[date] == 'undefined'){ //jesli nie ma danej daty w obiekcie, tworzymy nowy obiekt z tą właśnie datą
      thisBooking.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);// dodanie zarezerwowanego stolika do tablicy z rezerwacjami
    }
  }
}

export default Booking;