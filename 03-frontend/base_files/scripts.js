document.addEventListener('DOMContentLoaded', () => {
  const token = checkAuthentication();

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = loginForm.email.value;
      const password = loginForm.password.value;

      try {
        const response = await loginUser(email, password);
        const data = await response.json();
        if (response.ok && data.access_token) {
          document.cookie = `token=${data.access_token}; path=/; SameSite=Lax;`;
          console.log('Cookies after setting:', document.cookie);
          window.location.href = 'index.html';
        } else {
          alert('Login failed: ' + (data.message || response.statusText));
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
      }
    });
  }

  fetch('/03-frontend/mock-api/data/countries.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load countries');
      }
      return response.json();
    })
    .then(countries => {
      const countryFilter = document.getElementById('country-filter');
      if (countryFilter) {
        const allOption = document.createElement('option');
        allOption.value = 'All';
        allOption.text = 'All Countries';
        countryFilter.appendChild(allOption);

        countries.forEach(country => {
          const option = document.createElement('option');
          option.value = country.code;
          option.text = country.name;
          countryFilter.appendChild(option);
        });
      }

      return fetch('http://127.0.0.1:5000/places');
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to load places');
      }
      return response.json();
    })
    .then(data => {
      const addData = document.getElementById('places-list');
      if (addData) {
        data.forEach(place => {
          const newElement = document.createElement('div');
          newElement.className = 'place-card';
          newElement.setAttribute('data-country', place.country_code);
          newElement.innerHTML = `
            <div class='place-image'><img src="holidays.jpg" alt="Place Image" /></div>
            <div><h2>${place.id}</h2></div>
            <div>Price per night: $${place.price_per_night}</div>
            <div>Location: ${place.city_name}, ${place.country_name}</div>
            <div><a href="./place.html?id=${place.id}"><button class="details-button">View Details</button></a></div>
          `;
          addData.appendChild(newElement);
        });

        initializeFiltering();
      }
    })
    .catch(error => console.error('Error:', error));

  const urlParam = new URLSearchParams(window.location.search);
  const placeId = urlParam.get('id');

  if (placeId) {
    fetch(`http://127.0.0.1:5000/places/${placeId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load place details');
        }
        return response.json();
      })
      .then(data => {
        const addName = document.getElementById('place-name');
        if (addName) {
          const name = document.createElement('h1');
          name.innerText = `${data.id}`;
          addName.appendChild(name);
        }

        const addElement = document.getElementById('place-details');
        if (addElement) {
          addElement.innerHTML = `
            <div class='place-image-large'><img src="holidays.jpg" alt="Place Large Image" /></div>
            <div class='det'>
              <div><h4>Host:</h4><p>${data.host_name}</p></div>
              <div><h4>Price per night:</h4><p>$${data.price_per_night}</p></div>
              <div><h4>Location:</h4><p>${data.city_name}, ${data.country_name}</p></div>
              <div><h4>Description:</h4><p>${data.description}</p></div>
              <div><h4>Amenities:</h4><p>${data.amenities.join(', ')}</p></div>
            </div>
          `;
        }

        const rev = document.getElementById('reviews');
        if (rev && data.reviews) {
          data.reviews.forEach(review => {
            const addDiv = document.createElement('div');
            addDiv.classList.add('review-card');
            addDiv.innerHTML = `
              <div><h3>${review.user_name}</h3></div>
              <div><p>${review.comment}</p></div>
              <div><p>Rating: ${review.rating} / 5</p></div>
            `;
            rev.appendChild(addDiv);
          });
        }

        if (token) {
          const addElem = document.getElementById('add-review');
          if (addElem) {
            const newButton = document.createElement('button');
            newButton.innerText = 'Add a Review';
            const lk = document.createElement('a');
            lk.href = `add_review.html?placeId=${placeId}`;
            lk.appendChild(newButton);
            addElem.appendChild(lk);
          }
        }
      })
      .catch(error => console.error('Error fetching place details:', error));
  }

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const reviewText = document.getElementById('review').value;
      const placeId = getPlaceIdFromURL();

      try {
        await submitReview(token, placeId, reviewText);
      } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again.');
      }
    });
  }
});

async function submitReview(token, placeId, reviewText) {
  const response = await fetch(`http://127.0.0.1:5000/places/${placeId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ placeId, reviewText })
  });

  if (response.ok) {
    alert('Review submitted successfully!');
    document.getElementById('review-form').reset();
  } else {
    throw new Error('Failed to submit review');
  }
}

function getPlaceIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('placeId');
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return null;
}

async function fetchPlaces(token) {
  try {
    const response = await fetch('http://127.0.0.1:5000/places', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });
    if (response.ok) {
      const data = await response.json();
      displayPlaces(data);
    } else {
      console.error('Failed to fetch places:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching places:', error);
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (placesList) {
    placesList.innerHTML = '';

    places.forEach(place => {
      const placeElement = document.createElement('div');
      placeElement.className = 'place-card';
      placeElement.setAttribute('data-country', place.country_code);
      placeElement.innerHTML = `
        <div class='place-image'><img src="${place.image_url || 'holidays.jpg'}" alt="Place Image" /></div>
        <div><h2>${place.id}</h2></div>
        <div>Price per night: $${place.price_per_night}</div>
        <div>Location: ${place.city_name}, ${place.country_name}</div>
        <div><a href="./place.html?id=${place.id}"><button class="details-button">View Details</button></a></div>
      `;
      placesList.appendChild(placeElement);
    });
  }
}

function initializeFiltering() {
  const countryFilter = document.getElementById('country-filter');
  if (countryFilter) {
    countryFilter.addEventListener('change', (event) => {
      const selectedCountryCode = event.target.value;

      const placeCards = document.querySelectorAll('#places-list .place-card');

      placeCards.forEach(card => {
        const countryCode = card.getAttribute('data-country');
        if (selectedCountryCode === 'All' || selectedCountryCode === countryCode) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }
}

function checkAuthentication() {
  const token = getCookie('token');
  
  const isLoginPage = window.location.pathname.includes('login.html');
  
  if (!isLoginPage) {
    const loginLink = document.getElementById('login-link');
    if (loginLink) {
      loginLink.style.display = token ? 'none' : 'block';
    }
  }

  if (token) {
    if (isLoginPage) {
      window.location.href = 'index.html';
    } else {
      fetchPlaces(token);
    }
  } else {
    console.log('No token found. User is not authenticated.');
  }
}

async function loginUser(email, password) {
  try {
    const response = await fetch('http://127.0.0.1:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
