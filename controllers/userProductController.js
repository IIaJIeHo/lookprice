angular.module("lookPriceApp")
.controller("userProductCtrl", function ($scope, $rootScope, $resource, $location, $filter, Data, Autos, Users, Autoservices, Responds, Requests, Functions) {
    $scope.allitems = true;
    $scope.mainproduct = null;
    $scope.user = null;
    $scope.activeresponds = [];
    $scope.Allpartners = true;
    $scope.activeItem = null;
    $scope.partners = [];
    $scope.texts = {};
    $scope.startEdit = false;
    $scope.updatedRequest = null;
    $scope.products = null;
    $scope.responds = null;
    $scope.partners = null;
    $scope.loading = false;
    $scope.formdetails = null;
	$scope.formdetails2 = null;
    $scope.toogleAutoservice = [];
    $scope.baseurl = $location.absUrl().substring(0,$location.absUrl().indexOf('/a'));
    $scope.requests = ['Ногтевой сервис','Парикмахерские услуги','Косметология','Визаж','Массаж','Татуаж'];
    $scope.chosenRequest = 1;
    $scope.selectedCar = [];
    $scope.subjects = Data.getSubjects();
    $rootScope.subjects = $scope.subjects;
    $scope.salon_types = Data.getSalonTypes();
    $scope.activerequest = 1;

    $('#navigation a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#reque2 a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    //$('.collapse').collapse('show');

    $scope.logout = function(){
        $rootScope.userid = undefined;
        document.cookie = "userlookid=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        $rootScope.products = null;
        $scope.listProducts();
    }
    /* Get Items from DB*/
    $scope.listProducts = function () {
        $scope.loading = true;
        if ($rootScope.userid == undefined){
            $rootScope.userid = Functions.getCookie('userlookid');
        }
        if ($rootScope.userid == undefined){
            $location.path("/login");
        }
        else{
        if ($rootScope.products != null){
            $scope.products = $rootScope.products;
            $scope.autos = $rootScope.autos;
            $scope.responds = $rootScope.responds;
            $scope.user = $rootScope.user;
            $scope.partners = $rootScope.partners;
            $scope.subjects = $rootScope.subjects;
            $scope.loading = false;
        }
        else{
        Requests.query({userid: $rootScope.userid}).then(function(data){
            $scope.products = data;
            angular.forEach($scope.products, function(value, key) {
                value.start = new Date(value.start);
                value.end = new Date(value.end);
            });
            if (data.length == 0){
                $scope.setScreen(1);
            }
            Responds.query().then(function(responds_data){
                $scope.responds = responds_data;
                angular.forEach($scope.products, function(value, key) {
                    value.responds = [];
                    angular.forEach($scope.responds, function(value_res, key_res) {
                        if (value._id.$oid == value_res.productid){
                            value.responds.push(value_res);
                        }
                });               
            });
            $rootScope.responds = $scope.responds;
            $scope.loading = false; 
        }); 
        $rootScope.products = $scope.products;      
        });

        Users.getById($rootScope.userid).then(function(user){
            $scope.user = user;
            if (user.subjects != undefined){
            $scope.subjects = Data.getSubjects();
            $scope.subjects.data.map(function (x) {
                if (user.subjects.indexOf(x.id) >= 0){
                    x.checked = true;
                }
                else{
                    x.checked = false;
                }
                return x;
            });
            $rootScope.subjects = $scope.subjects;               
            }
            $rootScope.user = $scope.user; 
        });
        
        Autoservices.query().then(function(data){
            $scope.partners = data;
            $rootScope.partners = $scope.partners; 
        }); 
        }   
        }
    }

    /* datapicker */
        $scope.changeRequest = function () {
            $scope.viewItem($scope.mainproduct, $scope.chosenRequest);
        }

        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };

        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };

      $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(),
        startingDay: 1
      };

       function disabled(data) {
        var date = data.date,
          mode = data.mode;
        return mode === 'day' && (false);
      }

        $scope.popup1 = {
        opened: false
      };

      $scope.popup2 = {
        opened: false
      };

      /* datapicker */

    $scope.formatDate = function(date) { /* make directive */
        return Functions.dataTransform(date);
    }

    /* sorting make directive*/
    $scope.predicate='date';
    $scope.reverse = true;
    $scope.order = function(predicate){
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    }
    /* sorting make directive*/

    $scope.editUser = function(user, passchange, password){
        var htmlmail;
        $scope.loading = true;
        if (passchange){
            $scope.user.password = window.md5(password);
        }
        $scope.user.$saveOrUpdate().then(function(editeduser){
            $rootScope.user = $scope.user;

            htmlmail = 'Email = '+ user.email+";</br>";
            htmlmail = user.name ? htmlmail + "Имя = " + user.name + ";</br>" : htmlmail;
            htmlmail = user.surname ? htmlmail + "Фамилия = " + user.surname + ";</br>" : htmlmail;
            htmlmail = user.phone ? htmlmail + "Телефон = " + user.phone + ";</br>" : htmlmail;

            if (passchange){

                Functions.sendMail({
                    email: user.email,
                    username: user.name,
                    subject: user.name + ': данные пользователя изменены',
                    html: "Добро пожаловать в lookprice. Ваш логин: " + user.email + " Ваш пароль: " + password,
                });

                Functions.alertAnimate($("#a-user-edit-profile"));            
            }
            else{
                var subjects = "";

                angular.forEach($scope.subjects.data, function (value, key) {
                    if ((user.subjects)&&(user.subjects.indexOf(value.id) >= 0)){
                        subjects += value.label+" ;";
                    }
                });

                htmlmail = subjects ? htmlmail + "Регионы = " + subjects + ";</br>" : htmlmail;

                /* update subjects for each request */
                angular.forEach($scope.products, function(value, key){
                    value.subjects = user.subjects;
                    value.$update();
                });

                Functions.sendMail({
                    email: user.email,
                    username: user.name,
                    subject: user.name + ': данные пользователя изменены',
                    html: htmlmail,
                });

                Functions.alertAnimate($("#a-user-edit-profile"));         
            }
            $scope.loading = false;
        });
    }

    $scope.deleteProduct = function (product) {
        product.$remove().then(function () {
            $scope.products.splice($scope.products.indexOf(product), 1);
            $rootScope.products = $scope.products;
            swal("Удален!", "Ваша заявка удалена", "success");
            Functions.alertAnimate($("#a-request-delete"));  
        });
    }

    $scope.createProduct = function (product) {
        $scope.loading = true;
        product.userid = $rootScope.userid;
        product.completed = false;
        var request = new Requests(product);
        requests.$save().then(function (newProduct) {
            $scope.products.push(newProduct);
            $rootScope.products = $scope.products; 
            $scope.editedProduct = null;
            $scope.loading = false;
        });
    }

    $scope.isdeleteProduct = function(product){
        swal({
              title: "Вы уверены?",
              text: "У вас не получится восстановить заявку!",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Да, удалить!",
              cancelButtonText: "Нет, я передумал!",
              closeOnConfirm: false,
              closeOnCancel: false
            },
            function(isConfirm){
                  if (isConfirm) {
                    $scope.deleteProduct(product);
                  } else {
                        swal("Ура", "Всё в порядке", "error");
                  }
        });
    }

    $scope.updateProduct = function (product) {
        $scope.loading = true;
        var responds = product.responds;
        $scope.updatedRequest = product;
        product.date = Date.now();
        product.responds = [];
        product.$update().then(function(newProduct){ 
            newProduct.responds = responds;
            $scope.products.push(newProduct);
            $scope.products.splice($scope.products.indexOf(product), 1);
            $rootScope.products = $scope.products;
            Functions.alertAnimate($("#a-request-edit"));
            $scope.allitems = !$scope.allitems;
            $scope.editedProduct = null;
            $scope.mainproduct = null;
            $scope.loading = false;         
        });
    }

    $scope.editItem = function (product) {
        $scope.mainproduct = product;
        $scope.startEdit = true;
        $scope.allitems = !$scope.allitems;
    }

    $scope.completeItem = function(request,type,auto,responds){
        $scope.updatedRequest = request;
        request.completed = !request.completed;
        request.auto = [];
        request.responds = [];
        request.$update().then(function(newrequest){
            request.auto = auto;
            request.responds = responds;
            $scope.products[$scope.products.indexOf(request)] = request;
            $rootScope.products = $scope.products; 
            if (newrequest.completed){
                Functions.alertAnimate($("#a-request-complete"));                  
            }
            else{
                Functions.alertAnimate($("#a-request-restore"));              
            }
     
        });           
    }

    $scope.showsub = function (data) {
        var show = false;
            angular.forEach(data,function (value,key) {
                if (value){
                    show = true;
                }
            });
       return show;
    }

    $scope.viewItem = function (product) {
        $scope.allitems = !$scope.allitems;
        $scope.startEdit = false;
        $scope.mainproduct = product;
        if (product){
            $scope.activeresponds = [];
            $scope.toogleAutoservice = [];
            angular.forEach($scope.responds, function(value, key) {

              if (value.productid == product._id.$oid){

                angular.forEach($scope.partners, function(value1, key1){
                    if (value1._id.$oid == value.autoserviceid){
                        value.autoservice = value1;
                    }
                });

                $scope.activeresponds.push(value);
                $scope.toogleAutoservice.push(false);
              }

            });
           
        }
    }

    $scope.deleteImage = function(image){
        $scope.mainproduct.details.image.splice($scope.mainproduct.details.image.indexOf(image),1);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'delete.php', true);
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");

        var params = "filename="+image.slice(1);

        var json = JSON.stringify({'filename' : image});

        xhr.send(params);

        xhr.onload = function () {
            if (xhr.status === 200) {
                console.log(xhr.responseText);
            } else {
                console.log(xhr.responseText);
            }
        };
    }

    $scope.approveRespond = function(item,autoservice){
        var partner,keyProgress = true;
        item.approved = !item.approved;
        item.$update().then(function(data){
            angular.forEach($scope.partners, function(value,key){
                if (keyProgress){
                    if (value._id.$oid == item.autoserviceid){
                        partner = value;
                        keyProgress = false;
                    }
                }
            });
            /* Обновление других ответов на заявку*/
            angular.forEach($scope.activeresponds, function(value, key) {
                if (!value.viewed){
                    value.viewed = true;
                    if ($scope.activeresponds[key] != item){
                        value.approved = false;
                        $scope.activeresponds[key].$update();
                    }
                }
            });

            item.autoservice = autoservice;

            $scope.activeresponds[$scope.activeresponds.indexOf(item)] = item;

            partner.name = partner.name || 'Партнер';

            if (item.approved){
                Functions.sendMail({
                    email: partner.email,
                    username: partner.name,
                    subject: 'Вашу заявку № ' + item.name + ' подтвердили',
                    html: $scope.user.name + " подтвердил заявку № " + item.name + ", телефон: " + $scope.user.phone +", стоимость услуг " + item.cost + "руб. ", 
                });        
            }

        });
    }


    $scope.addRequest = function (request) {
        $scope.loading = true;
        request.userid=$rootScope.userid;
        request.type = $scope.requests[$scope.activerequest - 1];
        request.date = Date.now();
        request.completed = false;
        request.start = new Date(request.start);
        request.end = new Date(request.end);
        $scope.user.number = $scope.user.number ? $scope.user.number + 1 : 0;

        request.name = parseInt($scope.user.phone.substring(4),10).toString(32) + "-" + (100 + $scope.user.number);
        request.subjects = $scope.user.subjects;
        var newrequest2 = new Requests(request);

        newrequest2.$save().then(function (newrequest) {
            newrequest.responds = [];
            requesttonull();
            $rootScope.products.push(newrequest);
            Functions.alertAnimate($("#a-request-new"));
            Functions.sendMail({
                email: "info@lookprice.ru",
                username: "Партнер",
                subject: 'Появилась новая заявка',
                html: "Тип заявки: "+request.type+ " Email: "+$scope.user.email
            });
            $scope.activerequest = 1;
            $scope.loading = false;
            $scope.setScreen(0);
            $scope.mainproduct = null;
        });
        $scope.user.$update().then(function(user){
            $rootScope.user = $scope.user;
        });         
    }
        $scope.changeActiveRequest = function (number) {
            $scope.activerequest = number ? number : $scope.chosenRequest;
        }


    $scope.filterbySubject = function (subject) {
        return $scope.user&&$scope.user.subjects ? $scope.user.subjects.indexOf(subject.id) !== -1 : false;
    }

    $scope.cancelEdit = function () {
        $scope.editedProduct = null;
    }

    function requesttonull(){
        $scope.mainproduct = {};
        $scope.mainproduct.details = {};
        $scope.mainproduct.details.image = [];
        $scope.mainproduct.salons = [[[],[]],[[]],[[],[]],[[]],[[]],[[],[],[],[]]];
        $scope.mainproduct.time = [];
    }

    requesttonull();

    $scope.listProducts();
});
angular.module("lookPriceApp").directive('showtab',
    function () {
        return {
            link: function (scope, element, attrs) {
                element.click(function(e) {
                    e.preventDefault();
                    $(element).tab('show');
                });
            }
        };
    });
