import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/common/product';
import { ProductService } from 'src/app/services/product.service';

import { ActivatedRoute } from '@angular/router'
import { CartItem } from 'src/app/common/cart-item';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = "";
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(private productService: ProductService, 
              private cartService: CartService,
              private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if(this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handlListProducts();      
    }

  }

  handleSearchProducts() {

    const theKeyWord: string = this.route.snapshot.paramMap.get('keyword')!;

    if(this.previousKeyword != theKeyWord) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyWord;

    console.log(`keyword=${theKeyWord}, thePageNumber=${this.thePageNumber}`);

    // now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1, 
                                              this.thePageSize,
                                              theKeyWord).subscribe(this.processResult());

  }


  handlListProducts() {

    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId){
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
     
      // get the "name" param string
      this.currentCategoryName = this.route.snapshot.paramMap.get('name')!;
    }
    else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
      this.currentCategoryName = 'Books';
    }


    //
    //
    //

    // if we have a different category id than previous
    // then set thePageNumber back to 1
    if (this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }

    this.previousCategoryId = this.currentCategoryId;

    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber-1, 
                                              this.thePageSize,
                                              this.currentCategoryId)
                                              .subscribe(this.processResult());

    
  }


  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }


  processResult() {
    return (data : any) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    }
  }


  addToCart(theProduct: Product) {

    console.log(`Adding to cart : ${theProduct.name}, ${theProduct.unitPrice}`);

    // TODO
    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);

  }

}
