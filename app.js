// regular expression for validation
const strRegex = /^[a-zA-Z\s]*$/ // containing only letters
const emailRegex =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
const numberRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
/* supports following number formats - (123) 456-7890, (123)456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725 */
const digitRegex = /^\d+$/

// -------------------------------------------------- //

const fullscreenDiv = document.getElementById('fullscreen-div')
const modal = document.getElementById('modal')
const closeBtn = document.getElementById('close-btn')
const modalBtns = document.getElementById('modal-btns')
const form = document.getElementById('modal')
const addContactLists = document.querySelector('#cont-book-list tbody')

// -------------------------------------------------- //
let fullName = (email = number = '')

// Contact class
class Contact {
  constructor(id, fullName, email, number) {
    this.id = id
    this.fullName = fullName
    this.email = email
    this.number = number
  }

  static getContacts() {
    // from local storage
    let contacts
    if (localStorage.getItem('contacts') == null) {
      contacts = []
    } else {
      contacts = JSON.parse(localStorage.getItem('contacts'))
    }
    return contacts
  }

  static addContact(contact) {
    const contacts = Contact.getContacts()
    contacts.push(contact)
    localStorage.setItem('contacts', JSON.stringify(contacts))
  }

  static deleteContact(id) {
    const contacts = Contact.getContacts()
    contacts.forEach((contact, index) => {
      if (contact.id == id) {
        contacts.splice(index, 1)
      }
    })
    localStorage.setItem('contacts', JSON.stringify(contacts))
    form.reset()
    UI.closeModal()
    addContactLists.innerHTML = ''
    UI.showContactList()
  }

  static updateContact(item) {
    const contacts = Contact.getContacts()
    contacts.forEach((contact) => {
      if (contact.id == item.id) {
        contact.fullName = item.fullName
        contact.email = item.email
        contact.number = item.number
      }
    })
    localStorage.setItem('contacts', JSON.stringify(contacts))
    addContactLists.innerHTML = ''
    UI.showContactList()
  }
}

// UI class
class UI {
  static showContactList() {
    const contacts = Contact.getContacts()
    contacts.forEach((contact) => UI.addToContactList(contact))
  }

  static addToContactList(contact) {
    const tableRow = document.createElement('tr')
    tableRow.setAttribute('data-id', contact.id)
    tableRow.innerHTML = `
            <td>${contact.fullName}</td>
            
                        <i class="fa-solid fa-ellipsis-vertical" style="color: white;"></i>
        `
    addContactLists.appendChild(tableRow)
  }

  static showModalData(id) {
    const contacts = Contact.getContacts()
    contacts.forEach((contact) => {
      if (contact.id == id) {
        form.full_name.value = contact.fullName
        form.email.value = contact.email
        form.number.value = contact.number
        document.getElementById('modal-title').innerHTML =
          'Change Contact Details'

        document.getElementById('modal-btns').innerHTML = `
                    <button type = "submit" id = "update-btn" data-id = "${id}">Update </button>
                    <button type = "button" id = "delete-btn" data-id = "${id}">Delete </button>
                `
      }
    })
  }

  static showModal() {
    modal.style.display = 'block'
    fullscreenDiv.style.display = 'block'
  }

  static closeModal() {
    modal.style.display = 'none'
    fullscreenDiv.style.display = 'none'
  }
}

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
  // loadJSON() // loading country list from json file
  eventListeners()
  UI.showContactList()
})

// event listeners
const addBtn = document.getElementById('add-btn')
function eventListeners() {
  // show add item modal
  addBtn.addEventListener('click', () => {
    form.reset()
    document.getElementById('modal-title').innerHTML = 'Add Contact'
    UI.showModal()
    document.getElementById('modal-btns').innerHTML = `
            <button type = "submit" id = "save-btn"> Save </button>
        `
  })

  // close add item modal
  closeBtn.addEventListener('click', UI.closeModal)

  // add an contact item
  modalBtns.addEventListener('click', (event) => {
    event.preventDefault()
    if (event.target.id == 'save-btn') {
      let isFormValid = getFormData()
      if (!isFormValid) {
        form.querySelectorAll('input').forEach((input) => {
          setTimeout(() => {
            input.classList.remove('errorMsg')
          }, 1500)
        })
      } else {
        let allItem = Contact.getContacts()
        let lastItemId = allItem.length > 0 ? allItem[allItem.length - 1].id : 0
        lastItemId++

        const contactItem = new Contact(lastItemId, fullName, email, number)
        Contact.addContact(contactItem)
        UI.closeModal()
        UI.addToContactList(contactItem)
        form.reset()
      }
    }
  })

  // table row items
  addContactLists.addEventListener('click', (event) => {
    UI.showModal()
    let trElement
    if (event.target.parentElement.tagName == 'TD') {
      trElement = event.target.parentElement.parentElement
    }

    if (event.target.parentElement.tagName == 'TR') {
      trElement = event.target.parentElement
    }

    let viewID = trElement.dataset.id
    UI.showModalData(viewID)
  })

  // delete an address item
  modalBtns.addEventListener('click', (event) => {
    if (event.target.id == 'delete-btn') {
      Contact.deleteContact(event.target.dataset.id)
    }
  })

  // update an address item
  modalBtns.addEventListener('click', (event) => {
    event.preventDefault()
    if (event.target.id == 'update-btn') {
      let id = event.target.dataset.id
      let isFormValid = getFormData()
      if (!isFormValid) {
        form.querySelectorAll('input').forEach((input) => {
          setTimeout(() => {
            input.classList.remove('errorMsg')
          }, 1500)
        })
      } else {
        const contactItem = new Contact(id, fullName, email, number)
        Contact.updateContact(contactItem)
        UI.closeModal()
        form.reset()
      }
    }
  })
}

// get form data
function getFormData() {
  let inputStatus = []

  if (
    !strRegex.test(form.full_name.value) ||
    form.full_name.value.trim().length == 0
  ) {
    addErrMsg(form.full_name)
    console.log(form.full_name);
    inputStatus[0] = false
  } else {
    fullName = form.full_name.value
    inputStatus[0] = true
  }

  if (!emailRegex.test(form.email.value)) {
    addErrMsg(form.email)
    console.log(form.email)
    inputStatus[1] = false
  } else {
    email = form.email.value
    inputStatus[1] = true
  }

  if (!numberRegex.test(form.number.value)) {
    addErrMsg(form.number)
    console.log(form.number)
    inputStatus[2] = false
  } else {
    number = form.number.value
    inputStatus[2] = true
  }  
  return inputStatus.includes(false) ? false : true

}

function addErrMsg(inputBox) {
  inputBox.classList.add('errorMsg')
}


// search data

// search function
let contactss = []
const contact = JSON.parse(localStorage.getItem('contacts'))
const searchInput = document.querySelector('#search-data')
searchInput.addEventListener('keyup', function () {
  // const value = e.target.value.toLowerCase()
  var search = this.value
  contactss = contact.filter(function (val) {
    if (
      val.fullName.toLowerCase().includes(search.toLowerCase()) ||
      val.number.includes(search)
    ) {
      var newobj = { fullName: val.fullName, phone: val.phone }
      return newobj
    }else{
      console.log("hello");
    }
  })
  showsearchcontact(contactss)
})

function showsearchcontact(searcharray) {
  document.getElementById('cont-book-list').innerHTML = `
  `
  if (searcharray == '') {
    document.getElementById(
      'found'
    ).innerHTML = `<span class="text-danger">Not Found</span>`
  } else {
    document.getElementById('found').innerHTML = ''

    for (var i = 0; i < searcharray.length; i++) {
      document.getElementById('cont-book-list').innerHTML += `
        <div class="contact__item item-animation" onclick="editContact(${
          searcharray[i].id
        })">
        <div class="ogechi-icon" style="margin-bottom: 10px;">
            <h4 class="contact__name" id="contact-name">
                ${searcharray[i].fullName}
            </h4>

         <i class="fa-solid fa-ellipsis-vertical" style="color: white;"></i>
    </div>
      `
    }
  }
}