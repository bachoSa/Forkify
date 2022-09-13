// Global app controller
import { elements , renderLoader, clearLoader } from './views/base';
import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';


/*
- Search object
- current recipe object
- Shopping list object
- Liked recipes list
*/
const state = {};
//search controller

const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput();

    if(query){
        // 2) New search object and add to state   
        state.search=new Search(query);

        // 3) Prepare UI for results
        searchView.clearinput();
        searchView.clearResults();
        renderLoader(elements.searchResList);
        
        // 4) Search for recipes
        await state.search.getResults();
        clearLoader();
        // 5) Render results on UI

        searchView.renderRecipes(state.search.result);
    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

elements.searchResPages.addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-inline');
    if(btn){
        const goToPage = +btn.dataset.goto;
        searchView.clearResults();
        searchView.renderRecipes(state.search.result, goToPage);
    }
});



//Recipe controller


const controlRecipe = async () =>{
    //get ID from url
    const id = window.location.hash.replace('#','');



    if(id){
    // Prepare UI
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected search items
    if(state.search)searchView.highlightSelected(id);

    //create new recipe object
    state.recipe= new Recipe(id);
   

    try {
         //get recipe data
        await state.recipe.getRecipe();
        clearLoader();
        state.recipe.parseIngredients();

        //Calculate servings & time
        state.recipe.calcTime();
        state.recipe.calcServings();


        recipeView.renderRecipe(state.recipe);
    } catch (error) {
        alert('Error');
    }
    }
   
}
/*
List controller
*/
const controllerList = ()=>{
    //Create new list
    state.list= new List();

    //Add each ingredient
    state.recipe.ingredients.forEach(el => {
        const otem = state.list.addItems(el.count,el.unit, el.ingredient);
        listView.renderItems(el);
    });

}

['hashchange', 'load'].forEach(event =>window.addEventListener(event, controlRecipe));


// Handling recipe buttons on click

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        ///decrease count
        if(state.recipe.servings > 1)
       state.recipe.updateServings('dec');
       recipeView.updateServingsIngredients(state.recipe);

    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        //increase count
        if(state.recipe.servings < 20)
       state.recipe.updateServings('inc');
       recipeView.updateServingsIngredients(state.recipe);
    }else if(e.target.matches('.recipe__btn__add, .recipe__btn__add *')){
        // Shopping list
        controllerList();
    }
    
});
