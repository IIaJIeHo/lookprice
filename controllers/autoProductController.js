﻿angular.module("lookPriceApp")
.controller("productCtrl", function ($scope, $rootScope, $resource, $filter, $location, productUrl, autoRegUrl, respondUrl, userRegUrl, autoUrl, Autos, Users, Autoservices, Responds, Requests, Functions, Data) {

    $scope.productsResource = $resource(productUrl + ":id", { id: "@id" });
    $scope.RegResource = $resource(autoRegUrl + ":id", { id: "@id" });
    $scope.RespondResource = $resource(respondUrl + ":id", { id: "@id" });
    $scope.UserResource = $resource(userRegUrl + ":id", { id: "@id" });
    $scope.AutoResource = $resource(autoUrl + ":id", { id: "@id" });
    $scope.allitems = true;
    $scope.toogleAutoservice = [];
    $scope.mainproduct = null;
    $scope.mainrespond = null;
    $scope.updatedRespond = null;
    $scope.products = null;
    $scope.autos = null;
    $scope.responds = null;
    $scope.users = null;
    $scope.myresponds = null;
    $scope.autoservices = null;
    $scope.autoservice = null;
    $scope.respondview = 1;
	$scope.formdetails = null;
	$scope.formdetails2 = null;
    $scope.texts = {};
    $scope.startEdit = false;
    $scope.loading = false;
    $scope.answered = false;
    $scope.baseurl = $location.absUrl().substring(0,$location.absUrl().indexOf('/a'));
    $scope.requests = ['Ногтевой сервис','Парикмахерские услуги','Косметология','Визаж','Массаж','Татуаж'];
    $scope.services = [
    {
        id: "1",
        label: "Ногтевой сервис"
    },
    {
        id: "2",
        label: "Парикмахерские услуги"
    },
    {
        id: "3",
        label: "Косметология"
    },
    {
        id: "4",
        label: "Визаж"
    },
    {
        id: "5",
        label: "Массаж"
    },
    {
        id: "6",
        label: "Татуаж"
    }
    ];
    $scope.texts = Data.getWorkTypes();
    $scope.metrostations = Data.getMetro();
    $scope.regions = Data.getRegions();
    $scope.subjects = Data.getSubjects();
    $rootScope.subjects = $scope.subjects;
    $scope.salon_types = Data.getSalonTypes();
    $scope.logout = function(){
        $rootScope.userid = undefined;
        document.cookie = "autolookid=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        $rootScope.products = null;
        $scope.listProducts();
    }
        $scope.formatDate = function(date) {
            if (date != undefined){
                 date = new Date(date);
              var hours = date.getHours();
              hours = hours < 10 ? '0'+hours : hours;
              var minutes = date.getMinutes();
              var seconds = date.getSeconds();
              var day = date.getDate() < 10 ? '0'+date.getDate() : date.getDate();
              var month = (date.getMonth()+1) < 10 ? '0'+ (date.getMonth() + 1) : (date.getMonth() + 1);
              minutes = minutes < 10 ? '0'+minutes : minutes;
              var strTime = hours + ':' + minutes;
              return day + "." + month+ "." + date.getFullYear() + " / " + strTime + "";               
            }
            else{
                return '';
            }
    }
    $scope.listProducts = function () {
        $scope.loading = true; 
        if ($rootScope.userid == undefined){
            $rootScope.userid = Functions.getCookie('autolookid');
        }
        if ($rootScope.userid == undefined){
            $location.path("/login");
        }
        else{
            if ($rootScope.products != null){
                $scope.autos = $rootScope.autos
                $scope.products = $rootScope.products; 
                $scope.responds = $rootScope.responds;
                $scope.myresponds = $rootScope.myresponds;
                $scope.users = $rootScope.users;
                $scope.autoservice = $rootScope.autoservice; 
                $scope.autoservices = $rootScope.autoservices;
                $scope.subjects = $rootScope.subjects;           
                $scope.loading = false;
                console.log("cache");
            }
            else{
            console.log($rootScope.userid);
            Autoservices.getById($rootScope.userid).then(function(autoservice){
                $scope.autoservice = autoservice;
                if (autoservice.subjects != undefined){
                    $scope.subjects = Data.getSubjects();
                    $scope.subjects.data.map(function (x) {
                        if (autoservice.subjects != undefined){
                            if (autoservice.subjects.indexOf(x.id) >= 0){
                                x.checked = true;
                            }
                            else{
                                x.checked = false;
                            }
                            return x;         
                        }
                    });
                    $rootScope.subjects = $scope.subjects;           
                }
                $scope.autoservice.id = $scope.autoservice._id.$oid;
                $rootScope.autoservice = $scope.autoservice;
                    Requests.query().then(function(data){
                        var temp_time = $scope.autoservice.date - 30*1000*60*60*24;
                        data = data.filter(function(product){
                            return product.date > temp_time;
                        });
                        // Responds.query({autoserviceid:$rootScope.userid}).then(function(responds_data){ 
                        //     console.log(responds_data);
                        //     $scope.myresponds = responds_data;
                        //     $rootScope.myresponds = $scope.myresponds;
                        // });
                        if ($scope.autoservice.subjects&&$scope.autoservice.subjects[0]){
                            data = data.filter(function(product){
                                return ((!product.subjects||!product.subjects[0]) || (product.subjects.some(function (subject) {
                                   return $scope.autoservice.subjects.indexOf(subject) >= 0
                                })));
                            });
                        }
                        if ($scope.autoservice.services&&$scope.autoservice.services[0]){
                            data = data.filter(function(product){
                                return ((!$scope.autoservice.services||!$scope.autoservice.services[0]) || ($scope.autoservice.services.some(function (service) {
                                   return product.type == $scope.requests[service - 1];
                                })));
                            });
                        }

                        $scope.products = data;
                        angular.forEach($scope.products, function(value, key) {
                            value.start = new Date(value.start);
                            value.end = new Date(value.end);
                        });

                        
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
                        var myresponds = []
                        angular.forEach($scope.responds, function(value_res, key_res) {
                            if ($rootScope.userid == value_res.autoserviceid){
                                myresponds.push(value_res);
                            }
                        }); 
                        $scope.myresponds = myresponds;
                        $rootScope.myresponds = $scope.myresponds;
                        $rootScope.responds = $scope.responds;
                        $scope.loading = false; 
                    });
                    $rootScope.products = $scope.products;  
                    $scope.loading = false;  
                    });
            });


            Users.query().then(function(users_data){ 
            $scope.users = users_data; $rootScope.users = $scope.users;}); 

            Autoservices.query().then(function(autoservices){
                $scope.autoservices = autoservices;
                $rootScope.autoservices = $scope.autoservices;
            });   
            }
                      
        }

    }
    $('#navigation a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });
    $('#reque2 a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
    });

    $scope.deleteProduct = function (product) {
        product.$remove().then(function () {
            $scope.products.splice($scope.products.indexOf(product), 1);
        });
    }

    $scope.filterbySubject = function (subject) {

        if ($scope.autoservice&&$scope.autoservice.subjects){
            return ($scope.autoservice.subjects.indexOf(subject.id) !== -1);
        }
        else{
            return false;
        }
    }

    $scope.filterbyService = function (service) {

        if ($scope.autoservice&&$scope.autoservice.services){
            return ($scope.autoservice.services.indexOf(service.id) !== -1);
        }
        else{
            return false;
        }
    }
	
    $scope.changedetail = function(name){
        $scope.formdetails = name;
    }
    $scope.changedetail2 = function(name){
        $scope.formdetails2 = name;
    }
	

    $scope.showsub = function (data) {
        var ok = false;
        angular.forEach(data,function (value,key) {
            if (value){
                ok = true;
            }
        });
       return ok;
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

    $scope.createProduct = function (product) {
        product.userid=$rootScope.userid;
        $scope.loading = true; 
        new $scope.productsResource(product).$save().then(function (newProduct) {
            $scope.products.push(newProduct);
            $scope.editedProduct = null;
            $scope.loading = false; 
        });
    }
    $scope.editUser = function(user, passchange, password){
        $scope.loading = true;
        if (passchange){
            $scope.autoservice.password = window.md5(password);
        }
        $scope.autoservice.$saveOrUpdate().then(function(editeduser){
            $rootScope.user = $scope.user;
            var htmlmail='Email = '+user.email+";</br>";
            if (user.name){
                htmlmail +="Название = " + user.name + ";</br>";     
            }
            if (user.description){
                htmlmail +="Описание = " + user.description + ";</br>";    
            }
            if (user.phone){
                htmlmail +="Телефон = " + user.phone + ";</br>";
            }
            if (user.town){
                htmlmail +="Город = " + user.town + ";</br>";
            }
            if (user.adress){
                htmlmail +="Адрес = " + user.adress + ";</br>";
            }
            if (user.site){
                htmlmail +="Сайт = " + user.site + ";</br>";
            }
            if (user.link){
                htmlmail +="Ссылка на профиль = " + user.link + ";</br>";
            }
            if (passchange){
                Functions.sendMail({
                    email: user.email,
                    username: user.email,
                    subject: 'Данные организации изменены',
                    html: "Добро пожаловать в lookprice. Ваш логин: " + user.email + " Ваш пароль: " + password,
                });
                Functions.alertAnimate($("#a-user-edit-profile"));            
            }
            else{
                var subjects = "";
                angular.forEach($scope.subjects.data, function (value, key) {
                    if (user.subjects.indexOf(value.id) >= 0){
                        subjects += value.label+" ;";
                    }
                });
                if (subjects){
                    htmlmail +="Регионы = " + subjects + ";</br>";
                }
                Functions.sendMail({
                    email: user.email,
                    username: user.email,
                    subject: 'Данные организации изменены',
                    html: htmlmail,
                    });
                Functions.alertAnimate($("#a-user-edit-profile"));         
            }
            $scope.loading = false;
        });
    }

    $scope.createRespond = function (respond) {
        $scope.loading = true; 
        var userofrequest, auto, responds, keepgoing = true;
        respond.autoserviceid=$rootScope.userid;
        respond.productid=$scope.mainproduct._id.$oid;
        respond.type = $scope.mainproduct.type;
        respond.date = Date.now();
        if ($scope.autoservice.number === undefined){
            $scope.autoservice.number = 0;
        }
        else{
            $scope.autoservice.number += 1;
        }
        /*respond.name = parseInt($scope.autoservice.phone.substring(4),10).toString(32) + "-" + (2000000 + $scope.autoservice.number);*/
        respond.name = $scope.mainproduct.name;
        angular.forEach($scope.users,function(value,key){
                if (keepgoing){
                    if (value._id.$oid== $scope.mainproduct.userid){
                        respond.phone = value.phone;
                        respond.username = value.name;
                        userofrequest = value;
                        keepgoing = false;
                    }                    
                }
            }); 
        respond.viewed = false;
        var candirespond = new Responds(respond);
        candirespond.$save().then(function (newRespond) {
            $scope.responds.push(newRespond);
            $rootScope.responds = $scope.responds;
            $scope.mainproduct.responds.push(newRespond);
            newRespond.autoservice = $scope.autoservice;
             $scope.activeresponds.push(newRespond);
             $scope.myresponds.push(newRespond);
             $rootScope.myresponds = $scope.myresponds;
             Functions.alertAnimate($("#a-respond-new"));
            $scope.editedRespond = {};
            $scope.mainproduct.replied = true;
            auto = $scope.mainproduct.auto;
            responds = $scope.mainproduct.responds;
            $scope.mainproduct.auto = [];
            $scope.mainproduct.responds = [];
            $scope.mainproduct.$update();
            $scope.mainproduct.auto = auto;
            $scope.mainproduct.responds = responds;
            Functions.sendMail({
                email: userofrequest.email,
                username: userofrequest.username,
                subject: 'На вашу заявку № '+respond.name+' откликнулись',
                html: $scope.autoservice.username + " салон ответил на заявку № " + respond.name + ", стоимость услгу " + respond.cost + "руб. Комментарий: " + respond.description,
            });
            $scope.loading = false; 
        });
        $scope.autoservice.$update().then(function(autoservice){
            $rootScope.autoservice = $scope.autoservice;
        });   
    }

    $scope.updateProduct = function (product) {
        product.date = Date.now();
        product.$update();
        $scope.editedProduct = null;
    }

    $scope.startEdit = function (product) {
        $scope.editedProduct = product;
    }
    $scope.predicate='date';
    $scope.reverse = true;
    $scope.order = function(predicate){
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    }

    $scope.updateRespond = function (respond) {
        $scope.loading = true; 
        $scope.updatedRespond = $scope.mainrespond;
        respond.autoservice = null;
        respond.$update().then(function(){
            $scope.respondview = 1;
            Functions.alertAnimate($("#a-respond-edit"));
            $scope.loading = false;         
        });
        $scope.mainrespond = null;
    }
    $scope.isdeleteRespond = function(respond){
            swal({
              title: "Вы уверены?",
              text: "У вас не получится его восстановить!",
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
                $scope.deleteRespond(respond);
              } else {
                    swal("Ура", "Всё в порядке", "error");
              }
            });
    }
    $scope.deleteRespond = function (respond) {
        $scope.updatedRespond = respond;
        respond.$remove().then(function () {
            $scope.myresponds.splice($scope.myresponds.indexOf(respond), 1);
            $scope.responds.splice($scope.responds.indexOf(respond), 1);
            swal("Удален!", "Ваша запись удалена", "success");
            Functions.alertAnimate($("#a-respond-delete"));
        });
    }

    $scope.editRespond = function (respond,number) {
        $scope.mainrespond = respond;
        $scope.respondview = number;
    }

    $scope.viewRespond = function (respond,number) {
        $scope.respondview = number;
        $scope.mainrespond = respond;
        $scope.startEdit = false;
        angular.forEach($scope.products, function(value, key) {
            if (respond.productid == value._id.$oid){
                $scope.mainproduct = value;
            }
        });
    }

    $scope.checknegative = function(array,name) {
        var checking = false;
        angular.forEach(array, function(value){
            if ((value == true)&&(checking == false)){
                checking = true;
                if ($scope.formdetails == null){
                    $scope.formdetails = name;
                }
            }
        });
        return checking;
    }

    $scope.imageinit = function () {
        if ($scope.mainrespond&&!$scope.mainrespond.images){
            $scope.mainrespond.images = [];
        }
    }

    $scope.deleteImage = function(store,image){
        store.splice(store.indexOf(image),1);
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'delete.php', true);
        xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        var params = "filename="+image.slice(1);
        console.log(params);
        var json = JSON.stringify({'filename' : image});
        xhr.send(params);
        xhr.onload = function () {
            console.log(xhr.status);
            if (xhr.status === 200) {
                console.log(xhr.responseText);
            } else {
                console.log(xhr.responseText);
            }
        };
    }

    $scope.viewItem = function (product) {
        $scope.allitems = !$scope.allitems;
        $scope.answered = false;
        $scope.mainproduct = product;
        $scope.startEdit = false;
        if (product){
            $scope.toogleAutoservice = [];
            $scope.activeresponds = [];
            angular.forEach($scope.responds, function(value, key) {
              if (value.productid == product._id.$oid){
                if (value.approved && $scope.mainproduct.phone == undefined){ /* Если заявка подтверждена, то отображаем телефон юзера */                 
                    angular.forEach($scope.users, function(value1, key1){
                        if (value1._id.$oid == product.userid){
                            $scope.mainproduct.phone = value1.phone;
                        }
                    });
                }
                angular.forEach($scope.autoservices, function(value1, key1){
                    if (value1._id.$oid == value.autoserviceid){
                        value.autoservice = value1;
                    }
                });

                if (($scope.answered == false) && (value.autoserviceid == $scope.autoservice._id.$oid)){
                    $scope.answered = true;
                }
                $scope.activeresponds.push(value);
                $scope.toogleAutoservice.push(false);
              }
            });           
        }
    }
    $scope.deleteItem = function (respond) {
        respond.$remove().then(function () {
            $scope.responds.splice($scope.responds.indexOf(respond), 1);       
        });
    }

    $scope.cancelEdit = function () {
        $scope.editedProduct = null;
    }

    //$scope.listProducts();
});
