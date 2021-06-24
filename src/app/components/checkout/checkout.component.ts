import { Component, OnInit } from '@angular/core';

import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ShopFormService } from 'src/app/services/shop-form.service';

import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';

import { ShopValidators } from 'src/app/validators/shop-validators';

import { CartService } from 'src/app/services/cart.service';

import { CheckoutService } from 'src/app/services/checkout.service';
import { Router } from '@angular/router';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private shopFormService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        lastName: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        email: new FormControl('',
          [Validators.required,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        city: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        state: new FormControl('', [Validators.required]),

        country: new FormControl('', [Validators.required]),

        zipCode: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),

        nameOnCard: new FormControl('',
          [Validators.required,
          Validators.minLength(2),
          ShopValidators.notOnlyWhitespace]),

        cardNumber: new FormControl('',
          [Validators.required,
          Validators.pattern('[0-9]{16}')]),

        securityCode: new FormControl('',
          [Validators.required,
          Validators.pattern('[0-9]{3}')]),

        expirationMonth: [''],

        expirationYear: ['']
      })
    });

    // populate credit card months

    const startMonth: number = new Date().getMonth() + 1;
    console.log('startMonth: ' + startMonth);

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log(`Retrieved credit card months: ${JSON.stringify(data)}`);
        this.creditCardMonths = data;
      }
    );

    // populate credit card years

    this.shopFormService.getCreditCardYears().subscribe(
      data => {
        console.log(`Retrieved credit card years: ${JSON.stringify(data)}`);
        this.creditCardYears = data;
      }
    );

    // populate countries

    this.shopFormService.getCountries().subscribe(
      data => {
        console.log(`Retrieved countries: ${JSON.stringify(data)}`);
        this.countries = data;
      }
    );
  }

  get firstName(): AbstractControl { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName(): AbstractControl { return this.checkoutFormGroup.get('customer.lastName'); }
  get email(): AbstractControl { return this.checkoutFormGroup.get('customer.email'); }

  get shippingAddressStreet(): AbstractControl { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity(): AbstractControl { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState(): AbstractControl { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry(): AbstractControl { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode(): AbstractControl { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }

  get billingAddressStreet(): AbstractControl { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity(): AbstractControl { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState(): AbstractControl { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry(): AbstractControl { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode(): AbstractControl { return this.checkoutFormGroup.get('billingAddress.zipCode'); }

  get creditCardType(): AbstractControl { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard(): AbstractControl { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber(): AbstractControl { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode(): AbstractControl { return this.checkoutFormGroup.get('creditCard.securityCode'); }

  copyShippingAddressToBillingAddress(event): void {

    if (event.target.checked) {
      this.checkoutFormGroup.controls.billingAddress.setValue(this.checkoutFormGroup.controls.shippingAddress.value);

      // buf fix for states
      this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls.billingAddress.reset();

      // bug fix for states
      this.billingAddressStates = [];

    }

  }

  onSubmit(): void {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      // Touching all fields triggers the display of the error messages
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    /*
    console.log(this.checkoutFormGroup.get('customer').value);
    console.log('The email adress is ' + this.checkoutFormGroup.get('customer').value.email);

    console.log('The shipping adress country is ' + this.checkoutFormGroup.get('shippingAddress').value.country.name);
    console.log('The shipping adress state is ' + this.checkoutFormGroup.get('shippingAddress').value.state.name);
    */

    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get card items
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i = 0; i < cartItems.length; i++) {
      orderItems[i] = new OrderItem(cartItems[i]);
    }
    */

    // - short way of doing the same thingy
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;


    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        // next: success / happy
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

          // reset cart
          this.resetCart();

        },
        // error: error / exception
        error: err => {
          alert(`There was an error: ${err.message}`);
        }
      }
    );

  }

  resetCart(): void {

    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");

  }

  handleMonthsAndYears(): void {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup.value.expirationYear);

    // if the current year equals the selected currentYear, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1; // the first month is 0
    } else {
      startMonth = 1;
    }

    this.shopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log('Retrieved credit card months: ' + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {

    const formGroup = this.checkoutFormGroup.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopFormService.getStates(countryCode).subscribe(
      data => {

        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }

        // select first item by default
        formGroup.get('state').setValue(data[0]);
      }
    )

  }

  reviewCartDetails(): void {

    // subscribe to this.cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to this.cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

}