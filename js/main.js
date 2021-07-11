function onDragStart(event) {
  event
    .dataTransfer
    .setData('text/plain', event.target.id);
}

function onDragOver(event) {
  event.preventDefault();
}

function onDrop(event) {
  const id = event
    .dataTransfer
    .getData('text');
  const draggableElement = document.getElementById(id);
  const dropzone = event.target;
  dropzone.appendChild(draggableElement);
  event
    .dataTransfer
    .clearData();
}


//////////////////
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

// El evento DOMContentLoaded es disparado cuando el documento HTML ha sido completamente cargado y parseado
document.addEventListener('DOMContentLoaded', () => {
  fetchData();
  if(localStorage.getItem('carrito')){
    carrito = JSON.parse(localStorage.getItem('carrito'));
    pintarCarrito();
  }
});
cards.addEventListener('click', e => {
  addCarrito(e);
})
items.addEventListener('click', e =>{
  btnAccion(e);
})

// Traer productos
const fetchData = async () => {
  const res = await fetch('api.json');
  const data = await res.json()
  pintarCards(data)
}

const pintarCards = data => {
  data.forEach(producto => {
    templateCard.querySelector('h5').textContent = producto.title;
    templateCard.querySelector('p').textContent = producto.precio;
    templateCard.querySelector('img').setAttribute("src",producto.thumbnailUrl);
    templateCard.querySelector('.btn-dark').dataset.id = producto.id;
    const clone = templateCard.cloneNode(true);
    fragment.appendChild(clone);
  })
  cards.appendChild(fragment);
}

const addCarrito = (e) => {
  if (e.target.classList.contains('btn-dark')) {
    setCarrito(e.target.parentElement);
  }
  e.stopPropagation();
}

const setCarrito = objeto => {
  const producto = {
    id : objeto.querySelector('.btn-dark').dataset.id,
    title : objeto.querySelector('h5').textContent,
    precio : objeto.querySelector('p').textContent,
    cantidad : 1
  }
  if (carrito.hasOwnProperty(producto.id)){
    producto.cantidad = carrito[producto.id].cantidad + 1;
  }
  carrito[producto.id] = {...producto};
  pintarCarrito();
}

const pintarCarrito = () => {
  items.innerHTML = '';
  Object.values(carrito).forEach(producto =>{
    templateCarrito.querySelector('th').textContent = producto.id;
    templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
    templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
    templateCarrito.querySelector('.btn-info').dataset.id = producto.id
    templateCarrito.querySelector('.btn-danger').dataset.id = producto.id 
    templateCarrito.querySelector('span').textContent = producto.cantidad * producto.precio;
    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  })
  items.appendChild(fragment);
  pintarFooter();
  localStorage.setItem('carrito',JSON.stringify(carrito));
}

const pintarFooter = () => {
  footer.innerHTML = '';
  if (Object.keys(carrito).length === 0){
    footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`;
    return;
  }
  const nCantidad = Object.values(carrito).reduce((acc, {cantidad})=> acc + cantidad,0);
  const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + cantidad * precio, 0);

  templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
  templateFooter.querySelector('span').textContent = nPrecio;

  const clone = templateFooter.cloneNode(true);
  fragment.appendChild(clone);
  footer.appendChild(fragment);

  const boton = document.querySelector('#vaciar-carrito')
  boton.addEventListener('click', () => {
      carrito = {}
      pintarCarrito();
  })
}

const btnAccion = e => {
  // Acción de aumentar
  if(e.target.classList.contains('btn-info')){
    const producto = carrito[e.target.dataset.id]
    producto.cantidad = carrito[e.target.dataset.id].cantidad + 1;
    carrito[e.target.dataset.id] = {...producto};
    pintarCarrito();
  }
  // Acción de disminuir
  if(e.target.classList.contains('btn-danger')){
    const producto = carrito[e.target.dataset.id]
    producto.cantidad = carrito[e.target.dataset.id].cantidad - 1;
    if (producto.cantidad === 0){
      delete carrito[e.target.dataset.id];
    }
  pintarCarrito();
  }
  e.stopPropagation();
}