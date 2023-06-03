import { templates, select, settings, classNames } from '../settings.js';
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
    thisBooking.initTables();
    thisBooking.selectedTable = null;
    thisBooking.starters = [];
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
      tables : element.querySelectorAll(select.booking.tables),
      floorPlan: element.querySelector(select.booking.floorPlan),
      orderButton : document.querySelector(select.booking.button),
      phone: element.querySelector(select.booking.phone),
      address : element.querySelector(select.booking.address),
      submit : element.querySelector(select.booking.submit),
      starters : document.querySelector(select.booking.starters),
    };
  }
  sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const payload = {
      date: thisBooking.date,
      hour: utils.numberToHour(thisBooking.hour),
      table: thisBooking.tableId,
      duration: thisBooking.hoursAmount.value,
      ppl: thisBooking.peopleAmount.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      adress: thisBooking.dom.address.value,
    };

    
    thisBooking.dom.starters.addEventListener('click', function(event){
      if(event.target.tagName == 'INPUT' && event.target.type == 'checkbox' && event.target.name == 'starter'){
        if(event.target.checked == true){
          thisBooking.starters.push(event.target.value);
        } else {
          const arrayStarterNumber = thisBooking.starters.indexOf(event.target.value);
          thisBooking.starters.splice(arrayStarterNumber, 1);
        }
      }
      
    });
    thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
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
  
  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});
    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});  
    thisBooking.dom.datePicker.addEventListener('updated', function(){});
    thisBooking.dom.hourPicker.addEventListener('updated', function(){});

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });
    thisBooking.dom.floorPlan.addEventListener('click', function(event){thisBooking.initTables(event);
    });
    thisBooking.dom.orderButton.addEventListener('click', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
    });

    thisBooking.dom.starters.addEventListener('click', function(event){
      if(event.target.tagName == 'INPUT' && event.target.type == 'checkbox' && event.target.name == 'starter'){
        if(event.target.checked == true){
          thisBooking.starters.push(event.target.value);
        } else {
          const arrayStarterNumber = thisBooking.starters.indexOf(event.target.value);
          thisBooking.starters.splice(arrayStarterNumber, 1);
        }
      }
      console.log('starters: ', thisBooking.starters);
    });
  }
  initTables(){
    //Właściwość target zwraca obiekt będący celem zdarzenia dla danego zdarzenia.
    // Jeśli zdarzenie nie zostało wysłane zwracana będzie wartość null. Właściwość jest tylko do odczytu.
    const thisBooking = this;

    thisBooking.element.addEventListener('click', function(event){
      event.preventDefault();
    
      //Czy kliknięto na stolik?
      if (event.target.classList.contains('table')){
      //Czy stolik jest wolny?
        if(!event.target.classList.contains('booked')){
          for(let table of thisBooking.dom.tables){
            if (table.classList.contains('selected') && //jeśli wśród stolików, któryś ma klasę 'selected' a nie jest tym 'klikniętym', to zabierz tę klasę
            table !== event.target){
              table.classList.remove('selected');
            }
            //dodaj klasę selected

            if(event.target.classList.contains('selected')){
              event.target.classList.remove('selected');
            }
            else {
              event.target.classList.add(classNames.booking.tableSelected);
            }
          }
        }
        //Przypisz nr stolika do właściwości w konstruktorze
        //Jeśli nie, wyświetl alert
        else {
          alert('this table is already booked');
        } 
        console.log(event.target);
      }
    });
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
    console.log('bookings', bookings);
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
      
    }
    thisBooking.updateDOM();
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
  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      || 
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  

}

export default Booking;