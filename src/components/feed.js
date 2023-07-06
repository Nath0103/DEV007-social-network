/** @format */

import {
  crearPost,
  obtenerTodosLosPost,
  borrarPost,
  currentUserInfo,
  editarPost,
  likesPost,
  removeLike,
  usuarioLogeado,
  logOut,
} from '../lib/index.js';

// CONTENEDOR DE PUBLICACIONES:::::::::::::::::::::::::::::::::::::::::::::
export const feed = (onNavigate) => {
  const homeDiv = document.createElement('div');
  homeDiv.classList.add('fondo-feed');
  homeDiv.classList.add('colorLetras');
  homeDiv.innerHTML += `
    <div class="form-container feed-container">
    <div class="barra-morada-feed">
      <h2 class="labgram-text-feed">LABGRAM </h2>
      <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-logout-2" width="60" height="60" viewBox="0 0 24 24" stroke-width="2" stroke="rgba(197, 116, 193, 1)" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M10 8v-2a2 2 0 0 1 2 -2h7a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-7a2 2 0 0 1 -2 -2v-2" />
  <path d="M15 12h-12l3 -3" />
  <path d="M6 15l-3 -3" />
</svg>
    </div>
    <div class="perfil-usuario">
      <h1 class="usuario-saludo">¡Hola!<br>${usuarioLogeado()}</h1>
      <h2 class="bienvenida-feed">Bienvenida a tu espacio para compartir ejercicios del GYM</h2>
      <br><br>
    </div>
      <div class="new-post__container ">
      <textarea class="new-post__container__textarea texto-publicacion" placeholder="Escribe algo aquí"></textarea>
      <button class="new-post__container__button btn-compartir">Compartir</button>
      </div>
      <section class="posts__container">
      </section>
    </div>
  `;

  // BOTON REGRESAR AL LOGIN::::::::::::::::::::::::::::::::::::::::::::::::
  const buttonLogin = document.createElement('button');
  buttonLogin.classList = 'home-div__button';
  buttonLogin.textContent = 'Regresar al Login';
  buttonLogin.addEventListener('click', () => onNavigate('/login'));

  // BOTON CERRAR SESION
  const buttonOut = document.createElement('button');
  buttonOut.classList = 'home-div__button';
  buttonOut.textContent = 'Cerrar Sesión';
  buttonOut.addEventListener('click', () => {
    logOut().then(() => onNavigate('/'));
  });

  // BOTON PUBLICAR POST::::::::::::::::::::::::::::::::::::::::::::::::::::
  const buttonPost = homeDiv.querySelector('.new-post__container__button');

  const postDivs = document.createElement('div');

  // PUBLICAR POST::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  buttonPost.addEventListener('click', async (e) => {
    e.preventDefault();
    const contenidoDelTextarea = homeDiv.querySelector(
      '.new-post__container__textarea',
      '.firma',
    );
    if (contenidoDelTextarea.value === '') {
      // alert('completa todos los campos');
      return;
    }
    try {
      await crearPost(contenidoDelTextarea.value, currentUserInfo().email);
      contenidoDelTextarea.value = '';
      // console.log(currentUserInfo());
      // console.log(usuarioLogeado());//LO MUESTRA EN CONSOLA MAS NO EN EL POST
      // alert('Publicación subida');
    } catch (error) {
      // console.log(error.code);
    }
    // console.log(contenidoDelTextarea.value);
  });

  // FUNCION BORRAR POST:::::::::::::::::::::::::::::::::::::::::::::::::::::
  function borrar() {
    const botonesBorrar = postDivs.querySelectorAll('.btn-borrar');
    botonesBorrar.forEach((btnBorrar) => {
      btnBorrar.addEventListener('click', () => {
        const idPost = btnBorrar.id;
        const idPostUser = btnBorrar.dataset.user;
        if (currentUserInfo().email === idPostUser) {
          borrarPost(idPost);
        } else {
          // alert('No puedes eliminar, este post no es tuyo');
        }
        // console.log(idPost);
        // console.log(currentUserInfo().email);
      });
    });
  }
  // FUNCION EDITAR POST::::::::::::::::::::::::::::::::::::::::::::::::::::
  function editar() {
    const botonesEditar = postDivs.querySelectorAll('.btn-editar');
    botonesEditar.forEach((btnEditar) => {
      btnEditar.addEventListener('click', () => {
        const postId = btnEditar.id;
        const userPostId = btnEditar.dataset.user;
        if (currentUserInfo().email === userPostId) {
          const modalContainer = document.createElement('div');
          modalContainer.classList.add('.modal-container');
          const modalContent = `
            <div class="modal">
              <h1>Edita tu post</h1>
              <div contenteditable="true" id="edit" class="edit"></div>
              <button class="close">Cerrar</button>
              <button class="saveChanges">Actualizar</button>
            </div>
          `;
          modalContainer.innerHTML = modalContent;
          document.body.appendChild(modalContainer);

          const closeBtn = modalContainer.querySelector('.close');
          const saveBtn = modalContainer.querySelector('.saveChanges');

          closeBtn.addEventListener('click', () => {
            modalContainer.remove();
          });

          saveBtn.addEventListener('click', () => {
            const editPostTextarea = modalContainer.querySelector('#edit');
            const editPostContent = editPostTextarea.innerText;

            if (editPostContent !== '') {
              const updatePosts = { contenido: editPostContent };
              editarPost(postId, updatePosts);
              modalContainer.remove();
            }
          });
        } else {
          // alert('No puedes editar, este post no es tuyo');
        }
      });
    });
  }

  // FUNCION DAR LIKE A LOS POSTS :::::::::::::::::::::::::::::::::::::::
  function darLike(querySnapshot) {
    const botonesLikes = postDivs.querySelectorAll('.btn-like');
    botonesLikes.forEach((btnLikes) => {
      btnLikes.addEventListener('click', async () => {
        const idPost = btnLikes.id;
        const idUser = currentUserInfo().email;
        try {
          const postSnapshot = querySnapshot.docs.find(
            (doc) => doc.id === idPost,
          );
          const post = postSnapshot.data();
          if (post.likes && post.likes.includes(idUser)) {
            // El usuario puede remover el like
            await removeLike(idPost, idUser);
            // console.log('Se removio el like');
          } else {
            // Agregar el like
            await likesPost(idPost, idUser);
            // console.log('Like agregado');
          }
        } catch (error) {
          // console.log(error);
        }
      });
    });
  }

  // VER TODOS LOS POSTSSSS (ACUMULADOS):::::::::::::::::::::::::::::::::::::
  obtenerTodosLosPost((querySnapshot) => {
    postDivs.innerHTML = '';
    querySnapshot.forEach((doc) => {
      const idUser = doc.data().usuario;
      const idPost = doc.id;
      const fecha = doc.data().date.toDate().toLocaleString();
      // console.log(idPost);
      // console.log(currentUserInfo().email);
      // console.log(usuarioLogeado());
      postDivs.innerHTML += `
        <div class="posts__post">
          <p>${doc.data().contenido}</p>
          <p>${doc.data().usuario}</p>
          <p>${fecha}</p>
          <h3 class="usuario-post"></h3>
          <button id=${idPost} data-user=${idUser} class="btn-borrar ">Borrar</button> 
          <button id=${idPost} data-user=${idUser} class="btn-editar ">Editar</button>
          <button id=${idPost} class="btn-like">Like</button>
          <span class="likes-count" data-post=${idPost}>${doc.data().likes.length}</span>
        </div>
      `;
    });
    editar();
    borrar();// ESTO MUESTRA EL BOTON BORRAR CON LA FUNCION BORRAR OK::::::
    darLike(querySnapshot);
  });

  homeDiv.querySelector('.posts__container').appendChild(postDivs);
  homeDiv.appendChild(buttonLogin);
  homeDiv.appendChild(buttonOut);
  return homeDiv;
};
