import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { CartItem } from '../common/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0); // set 0 like initial value
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0); // set 0 like initial value

  constructor() { }

  addToCart(theCartItem: CartItem): void {

    // check if we already have the item in our cart
    let alreadyExistInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      // find the item in the cart based on item id

      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);

      // check if we found it
      alreadyExistInCart = (existingCartItem != undefined);
    }

    if (alreadyExistInCart) {
      // increment the quantity
      existingCartItem.quantity++;
    } else {
      // just add the item to array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();

  }

  computeCartTotals(): void {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    //
    // publish the new values ... all subscribers will receive the new data
    // this will publish events to all subscribers
    // one event for totalPrice
    // one event for totalQuantity
    //
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue)

    // log cart data just for debugging purposes
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {

    console.log('Contents of the cart');
    for (let tempCartItem of this.cartItems) {
      const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
      console.log(`name: ${tempCartItem.name}, quantity=${tempCartItem.quantity}, unitPrice=${tempCartItem.unitPrice}, subTotalPrice=${subTotalPrice}`);
    }

    // toFixed(2) Two digits after decimal 124.98
    console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
    console.log('----');
  }

  decrementQuantity(theCartItem: CartItem) {

    theCartItem.quantity--;

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }

  remove(theCartItem: CartItem) {

    // get index of item in the array
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);

    // if found, remove the item from the array at the given index
    if (itemIndex !== -1) {
      this.cartItems.splice(itemIndex, 1);

      this.computeCartTotals();
    }

  }
}
