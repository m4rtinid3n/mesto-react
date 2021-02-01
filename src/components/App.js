import React, {useEffect, useState} from 'react';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import Preloader from './Preloader';
import { EditProfilePopup } from './EditProfilePopup';
import { EditAvatarPopup } from './EditAvatarPopup';
import ImagePopup from './ImagePopup';
import api from '../utils/api.js';
import {transformCard} from "../utils/transformCard";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import { InitialCards } from "../contexts/initialCards";
import { AddPlacePopup } from "./AddPlacePopup";

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleEditAvatarClick = () => {
    setIsEditAvatarPopupOpen(!isEditAvatarPopupOpen);
  }

  const handleEditProfileClick = () => {
    setIsEditProfilePopupOpen(!isEditProfilePopupOpen);
  }

  const handleAddPlaceClick = () => {
    setIsAddPlacePopupOpen(!isAddPlacePopupOpen);
  }


  const closeAllPopups = () => {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setSelectedCard(null);
  }

  useEffect(() => {
    setIsLoading(true);
    api.getAppInfo()
      .then(data => {
        const [initialCards, currentUserData ] = data;
        setCurrentUser(currentUserData);
        const items = initialCards.map( card => transformCard(card));
        setCards(items);
      })
      .catch(err => console.log(err))
      .finally(() => setIsLoading(false));
  }, [])

  const handleUpdateUser = (data) => {
    api.editUserInfo(data)
      .then(data => {
        setCurrentUser(data);
        closeAllPopups();
      })
      .catch(err => console.log(err))
  }

  const handleUpdateAvatar = (avatar) => {
    api.changeUserPicture(avatar)
      .then( avatar => {
        setCurrentUser(avatar);
        closeAllPopups()
      })
      .catch(err => console.log(err))
  }

  const handleCardLike = (card) => {
    const isLiked = card.likes.some(i => i._id === currentUser._id);

    api.changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {

      const newCards = cards.map(c => c._id === card._id ? newCard : c);

      setCards(newCards)
    })
      .catch(err => console.log(err))
  }

  const handleAddPlaceSubmit = (newCard) => {
    console.log(newCard)
    api.createCard(newCard)
      .then(newCard => {
        const newItem = transformCard(newCard);
        setCards([newItem, ...cards]);
        closeAllPopups();
      })
      .catch(err => console.log(err))
  }

  const handleCardDelete = (card) => {
    api.deleteCard(card._id)
      .then(() => {
        const newCards = cards.filter(c => c._id !== card._id)

        setCards(newCards)
      })
      .catch(err => console.log(err))
  }

  return (
    <InitialCards.Provider value={cards}>
      <CurrentUserContext.Provider value={currentUser}>
        <div className="page">
          <Header />
          {isLoading ?
            <Preloader /> :
            <Main
            onEditAvatar={handleEditAvatarClick}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onCardClick={setSelectedCard}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
          />}
          <Footer />

          <EditProfilePopup
            isOpen={isEditProfilePopupOpen}
            onClose={closeAllPopups}
            onUpdateUser={handleUpdateUser}
          />

          <EditAvatarPopup
            isOpen={isEditAvatarPopupOpen}
            onClose={closeAllPopups}
            onUpdateAvatar={handleUpdateAvatar}
          />

          <AddPlacePopup
            isOpen={isAddPlacePopupOpen}
            onClose={closeAllPopups}
            onAddPlace={handleAddPlaceSubmit}
          />
          <PopupWithForm
            name="card-delete"
            title="Вы уверены?"
            onClose={closeAllPopups}
          >
            <label className="popup__field">
              <input type="url" className="popup__input popup__input_type_link" name="link"  placeholder="Ссылка на картинку" required />
              <span className="popup__error"></span>
            </label>
          </PopupWithForm>

          <ImagePopup
            card={selectedCard}
            onClose={closeAllPopups}
          />

        </div>
      </CurrentUserContext.Provider>
    </InitialCards.Provider>
  );
}
export default App;
