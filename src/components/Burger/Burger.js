import React from 'react';

import classes from './Burger.css';
import BurgerIngredient from './BurgerIngredient/BurgerIngredient';
import { withRouter } from 'react-router-dom';

const burger = (props) => {
  
  // transform the state (an object) into an array
  let transformedIngredients = Object.keys(props.ingredients)
    .map(igKey => {
      //first map method creates number of elements specified by the value of each key (ingredient) i.e. cheese: 2 string should have 2 elements
      return [...Array(props.ingredients[igKey])].map((_ , i) => {
        return <BurgerIngredient key={igKey + i} type={igKey} />;
      });
    })
    .reduce((arr, el) =>{
      return arr.concat(el)
    },[]);

    if (transformedIngredients.length === 0){
      transformedIngredients = <p>Please start adding ingredients!</p>;
    }

  return (
    <div className={classes.Burger}>
      <BurgerIngredient type="bread-top" />
      {transformedIngredients}
      <BurgerIngredient type="bread-bottom" />
    </div>
  );
};

export default withRouter(burger);
