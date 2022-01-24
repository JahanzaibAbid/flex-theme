"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

Shopify.theme.jsAjaxCart = {
  init: function init($section) {
    // Add settings from schema to current object
    Shopify.theme.jsAjaxCart = $.extend(this, Shopify.theme.getSectionData($section));

    if (isScreenSizeLarge() || this.cart_action == 'drawer') {
      this.initializeAjaxCart();
    } else {
      this.initializeAjaxCartOnMobile();
    }

    if (this.cart_action == 'drawer') {
      this.ajaxCartDrawer = $('[data-ajax-cart-drawer]');
      $(document).on('click', '[data-ajax-cart-trigger]', function (e) {
        e.preventDefault();
        Shopify.theme.jsAjaxCart.showDrawer();
        return false;
      });
    } else if (this.cart_action == 'mini_cart') {
      this.showMiniCartOnHover();
    }

    $(document).on('click', '.ajax-submit', function (e) {
      e.preventDefault();
      var $addToCartForm = $(this).closest('form');
      Shopify.theme.jsAjaxCart.addToCart($addToCartForm);
      return false;
    });
    $(document).on('click', '[data-ajax-cart-delete]', function (e) {
      e.preventDefault();
      var lineID = $(this).parents('[data-line-item]').data('line-item');
      Shopify.theme.jsAjaxCart.removeFromCart(lineID);

      if (Shopify.theme.jsCart) {
        Shopify.theme.jsCart.removeFromCart(lineID);
      }

      return false;
    });
    $(document).on('click', '[data-ajax-cart-close]', function (e) {
      e.preventDefault();
      Shopify.theme.jsAjaxCart.hideDrawer();
      Shopify.theme.jsAjaxCart.hideMiniCart();
      return false;
    });
        $(document).on('click', '.ajaxcart-discount-id', function (e){
      e.preventDefault();
        
      var promoid = $(this).siblings("#ajaxdevPromo").val();
     	$(".ajaxmain_discount_content").addClass("d-none");
		$(".ajaxdiscount-message").addClass("d-none");
        $(".ajaxalert-message").addClass("d-none");
        $(".ajaxcart-discount-id").addClass("d-none");
        $(".ajaxloader_button").removeClass("d-none");
                                                              
     	$.ajax({
        type: "POST",
  		url: "/cart",
        success: function(data, textstatus, jqxhr){
           Shopify.theme.jsAjaxCart.MakeRequestToApp(promoid,JSON.stringify(data));
                                  
        },
        error: function(data){
          $(".ajaxcart-discount-id").removeClass("d-none"); 
          $(".ajaxloader_button").addClass("d-none");  
        },
        
      });                                                                 
    });
  },
    MakeRequestToApp : function MakeRequestToApp(promoid,cart_data){
    
        $.ajax({      
         type: "POST",
         //url: `https://lunestelle-devel-discount-app.herokuapp.com/discount_api?shop_name=lunastelle-devel&coupen_code=${promoid}`,
         url: `http://localhost:3000/discount_api?shop_name=lunastelle-devel&coupen_code=${promoid}`,
         url: `https://discount-shopify-app.herokuapp.com/discount_api?shop_name=lunastelle-devel&coupen_code=${promoid}`,
         data: {cart_data: cart_data},
         success: function(data, textstatus, jqxhr){
         $(".ajaxcart-discount-id").removeClass("d-none"); 
         $(".ajaxloader_button").addClass("d-none"); 
         if(data["success"] == true){
           
          Shopify.theme.jsAjaxCart.ShowDiscount(data["response"]);
           
         }
            else if(data["success"] == "requirementfalse")
            {
              $(".ajaxcart-discount-id").removeClass("d-none"); 
              $(".ajaxloader_button").addClass("d-none");
              $(".ajaxdiscount-message").addClass("d-none");
              $(".ajaxalert-message").removeClass("d-none");
              $(".ajaxalert-message").removeClass("bg-success");
              $(".ajaxalert-message").addClass("Ajax_custom_req");
              $(".ajaxalert-message").text(data["response"]);
              $(".ajax-total-price").removeClass("original_price");
              $(".ajax-discount-price").addClass("d-none");
              $(".ajax-original-subtotal").removeClass("d-none");
              $(".ajax-discount-subtotal").addClass("d-none");
            }
         else{
               $(".ajaxcart-discount-id").removeClass("d-none"); 
               $(".ajaxloader_button").addClass("d-none"); 
               $(".ajaxalert-message").addClass("d-none");
               $(".ajaxdiscount-message").removeClass("d-none");
               $(".ajaxdiscount-message").removeClass("bg-success");
               $(".ajaxdiscount-message").addClass("custom_badge");
               $(".ajaxdiscount-message").text("Enter a Valid discount code");
               $(".ajax-total-price").removeClass("original_price");
               $(".ajax-discount-price").addClass("d-none");
               $(".ajax-original-subtotal").removeClass("d-none");
               $(".ajax-discount-subtotal").addClass("d-none");
             }
                    },
        error: function(data){
          console.log("error", data);
          $(".ajaxcart-discount-id").removeClass("d-none"); 
          $(".ajaxloader_button").addClass("d-none"); 
          $(".ajaxalert-message").addClass("d-none");
		  $(".ajaxdiscount-message").removeClass("d-none");
          $(".ajaxdiscount-message").removeClass("bg-success");
          $(".ajaxdiscount-message").addClass("custom_badge");
          $(".ajaxdiscount-message").text("Enter a Valid discount code");
          $(".ajax-total-price").removeClass("original_price");
          $(".ajax-discount-price").addClass("d-none");
          $(".ajax-original-subtotal").removeClass("d-none");
          $(".ajax-discount-subtotal").addClass("d-none");
        },
        
      })

},
      ShowDiscount : function ShowDiscount(response)
    {
      if (response["coupen_code"] != undefined){
        Shopify.theme.jsAjaxCart.ShowSpecificDiscount(response);

      }

     else
     {

       $(".ajaxmain_discount_content").removeClass("d-none");
      $(".ajaxsubtotal").text("$"+response["cart_current_price"].toFixed(2)+" "+response["currency"]);
       if (response["calculated_discount_amount"] == "Free Shipping"){
        $(".ajaxdiscountpercent").text(response["calculated_discount_amount"]);
       }
       else
       {
         $(".ajaxdiscountpercent").text("- $"+response["calculated_discount_amount"].toFixed(2)+" "+response["currency"]);
       }
        $(".ajaxtotal").text("$"+response["amount_after_discount"].toFixed(2)+" "+response["currency"]);
     }
    },
   ShowSpecificDiscount : function ShowSpecificDiscount(response)
  {
    var collection_detail = response["Collection_discount_prices"];
    var currentItems = $('.ajax-cart__product');
     for (var j =0; j<currentItems.length; j++){
       var item = currentItems[j];
       for (var i =0; i<collection_detail.length; i++){
       var product =  collection_detail[i];
         if (item.attributes[1].value == product["product_key"]){
             var lineID = j + 1 ;
            var itemTotal =  ("$"+product["item_total_price"].toFixed(2)+" "+response["currency"]); 
           if (product["item_original_price"] == undefined){
           $("[data-line-item=\"".concat(lineID, "\"]")).find('.ajax-total-price').addClass("original_price");
           $("[data-line-item=\"".concat(lineID, "\"]")).find('.ajax-discount-price').removeClass("d-none");
           $("[data-line-item=\"".concat(lineID, "\"]")).find('.ajax-discount-price').text(itemTotal);
         } 
        }  
   }
     }
    
       var sub_total = ("$"+response["cart_subtotal"].toFixed(2)+" "+response["currency"]);
       $('.ajax-original-subtotal').addClass("d-none");
       $('.ajax-discount-subtotal').removeClass("d-none");
       $('.ajax-discount-subtotal').text(sub_total);
  },
  showMiniCartOnHover: function showMiniCartOnHover() {
    var $el = $('[data-ajax-cart-trigger]');
    $el.hover(function () {
      if (Shopify.theme_settings.header_layout == 'centered' && $('.header-sticky-wrapper').hasClass('is-sticky')) {
        $('.header-sticky-wrapper [data-ajax-cart-trigger]').addClass('show-mini-cart');
      } else {
        $el.addClass('show-mini-cart');
      }
    }, function () {
      $el.removeClass('show-mini-cart');
    });
  },
  hideMiniCart: function hideMiniCart() {
    if (this.cart_action != 'mini_cart') return false;
    var $el = $('[data-ajax-cart-close]').parents('[data-ajax-cart-trigger]');
    $el.removeClass('show-mini-cart');
  },
  toggleMiniCart: function toggleMiniCart() {
    var $el = $('.mobile-header [data-ajax-cart-trigger]'); // Removes url to the cart page so user is not redirected

    $el.attr('href', '#');
    $el.off('click').on('click', function (e) {
      // If user clicks inside the element, do nothing
      if (e.target.closest('[data-ajax-cart-mini_cart]')) {
        return;
      } // Loads content into ajaxCart container for mobile header


      Shopify.theme.jsAjaxCart.initializeAjaxCartOnMobile(); // If user clicks outside the element, toggle the mini cart

      $el.toggleClass('show-mini-cart'); // Calculate height of mini cart

      var announcementHeight = 0;
      var mobileHeaderHeight = parseInt($('.mobile-header').height());

      if (typeof Shopify.theme.jsAnnouncementBar !== 'undefined' && Shopify.theme.jsAnnouncementBar.enable_sticky) {
        announcementHeight = Shopify.theme.jsAnnouncementBar.getAnnouncementHeight();
      }

      $('.mobile-header .theme-ajax-cart').css({
        height: "calc(100vh - ".concat(mobileHeaderHeight + announcementHeight, "px)")
      });
    });
  },
  showDrawer: function showDrawer() {
    if (this.cart_action != 'drawer') return false;
    this.ajaxCartDrawer.addClass('is-visible');
    $('.ajax-cart__overlay').addClass('is-visible');
  },
  hideDrawer: function hideDrawer() {
    if (this.cart_action != 'drawer') return false;
    this.ajaxCartDrawer.removeClass('is-visible');
    $('.ajax-cart__overlay').removeClass('is-visible');
  },
  removeFromCart: function removeFromCart(lineID, callback) {
    $.ajax({
      type: 'POST',
      url: '/cart/change.js',
      data: 'quantity=0&line=' + lineID,
      dataType: 'json',
      success: function success(cart) {
        Shopify.theme.jsAjaxCart.updateView();
      },
      error: function error(XMLHttpRequest, textStatus) {
        var response = eval('(' + XMLHttpRequest.responseText + ')');
        response = response.description;
      }
    });
  },
  initializeAjaxCart: function initializeAjaxCart() {
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref) {
      var html = _ref.html,
          options = _ref.options;
      $('[data-ajax-cart-content]').html(html.content); // Converting the currencies

      if (Currency.show_multiple_currencies) {
        Shopify.theme.currencyConverter.convertCurrencies();
      }
    }).fail(function () {// some error handling
    });
  },
  initializeAjaxCartOnMobile: function initializeAjaxCartOnMobile() {
    this.toggleMiniCart();
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref2) {
      var html = _ref2.html,
          options = _ref2.options;
      $('.mobile-header [data-ajax-cart-content]').html(html.content);
    }).fail(function () {// some error handling
    });
  },
  addToCart: function addToCart($addToCartForm) {
    var $addToCartBtn = $addToCartForm.find('.button--add-to-cart');
    $.ajax({
      url: '/cart/add.js',
      dataType: 'json',
      cache: false,
      type: 'post',
      data: $addToCartForm.serialize(),
      beforeSend: function beforeSend() {
        $addToCartBtn.attr('disabled', 'disabled').addClass('disabled');
        $addToCartBtn.find('span').removeClass("fadeInDown").addClass('animated zoomOut');
      },
      success: function success(product) {
        var $el = $('[data-ajax-cart-trigger]');
        $addToCartBtn.find('.checkmark').addClass('checkmark-active');

        function addedToCart() {
          if (!isScreenSizeLarge()) {
            $el = $('.mobile-header [data-ajax-cart-trigger]');
            Shopify.theme.scrollToTop($el);
          } else {
            $el = $('[data-ajax-cart-trigger]');
          }

          $el.addClass('show-mini-cart');
          $addToCartBtn.find('span').removeClass('fadeInDown');
        }

        window.setTimeout(function () {
          $addToCartBtn.removeAttr('disabled').removeClass('disabled');
          $addToCartBtn.find('.checkmark').removeClass('checkmark-active');
          $addToCartBtn.find('.text, .icon').removeClass('zoomOut').addClass('fadeInDown');
          $addToCartBtn.on('webkitAnimationEnd oanimationend msAnimationEnd animationend', addedToCart);
        }, 1000);
        Shopify.theme.jsAjaxCart.showDrawer();
        Shopify.theme.jsAjaxCart.updateView();

        if (Shopify.theme.jsCart) {
          var _$$ajax;

          $.ajax((_$$ajax = {
            dataType: "json",
            async: false,
            cache: false
          }, _defineProperty(_$$ajax, "dataType", 'html'), _defineProperty(_$$ajax, "url", "/cart"), _defineProperty(_$$ajax, "success", function success(html) {
            var cartForm = $(html).find('.cart__form');
            $('.cart__form').replaceWith(cartForm);
          }), _$$ajax));
        }
      },
      error: function error(XMLHttpRequest) {
        var response = eval('(' + XMLHttpRequest.responseText + ')');
        response = response.description;
        var cartWarning = "<p class=\"cart-warning__message animated bounceIn\">".concat(response.replace('All 1 ', 'All '), "</p>");
        $('.warning').remove();
        $addToCartForm.find('.cart-warning').html(cartWarning);
        $addToCartBtn.removeAttr('disabled').removeClass('disabled');
        $addToCartBtn.find('.icon').removeClass('zoomOut').addClass('zoomIn');
        $addToCartBtn.find('.text').text(Shopify.translation.addToCart).removeClass('zoomOut').addClass('zoomIn');
      }
    });
  },
  updateView: function updateView() {
    Shopify.theme.asyncView.load(Shopify.routes.cart_url, // template name
    'ajax' // view name (suffix)
    ).done(function (_ref3) {
      var html = _ref3.html,
          options = _ref3.options;

      if (options.item_count > 0) {
        var itemList = $(html.content).find('.ajax-cart__list');
        var cartDetails = $(html.content).find('.ajax-cart__details-wrapper');
        $('.ajax-cart__list').replaceWith(itemList);
        $('.ajax-cart__details-wrapper').replaceWith(cartDetails);
        $('.ajax-cart__empty-cart-message').addClass('is-hidden');
        $('.ajax-cart__form').removeClass('is-hidden');
        $('[data-ajax-cart-trigger]').addClass('has-cart-count');
        $('[data-bind="itemCount"]').text(options.item_count);
      } else {
        $('.ajax-cart__empty-cart-message').removeClass('is-hidden');
        $('.ajax-cart__form').addClass('is-hidden');
        $('[data-ajax-cart-trigger]').removeClass('has-cart-count');
        $('[data-bind="itemCount"]').text('0');
      }

      if (Currency.show_multiple_currencies) {
        Shopify.theme.currencyConverter.convertCurrencies();
      }
    }).fail(function () {// some error handling
    });
  },
  unload: function unload($section) {
    // Clear event listeners in theme editor
    $('.ajax-submit').off();
    $('[data-ajax-cart-delete]').off();
  }
};