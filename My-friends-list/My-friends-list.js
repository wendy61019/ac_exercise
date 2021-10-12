const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const friends = [];
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");

function renderFriendsList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    // title, image, id
    rawHTML += `
  <div class="col-sm-2">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top rounded" src="${item.avatar}" alt="Friend Avatar">
            <div class="card-body">
              <h5 class="card-title">${item.name} ${item.surname}</h5>
            </div>
            <div class="card-footer text-right">
              <button class="btn btn-primary btn-show-friend" data-toggle="modal" data-target="#friend-modal" data-id="${item.id}">More</button>
            </div>
          </div>
        </div>
      </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

function showFriendModal(id) {
  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    console.log(response.data);
    const friendAvatar = document.querySelector(".image-avatar");
    const friendTitle = document.querySelector("#friend-modal-title");
    const friendGender = document.querySelector(".friend-gender");
    const friendAge = document.querySelector(".friend-age");
    const friendBirthday = document.querySelector(".friend-birthday");
    const friendRegion = document.querySelector(".friend-region");
    const friendEmail = document.querySelector(".friend-email");
    // insert data into modal ui
    const data = response.data;
    friendTitle.innerText = `${data.name} ${data.surname}`;
    friendAvatar.src = data.avatar;
    friendGender.innerText = `gender: ${data.gender}`;
    friendAge.innerText = `age: ${data.age}`;
    friendBirthday.innerText = `birthday: ${data.birthday}`;
    friendRegion.innerText = `region: ${data.region}`;
    friendEmail.href = data.email;
    friendEmail.innerText = `${data.email}`;
  });
}
// listen to search form
searchForm.addEventListener("submit", function searchKeyword(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();
  let filterFriends = [];
  if (!keyword.length) {
    swal("請重新輸入關鍵字");
  }
  filterFriends = friends.filter(
    (friend) =>
      friend.name.trim().toLowerCase().includes(keyword) ||
      friend.surname.trim().toLowerCase().includes(keyword)
  );
  if (filterFriends.length === 0) {
    swal("您輸入的關鍵字查無結果，請重新輸入關鍵字");
  }
  renderFriendsList(filterFriends);
});

// listen to data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-friend")) {
    const eventId = Number(event.target.dataset.item);
    showFriendModal(eventId);
  }
});

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    //Array(200)
    friends.push(...response.data.results);
    renderFriendsList(friends);
  })
  .catch((error) => console.log(error));
