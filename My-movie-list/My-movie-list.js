const BASE_URL = "https://movie-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/movies/"
const POSTER_URL = BASE_URL + "/posters/"

const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const modeToggle = document.querySelector("#mode-toggle")
const paginator = document.querySelector("#paginator")
const MOVIES_PER_PAGE = 12
let MODE = "card"
let CURRENT_PAGE = 1

////////////////// Function Group Starts Here//////////////////

// render movie list on data panel
function renderMovieList(data) {
  let rawHTML = ""

  switch (MODE) {
    case "card":
      data.forEach((item) => {
        // title, image
        rawHTML += `
      <div class="col-sm-3 mb-3">
        <div class="card">
          <img
            src="${POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer text-muted">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${
              item.id
            }">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${
              item.id
            }">+</button>
          </div>
        </div>
      </div>
    `
      })
      break

    case "list":
      data.forEach((item) => {
        // title, image
        rawHTML += `
      <div class="col-12 py-3 border-top">
        <div class="row">
          <div class="col-12 col-sm-8">
            <h5 class="card-title">${item.title}</h5>
          </div>
          
          <div class="col-12 col-sm-4">
            <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
              data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `
      })
      break
  }
  dataPanel.innerHTML = rawHTML
}

// render list item within paginator
function renderPaginator() {
  const amount = filteredMovies.length ? filteredMovies.length : movies.length
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ""

  for (let page = 1; page <= numberOfPages; page++) {
    if (page === CURRENT_PAGE) {
      rawHTML += `
      <li class="page-item active"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    } else {
      rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    }
  }
  paginator.innerHTML = rawHTML
}

// get movie data array by page argument
function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  const data = filteredMovies.length ? filteredMovies : movies
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// render show movie modal
function showMovieModal(id) {
  // get elements
  const modalTitle = document.querySelector("#movie-modal-title")
  const modalImage = document.querySelector("#movie-modal-image")
  const modalDate = document.querySelector("#movie-modal-date")
  const modalDescription = document.querySelector("#movie-modal-description")
  // send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    // insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = "Release date: " + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">
    `
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || []
  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！")
  }
  list.push(movie)
  localStorage.setItem("favoriteMovies", JSON.stringify(list))
}
////////////////// Function Group Ends Here//////////////////

////////////////// EventListener Group Starts Here//////////////////

// listen to data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

// listen to search form
searchForm.addEventListener("input", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase()
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (!filteredMovies.length) {
    CURRENT_PAGE = 1
    renderPaginator()
    renderMovieList(getMoviesByPage(1))
    return alert(`您輸入的關鍵字${keyword} 沒有符合條件的電影`)
  }
  renderPaginator()
  renderMovieList(getMoviesByPage(1))
});

// switch between "card" and "list" display mode
modeToggle.addEventListener("click", function onModeToggleClicked(event) {
  if (event.target.tagName === "A" || event.target.tagName === "I") {
    if (event.target.dataset.mode !== MODE) {
      const modeCardButton = document.querySelector("#mode-card-button")
      const modeListButton = document.querySelector("#mode-list-button")
      modeCardButton.classList.toggle("text-secondary")
      modeListButton.classList.toggle("text-secondary")
    }

    MODE = event.target.dataset.mode
    renderMovieList(getMoviesByPage(CURRENT_PAGE))
  }
})

// control which movie data should be rendered
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return
  CURRENT_PAGE = Number(event.target.dataset.page)
  renderPaginator()
  renderMovieList(getMoviesByPage(CURRENT_PAGE))
})

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator()
    renderMovieList(getMoviesByPage(1))
  })
  .catch((error) => console.log(error))
