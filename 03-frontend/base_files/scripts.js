document.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = true;

  fetch('http://127.0.0.1:5000/places')
    .then(async (response) => {
      const data = await response.json();      
      
      const addData = document.getElementById('places-list').querySelector('ul');
      
      data.forEach((place) => {
        const newElement = document.createElement('li')
        newElement.innerHTML = `
        <div class='place-card'>
          <div><img src="" alt="" /></div>
          <div><h2>${place.id}</h2></div>
          <div>Price per night: $${place.price_per_night}</div>
          <div>Location: ${place.city_name}, ${place.country_name}</div>
          <div><a href="./place.html?id=${place.id}"><button class="details-button">View Details</button></a></div>
        </div>
        `
      addData.appendChild(newElement);
      })
      .catch((error) => {error.message});
    });

    const urlParam = new URLSearchParams(window.location.search);
    const placeId = urlParam.get('id');
  
      if (placeId) {
        fetch(`http://127.0.0.1:5000/places/${placeId}`)
          .then(async(response) => {
            const data = await response.json();
            console.log(data);

            const addName = document.getElementById('place-name');
            const name = document.createElement('h1');
            name.innerText = `${data.id}`;
            addName.appendChild(name);

            const addElement = document.getElementById('place-details');
            const newElement = document.createElement('div');
            newElement.classList.add('place-info');
            addElement.innerHTML = `
            <div class='place-image-large'><img src="" alt="" /></div>
            <div><h4>Host: </h4><p> ${data.host_name}</p></div>
            <div><h4>Price per night: </h4><p> $${data.price_per_night}</p></div>
            <div><h4>Location: </h4><p> ${data.city_name}, ${data.country_name}</p></div>
            <div><h4>Description: </h4><p> ${data.description}</p></div>
            <div><h4>Amenities: </h4><p> ${data.amenities.join(', ')}</p></div>
            `
            addElement.appendChild(newElement);
  
            const rev = document.getElementById('reviews');        
            
            data.reviews.forEach((review) => {
            const addDiv = document.createElement('div');
            addDiv.classList.add('review-card');
            addDiv.innerHTML = `
            <div><h3>${review.user_name}</div>
            <div><p>${review.comment}</p></div>
            <div><p>Rating: ${review.rating} /5</p></div>
            `
            rev.appendChild(addDiv);
  
          });
  
          if (isLoggedIn) {
  
            const addElem = document.getElementById('add-review');
            const newButton = document.createElement('button');
            newButton.innerText = 'Add a Review'
            const lk = document.createElement('a');
            lk.href = `add_review.html?placeId=${placeId}`;
            lk.appendChild(newButton);
            addElem.appendChild(lk);
            
          }
  
          })
        
          .catch((error) => {error.message});
  
      }

});



