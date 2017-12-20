import React, {Component} from 'react';

import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

//global const should be all caps
const INGREDIENT_PRICES = {
  salad: 0.5,
  cheese: 0.4,
  meat: 1.3,
  bacon: 0.7
};

class BurgerBuilder extends Component {
  // old way?
  // constructor(props) {
  //   super(props);
  //   this.state = {...}
  // }
  state = {
    ingredients: null,
    totalPrice: 4,
    purchaseable: false,
    purchasing: false,
    loading: false,
    error: false
  }

  componentDidMount () {
    axios.get( 'https://react-my-burger-e97f2.firebaseio.com/ingredients.json' )
            .then( response => {
                this.setState( { ingredients: response.data } );
            } )
            .catch(error => {
              this.setState({error: true});
            });
  }

  updatePurchaseState (ingredients) {
    // const ingredients = {
    //   // this copies the ingredients state
    //   ...this.state.ingredients
    // };
    const sum = Object.keys(ingredients)
      .map(igKey => {
        // this makes an array of key values
        return ingredients[igKey];
      })
      // this adds up the values
      .reduce((sum,el) => {
        return sum + el;
      },0);
      this.setState({purchaseable: sum > 0});
  }

  addIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    const updatedCount = oldCount + 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceAddition = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice + priceAddition;
    this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
    this.updatePurchaseState(updatedIngredients);
  }

  removeIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    if (oldCount <= 0){
      return;
      // returns nothing when there is no ingredients left to remove
    }
    const updatedCount = oldCount - 1;
    const updatedIngredients = {
      ...this.state.ingredients
    };
    updatedIngredients[type] = updatedCount;
    const priceDeduction = INGREDIENT_PRICES[type];
    const oldPrice = this.state.totalPrice;
    const newPrice = oldPrice - priceDeduction;
    this.setState({totalPrice: newPrice, ingredients: updatedIngredients});
    this.updatePurchaseState(updatedIngredients);
  };

  purchaseHandler = () => {
    this.setState({purchasing: true});
  }

  purchaseCancelHandler = () => {
    this.setState({purchasing: false});
  }

  purchaseContinueHandler = () => {
    // alert('You continue!');
    // adding data to DB
    this.setState({loading: true});
    const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      customer: {
        name: 'Gabe Lopez',
        address: {
          street: 'test street',
          zipCode: '64015',
          country: 'USA'
        },
        email: 'test@test.com'
      },
      deliveryMethod: 'fastest'
    }
    axios.post('/orders.json', order)
    .then(response => {
      this.setState({loading: false, purchasing: false});
    })
    .catch(error => {
      this.setState({loading: false, purchasing: false});
    });
  }

    render(){
        const disabledInfo = {
          // copies state ingredients in immutable way
          ...this.state.ingredients
        }
        for (let key in disabledInfo){
          // disabledInfo[key] is the state ingredients values
          disabledInfo[key] = disabledInfo[key] <= 0
          // this turns the values into true or false
          // {salad: true, meat: false, ...}
        }
        let orderSummary = null;
          let burger = this.state.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

          if ( this.state.ingredients ) {
              burger = (
                  <Auxiliary>
                      <Burger ingredients={this.state.ingredients} />
                      <BuildControls
                          ingredientAdded={this.addIngredientHandler}
                          ingredientRemoved={this.removeIngredientHandler}
                          disabled={disabledInfo}
                          purchaseable={this.state.purchaseable}
                          ordered={this.purchaseHandler}
                          price={this.state.totalPrice} />
                  </Auxiliary>
              );
              orderSummary = <OrderSummary
                  ingredients={this.state.ingredients}
                  price={this.state.totalPrice}
                  purchaseCancelled={this.purchaseCancelHandler}
                  purchaseContinued={this.purchaseContinueHandler} />;
          }
          if ( this.state.loading ) {
              orderSummary = <Spinner />;
          }
        return (
            <Auxiliary>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                  {orderSummary}
                </Modal>
              {burger}
            </Auxiliary>
        );
    }
}

export default withErrorHandler(BurgerBuilder, axios);
