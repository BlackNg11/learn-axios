import Search from './modules/Search';
import Recipe from './modules/Recipe';
import List from './modules/List';
import Like from './modules/Like';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likeView from './views/likeView';
import { elements,renderLoader,clearLoader } from './views/base';

/* Global state of the app
-Search Object
-Current recipe object
-Shopping list object
-Like recipe
*/
const state = {};



//
// SEARCH CONTROLLER
const controlSearch = async () => {
	//1) Get query from the view
	const query = searchView.getInput(); //TODO
	
	
	if(query) {
		// 2) New Search Object and add to state
		state.search = new Search(query); 
		
		// 3) Prepare UI for result
		searchView.clearInput();
		searchView.clearResult();
		renderLoader(elements.searchRes);
		
		try{
			// 4) Search for recipes
			await state.search.getResults(); 
		
			// 5) Render result on UI
			clearLoader();
			searchView.renderResult(state.search.result);
		}catch(err){
			alert(err);
		}
		
	}
}


elements.searchForm.addEventListener('submit', e => {
	e.preventDefault();
	controlSearch();
});

elements.searchResPage.addEventListener('click', e => {
	
	//Method closest di tim phan tu gan nhat voi no neu ko co thi tra ve null
	const button = e.target.closest('.btn-inline');
	if (button) {
		const gotoPage = parseInt(button.dataset.goto, 10);
		
		searchView.clearResult();
		searchView.renderResult(state.search.result, gotoPage);
	}
	
});

//
// RECIPE CONTROLLER
const controlRecipe = async () => {
	
	//Get ID from URL
	const id = window.location.hash.replace('#','');
	//console.log(id);
	
	//Danh dau phan tu dc chon de coi
	if(state.search) searchView.hightlightSelected(id); 
	
	if(id) {
		
		//Chuan bi man hinh load UI truoc khi thay doi
		recipeView.clearRecipe();
		renderLoader(elements.recipe);
		
		
		//Tao recipe object
		state.recipe = new Recipe(id);
		
		
		try{
			//Lay du lieu tu recipe va chuyen doi du lieu tu cong thuc
			await state.recipe.getRecipe();
			//console.log(state.recipe.ingredients);
			state.recipe.parseIngredients();

			//Tinh toan serving va time
			state.recipe.calcTime();
			state.recipe.calcServing();

			//Render recipe
			clearLoader();
			recipeView.renderRecipe(state.recipe, state.likes.isLike(id));
			
		}catch(err){
			console.log(err);
		}
		
	}
	
	
}


//
// LIST CONTROLLER
 const  controlList = () => {
	 //Creat new list if there none yet
	 if(!state.list) state.list = new List();
	 
	 //ADD tung cong thuc vao list tren UI
	 state.recipe.ingredients.forEach(el => {
		
		const item = state.list.addItem(el.count,el.unit,el.ingredients);
	
		listView.renderItem(item);
	 });
 }
 
 elements.shopping.addEventListener('click', e => {
	 const id = e.target.closest('.shopping__item').dataset.itemid;
	 
	 //xu li delete
	 if (e.target.matches('.shopping__delete, .shopping__delete *')) {
		 //Delete from state
		 state.list.deleteItem(id);
		 
		 //Delete from UI
		 listView.deleteItem(id);
		 
	 }else if(e.target.matches('.shopping__count-value' )){
		 const val = parseFloat(e.target.value,10);
		 state.list.updateCount(id, val);
	 }
	 
 });

//
// LIKE CONTROLLER

const controlLike = () => {
	if(!state.likes) state.likes = new Like();
	const currentId = state.recipe.id;
	
	//User not yet Like current recipe
	if(!state.likes.isLike(currentId)) {
		
		//Add like to the state
		const newLike = state.likes.addLike(
			currentId,
			state.recipe.title,
			state.recipe.author,
			state.recipe.img
		);
		
		//Toggle the like to the button  
		likeView.toggleLikeBtn(true);
		
		//Add like to the UI list
		likeView.renderLike(newLike);
		
		
	//User Like current recipe
	} else {
		//Remove like from the state
		state.likes.deleteLike(currentId);
		
		//Toggle the like to the button  
		likeView.toggleLikeBtn(false);
		
		//Remove like from the UI list
		likeView.deleteLike(currentId);
		
	}
	likeView.toggleLikeMenu(state.likes.getNumberLikes());
};
 


//Restore like recipe on page load
window.addEventListener('load', () => {
	state.likes = new Like();
	
	//Khoi phuc like khi page load
	state.likes.readStorage();
	
	// Toggle like menu button
	likeView.toggleLikeMenu(state.likes.getNumberLikes());
	
	// Render like
	state.likes.likes.forEach(like => likeView.renderLike(like));
	
});










['hashchange','load'].forEach(event => window.addEventListener(event,controlRecipe));

// Xu li nut bam trong cong thuc
elements.recipe.addEventListener('click', e => {
	
	if(e.target.matches('.btn-decrease, .btn-decrease *')) {
		
		// Decrease button is click
		if(state.recipe.servings > 1) {
			state.recipe.updateServing('dec');
			
			recipeView.updateServingsAndIngredients(state.recipe);
		}
	
	}else if(e.target.matches('.btn-increase, .btn-increase *')) {
		
		// Increase button is click
		state.recipe.updateServing('inc');
		
		recipeView.updateServingsAndIngredients(state.recipe);
		
	}else if(e.target.matches( '.recipe__btn--add, .recipe__btn--add *')) {
		
		//Them vao cong thuc trong shopping list
		controlList();
	}else if(e.target.matches('.recipe__love, .recipe__love *')) {
		// Like controler
		controlLike();
		
	}
	//console.log(state.recipe.servings);
	//console.log(state.recipe);
});





















