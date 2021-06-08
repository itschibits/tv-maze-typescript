import axios from "axios"
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");

const BASE_URL : string = "http://api.tvmaze.com/";
const DEFAULT_IMAGE : string = "https://tinyurl.com/tv-missing";

type Show = {
  id: number;
  name: string;
  summary: string;
  image: string;
}
/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<Show[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${BASE_URL}search/shows?q=${term}`);
  console.log("what is response??-->", response.data)
  let results = response.data.map(show  => ({ id: show.show.id, 
                                              name : show.show.name,
                                              summary : show.show.summary,
                                              image : show.show.image?.medium || DEFAULT_IMAGE }))
  console.log("what are the results--->", results)
  return results;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="${show.name}"
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  console.log('term--->>', term)
  const shows = await getShowsByTerm(term) ;

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) { 
  const response = await axios.get(`${BASE_URL}shows/${id}/episodes`);
  console.log("what is response??-->", response.data)
  let episodesRes = response.data.map(episode  => ({ id: episode.id, 
                                              name : episode.name,
                                              season : episode.season,
                                              number : episode.number}))
  console.log("what are the results--->", episodesRes)
  return episodesRes;
  
}

  /** Given list of episodes, create markup for each and to DOM */

function populateEpisodes(episodes) { 

  for (let episode of episodes) {
    const $episode = $(
        `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>`);

    $episodesArea.append($episode);  
  }
  $episodesArea.show();
}

async function searchForEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest('.Show').data('show-id');
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", ".Show-getEpisodes", searchForEpisodesAndDisplay);