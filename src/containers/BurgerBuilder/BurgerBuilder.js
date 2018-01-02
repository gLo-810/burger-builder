import React, {Component} from 'react';
import {connect} from 'react-redux';

import Auxiliary from '../../hoc/Auxiliary/Auxiliary';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import axios from '../../axios-orders';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';

import * as actions from '../../store/actions/index';



class BurgerBuilder extends Component {
  // old way?
  // constructor(props) {
  //   super(props);
  //   this.state = {...}
  // }
  state = {
    purchasing: false
  }

  componentDidMount (props) {
    console.log(this.props);
    this.props.onInitIngredients();
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
      return sum > 0;
  }


  purchaseHandler = () => {
    this.setState({purchasing: true});
  }

  purchaseCancelHandler = () => {
    this.setState({purchasing: false});
  }

  purchaseContinueHandler = () => {
    this.props.onInitPurchase();
    this.props.history.push('/checkout');
  }

    render(){
        const disabledInfo = {
          // copies state ingredients in immutable way
          ...this.props.ings
        }
        for (let key in disabledInfo){
          // disabledInfo[key] is the state ingredients values
          disabledInfo[key] = disabledInfo[key] <= 0
          // this turns the values into true or false
          // {salad: true, meat: false, ...}
        }
        let orderSummary = null;
          let burger = this.props.error ? <p>Ingredients can't be loaded!</p> : <Spinner />;

        if ( this.props.ings ) {
              burger = (
                  <Auxiliary>
                    <Burger ingredients={this.props.ings} />
                    <BuildControls
                        ingredientAdded={this.props.onIngredientAdded}
                        ingredientRemoved={this.props.onIngredientRemoved}
                        disabled={disabledInfo}
                          purchaseable={this.updatePurchaseState(this.props.ings)}
                          ordered={this.purchaseHandler}
                          price={this.props.price} />
                  </Auxiliary>
              );
              orderSummary = <OrderSummary
                  ingredients={this.props.ings}
                  price={this.props.price}
                  purchaseCancelled={this.purchaseCancelHandler}
                  purchaseContinued={this.purchaseContinueHandler} />;
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

const mapStateToProps = state => {
  return {
    ings: state.burgerBuilder.ingredients,
    price: state.burgerBuilder.totalPrice,
    error: state.burgerBuilder.error
  };
}

const mapDispatchToProps = dispatch => {
  return{
    onIngredientAdded: (ingName) => dispatch(actions.addIngredient(ingName)),
    onIngredientRemoved: (ingName) => dispatch(actions.removeIngredient(ingName)),
    onInitIngredients: () => dispatch(actions.initIngredients()),
    onInitPurchase: () => dispatch(actions.purchaseInit())
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withErrorHandler( BurgerBuilder, axios ));
