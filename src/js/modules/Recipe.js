import axios from 'axios';
import { key, proxy } from '../config';

export default class Recipe {
	constructor(id) {
		this.id = id;
	}
	
	async getRecipe() {
		try{
			const res = await axios(`${proxy}https://www.food2fork.com/api/get?key=${key}&rId=${this.id}`);
			this.title = res.data.recipe.title;
			this.author = res.data.recipe.publisher;
			this.img =res.data.recipe.image_url;
			this.url =res.data.recipe.source_url;
			this.ingredients =res.data.recipe.ingredients;
			
			
		}catch(err) {
			console.log(err);
		}
	}
	
	calcTime() {
		//Uoc dinh nau 3 thanh phan can 15p thuc hien	
		const numIng = this.ingredients.length;
		const periods = Math.ceil(numIng / 3);
		this.time = periods * 15;
	}
	
	calcServing() {
		this.servings = 4;	
	}
	
	parseIngredients() {
		const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups', 'pounds'];
		const unitsShort = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup', 'pound'];
		const unit = [...unitsShort, 'kg', 'g']
		
		
		const newIngredients = this.ingredients.map(el => {
			// 1) Thong nhat don vi tinh
			let ingredients = el.toLowerCase();
			unitsLong.forEach((unit, i) => {
				ingredients = ingredients.replace(unit,unitsShort[i]);
			});
			
			// 2) Loai bo chu thich cua tung array
			ingredients = ingredients.replace(/ *\([^)]*\) */g, ' ');
			
			// 3) Parse Ingredients into count , unit and Ingredients
			const arrIng = ingredients.split(' ');
			const unitIndex = arrIng.findIndex(el2 => unit.includes(el2));
			let objIng;
			
			if(unitIndex > -1) {
				// No la don vi
				const arrCount = arrIng.slice(0, unitIndex);
				let count
				if (arrCount.length === 1) {
					count = eval(arrIng[0].replace('-','+'));
				} else {
					count = eval(arrIng.slice(0, unitIndex).join('+'));
				}
				
				objIng = {
					count,
					unit: arrIng[unitIndex],
					ingredients: arrIng.slice(unitIndex + 1).join(' ')
				};
				
			}else if (parseInt(arrIng[0],10)) {
				//Khong co don vi trong chuoi,nhung chu dau la number
				objIng = {
					count: parseInt(arrIng[0],10),
					unit: '',
					ingredients: arrIng.slice(1).join(' ')
				};
				
			}else if (unitIndex === -1) {
				//Khong co don vi va ko co number trong so dau	
				objIng = {
					count: 1,
					unit:'',
					ingredients
				};
			}
			
			return objIng;
		});
		
		this.ingredients = newIngredients;
	}
	
	updateServing(type) {
		//Serving
		const newServing = type === 'dec' ? this.servings - 1 : this.servings + 1;
		
		//Ingredients 
		this.ingredients.forEach(ing => {
			ing.count *= (newServing / this.servings);
		});
		
		
		this.servings = newServing;
		
	}
	

	
	
}