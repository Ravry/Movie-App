<script setup>

import { ref, onMounted } from 'vue';

const APIKEY = import.meta.env.VITE_OMDBAPI_KEY;

const searchBarInput = ref("movie")
const currentSearchInput = ref("movie")
const items = ref([])
const searchResponseStatus = ref("")
const searchPageValue = ref(1)
const searchLoadingActive = ref(false)

const selected = ref(false)
const selectedInfos = ref({
  title: "loading ...",
  plot: "loading ...",
  year: "loading ...",
  poster: "none",
  rating: 0,
})

const onButtonClickedOpenLink = (link) => {
  window.location.href = link;
};

const onSelectedItemGoogleClicked = (title) => {
  window.location.href = `https://www.google.com/search?q=${title}`;
}

const onItemInfosContainerCloseButtonClicked = () => {
  selected.value = false;
}

const onMovieItemClicked = async (title, id) => {
  if (selected.value === true)
    return;

  if (title.toLowerCase().includes('an error occured'))
    return;

  selectedInfos.value.title = "loading ...";
  selectedInfos.value.plot = "loading ...";
  selectedInfos.value.year = "-";
  selectedInfos.value.rating = 0;
  selectedInfos.value.poster = "none";
  selected.value = true;
  
  const url = `https://www.omdbapi.com/?i=${id}&apikey=${APIKEY}`
  try {   
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
  
    selectedInfos.value.title = title;
    selectedInfos.value.plot = json["Plot"];
    selectedInfos.value.year = json["Year"];
    selectedInfos.value.rating = Math.round(json["Metascore"] / 10);
    selectedInfos.value.poster = json["Poster"];
  } catch (error) {}
};

const onSearchButtonClicked = () => {
  if (selected.value === true)
    return;

  searchPageValue.value = 1;
  currentSearchInput.value = searchBarInput.value;
  SearchAndDisplay(searchBarInput.value, searchPageValue.value);
};

const onPaginationButtonClicked = (value) => {
  if (selected.value === true)
    return;

  //console.log(value)
  let tmpVal = searchPageValue.value + value;
  if (tmpVal < 1)
    return;
  else 
  {
    searchPageValue.value = tmpVal;
    SearchAndDisplay(currentSearchInput.value, searchPageValue.value)
  }
};

async function SearchAndDisplay(searchTerm, pageValue)
{
  items.value.length = 0;
  const url = `https://www.omdbapi.com/?s=${searchTerm}&type=movie&page=${pageValue}&apikey=${APIKEY}`
  try {
    searchLoadingActive.value = true;   
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    searchResponseStatus.value = json["Response"]
    const moviesList = json["Search"];
    //console.log(json)
    if (searchResponseStatus.value === "True")
    {
      if (moviesList && moviesList.length > 0)
      {
        for (let i = 0; i < moviesList.length; i++)
        {
          items.value.push(moviesList[i]) 
        }
      }
    }
    else 
      items.value.push( { Title: `An error occured (${json["Error"]}) Please try again!` }  )
    
    searchLoadingActive.value = false;
  } catch (error) {
    //console.error(error.message);
  }
}

onMounted(async () => {
  //client communicating with the server to let the server communicate with the api and sending it back to the client (server serves as data-bridge between api and client)
  // try {
  //   const response = await fetch('http://localhost:3000/api?search=inside+out&page=4');
  //   const data = await response.json();
  //   console.log(data);
  // }
  // catch (error)
  // {
  //   console.error(error.message);
  // }
  
  SearchAndDisplay(searchBarInput.value, 1)
})

</script>

<template>
  <div class="header">
    <h1>Cine2mote</h1>
  </div>
  
  <div class="movieSearchBarContainter">
    <input v-model="searchBarInput" placeholder="search for movie ..."/>
    <button @click="onSearchButtonClicked"><i class="fa-solid fa-magnifying-glass"></i></button>
  </div>

  <div class="movieContainer">
    <div class="loadingContainer" v-if="searchLoadingActive === true">
      <div class="loader"></div>
      <p>Loading ...</p>
    </div>

    <div v-for="item in items" class="movieItem" @click="onMovieItemClicked(item.Title, item.imdbID)">
      <img :src="item.Poster"/>
      <p>{{ item.Title }}</p>
    </div>
  </div>

  <div v-if="selected === true" class="movieItemInfosContainer">
    <div class="toolBarTop">
      <button @click="onItemInfosContainerCloseButtonClicked"><i class="fa-regular fa-heart"></i></button>
      <button @click="onItemInfosContainerCloseButtonClicked"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="row">
      <h1> {{ selectedInfos.title }} ({{ selectedInfos.year }}) </h1>
      <img :src="selectedInfos.poster">
    </div>

    <div class="row" v-if="Number.isNaN(selectedInfos.rating) === false">
      <i class="fa-solid fa-star" style="color: white" v-for="i in selectedInfos.rating"></i>
      <i class="fa-solid fa-star" style="color: grey" v-for="j in 10 - selectedInfos.rating"></i>
    </div>

    <p> {{ selectedInfos.plot }}</p>
    <div><i class="fa-brands fa-google" @click="onSelectedItemGoogleClicked(selectedInfos.title)"></i></div>
  </div>

  <div v-if="searchResponseStatus === 'True'" class="paginantionContainer">
    <button @click="onPaginationButtonClicked(-1)"><i class="fa-solid fa-caret-left"></i></button>
    <span>{{ searchPageValue }}</span>
    <button @click="onPaginationButtonClicked(1)"><i class="fa-solid fa-caret-right"></i></button>
  </div>

  <div class="footer">
    <p><i class="fa-solid fa-circle-info"></i>&nbspThis project was created as part of Kevin Chromik's Mini-Hackathon, more information <a href="https://minihackathon.de/">here</a></p>
    <div class="row" id="references">
      <p><i class="fa-brands fa-github" id="linkIcon" @click="onButtonClickedOpenLink('https://github.com/Ravry')"></i></p>
      <p><i class="fa-brands fa-instagram" id="linkIcon"></i></p>
      <p><i class="fa-brands fa-x-twitter" id="linkIcon"></i></p>
      <p><i class="fa-brands fa-youtube" id="linkIcon"></i></p>
    </div>
  </div>
</template>