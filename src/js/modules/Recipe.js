import axios from 'axios';

export default class Recipe {
    constructor(id){
        this.id = id;
    }

    async getRecipe(){
        try {
            const result = await axios (`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = result.data.recipe.title;
            this.author = result.data.recipe.publisher;
            this.img = result.data.recipe.image_url;
            this.url=result.data.recipe.source_url;
            this.ingredients= result.data.recipe.ingredients;
        } catch (error) {
            alert(error);
        }
       
    }

    calcTime (){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings (){
        this.servings = 4;
    }

    parseIngredients(){

        const newIngredients = this.ingredients.map(el =>{
            const unitsLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups' , 'pounds'];
            const unitsShort = ['tbsp','tbsp','oz','oz','tsp','tsp','cup','pound'];
    
        //1. Uniform unit
            let ingredient= el.toLowerCase();
            unitsLong.forEach((unit,i) => ingredient = ingredient.replace(unit, unitsShort[i]));
        //2. remove '()'
        ingredient= ingredient.replace(/ *\([^)]*\) */g, "");


        //3. Parse ingredients count, units and ingredients
        const arrIng= ingredient.split(' ');
        const unitIndex = arrIng.findIndex(el2 => unitsShort.includes(el2));
        let objIng = {};
        if(unitIndex > -1){
            //There is an unit

            const arrCount = arrIng.slice(0, unitIndex);
            let count;
            if(arrCount.length === 1){
                count = eval(arrIng[0]);
               count= Math.round(count * 100) / 100;
            }else {
                count = eval(arrCount.join('+'));
                count= Math.round(count * 100) / 100;
            }
            objIng =  {
                count,
                unit: arrIng[unitIndex],
                ingredient: arrIng.slice(unitIndex + 1).join(' ')
            }

        }else if(parseInt(arrIng[0], 10)){
            //There is not an unit, but there is number
            objIng= {
                count: parseInt(arrIng[0], 10),
                unit: '',
                ingredient: arrIng.slice(1).join(' ')
            }
        }else if(unitIndex === -1){
            //There is not an unit
            objIng= {
                count: 1,
                unit: '',
                ingredient
            }
        }

        return objIng;
        });
        this.ingredients=newIngredients;
    }

    updateServings(type){
        //  Servings
        const newServings= type === 'dec' ? this.servings -1 : this.servings +1;

        // Ingredients
        this.ingredients.forEach(el => {
            el.count *= (newServings / this.servings);
        })

        this.servings=newServings;

    }

}