angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $timeout, $ionicPlatform, $ionicConfig, localService, $ionicHistory, $state, $ionicPopup) {
            
            $ionicPlatform.ready(function() {
                                 $ionicConfig.backButton.text("");
                                 
                                 $scope.goHome = function(){
                                 $ionicHistory.nextViewOptions({
                                                               disableBack: true
                                                               });
                                 $state.go('app.home');
                                 }
                                 });
            
            $scope.myTitle = '<img src="img/logohoteis_shell.png">';
            
            $scope.showAlert = function(opts) {
            var alertPopup = $ionicPopup.alert({
                                               title: opts.title,
                                               template: opts.template
                                               });
            alertPopup.then(opts.fn());
            };
            })

.controller('HomeCtrl', function($scope, $rootScope, $state, $ionicHistory, localService, $ionicModal) {
            $scope.go = function(){
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $state.go('app.single');
            }
            })

.controller('QuestoesCtrl', function($scope, $stateParams, $state, $ionicHistory, $ionicConfig, localService, $q, apiService, $ionicPopup, $sce) {
            $ionicConfig.backButton.text("");
            $ionicHistory.clearCache();
            // $ionicHistory.clearHistory();
            
            $scope.accept = true;
            
            $scope.cadastro = {
            "visitantes" : [],
            "imagem" : null
            }
            $scope.visitante = {};
            
            $scope.showOpt = false;
            var npic = 0; var n = 0; var k = -1;
            var foto = null;
            
            function verify(){
              setTimeout(function() {
                console.log(n);
                if(k < n){ 
                  k = n; verify(); 
                }else{ 
                  resolve(foto); 
                   // $scope.cadastro.imagem = foto;
                   // $scope.$apply();
                }
              }, 500);
            }
            
            CameraRoll.getPhotos(function(photo) {
              
              if(k < 0){verify(); k=0;}
              if(photo){
                console.log(photo);

                n++;
                foto = photo;
              }
            });
            
            function addV(){
            $scope.cadastro.visitantes.push({
                                            "nome" : $scope.visitante.nome,
                                            "mail" : $scope.visitante.mail,
                                            "fone" : $scope.visitante.fone,
                                            "sobrenome" : $scope.visitante.sobrenome
                                            });
            $scope.visitante = {};
            }
            
            $scope.addVisitante = function(){
            validaVisitante().then(function(success){
                                   addV();
                                   }, function(err){
                                   console.log(err);
                                   $scope.showAlert({ title: err.msg, fn: function(){} });
                                   });
            }
            
            $scope.save = function(sync){
            validaVisitante().then(function(){
                                   addV();
                                   env();
                                   }, function(err){
                                   if(err.cod == 1){
                                   if($scope.cadastro.visitantes.length > 0){
                                   env();
                                   }else{
                                   $scope.showAlert({ title: err.msg, fn: function(){} });
                                   }
                                   }else{
                                   $scope.showAlert({ title: err.msg, fn: function(){} });
                                   }
                                   });
            
            function env(){
            validaEnvio().then(function(success){
                               if(sync){
                               adSync($scope.cadastro);
                               }else{
                               console.log($scope.cadastro);
                               localService.setCadastro($scope.cadastro);
                               $ionicHistory.nextViewOptions({disableBack: true});
                               $state.go('app.success');
                               }
                               }, function(err){
                               $scope.showAlert({ title: err, fn: function(){} });
                               });
            }
            }
            
            function adSync(data){
            var sync = localService.getSync();
            delete data.imagem;
            (sync.dados) ? sync.dados.push(data) : sync.dados = [data];
            localService.setSync(sync);
            
            var alertPp = $ionicPopup.alert({
                                            title: "Dados adicionados com Sucesso!"
                                            });
            alertPp.then(function(){
                         $ionicHistory.nextViewOptions({disableBack: true});
                         $state.go('app.home');
                         });
            }
            
            $scope.toggleTermos = function(){
            $scope.accept = ($scope.accept) ? false : true;
            }
            
            function validaVisitante() {
            return $q(function(resolve, reject) {
                      // var rgxCpf = new RegExp("[0-9]{3}\.?[0-9]{3}\.?[0-9]{3}\-?[0-9]{2}");
                      var rgxFone = /^\([1-9]{2}\) [2-9][0-9]{3,4}\-[0-9]{4}?$/i;
                      // var rgxMail = /^[a-zA-Z 0-9]+@[a-z0-9]+\.[a-z]+(\.[a-z]+)?$/i;
                      var rgxMail = /^[A-Za-z0-9_\-\.]+@[A-Za-z0-9_\-\.]{2,}\.[A-Za-z0-9]{2,}(\.[A-Za-z0-9])?$/i;

                      if($scope.visitante.nome && $scope.visitante.mail && $scope.visitante.fone){
                      // (!rgxCpf.test($scope.visitante.cpf)) ? reject({"cod": 2, "msg": "CPF Inválido"}) : null;
                      (!rgxFone.test($scope.visitante.fone)) ? reject({"cod": 2, "msg": "Fone Inválido"}) : null;
                      (!rgxMail.test($scope.visitante.mail)) ? reject({"cod": 2, "msg": "E-mail Inválido"}) : null;
                      resolve("sucesso");
                      }else{
                      reject({"cod": 1, "msg": "Preencha todos os campos!"});
                      }
                      });
            }
            
            function validaEnvio() {
            return $q(function(resolve, reject) {
                      (!$scope.accept) ? reject("Para participar dessa ação, você precisa autorizar Hoteis.com!") : null;
                      resolve("sucesso");
                      });
            }
            
            $scope.foneMask = function(){
            if($scope.visitante.fone){
            // d = $scope.visitante.cpf.replace(/\D/g,"");
            // d=d.replace(/(\d{3})(\d)/,"$1.$2");
            // d=d.replace(/(\d{3})(\d)/,"$1.$2");
            // d=d.replace(/(\d{3})(\d{1,2})$/,"$1-$2");
            // $scope.visitante.cpf = d;
            
            v=$scope.visitante.fone.replace(/\D/g,"");
            v=v.substring(0, 11);
            v=v.replace(/^(\d{2})(\d)/g,"($1) $2");
            v=v.replace(/(\d)(\d{4})$/,"$1-$2");
            $scope.visitante.fone = v;
            }
            }

  trustSrc = function(src) {
    return $sce.trustAsResourceUrl(src);
  }
  
  var resolve = function(url){
    console.log("resolve");
    console.log(url);
    if(url){
      resolveLocalFileSystemURL(url, function(fileEntry) {
        fileEntry.file(function(file) {
          var reader = new FileReader();
          reader.onloadend = function(event) {
            console.log(event.target.result.byteLength);
          };

          reader.readAsDataURL(file);
          console.log(file);
          apiService.getFileContentAsBase64(file.localURL,function(base64Image){
            //$scope.cadastro.imagem = base64Image;
            // $scope.cadastro.imagem = trustSrc(file.localURL);
            $scope.cadastro.imagem = trustSrc(url);
            $scope.cadastro.imgUrl = file.localURL;
            console.log('atribuiu');
            $scope.$apply();
          });
        });
      });
    }
  }
            
            
            
            var choosePhoto = function () {
            navigator.camera.getPicture(onSuccess, onFail,
                                        {
                                        destinationType: Camera.DestinationType.DATA_URL,
                                        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                                        popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
                                        });
            
            function onSuccess(imageData) {
            var url = "data:image/jpeg;base64," + imageData;
            }
            
            function onFail(message) {console.log(message);}
            }
            })

.controller('SuccessCtrl', function($scope, $rootScope, $ionicHistory, $state, localService, $ionicPopup, $ionicConfig, apiService) {
            var data = localService.getCadastro();
            
            $scope.send = function(){
            $scope.sent = false;
            $scope.done = false;
            $scope.erro = false;
            
            apiService.get(data, function (res) {
                           $scope.sent = true;
                           setTimeout(function() {
                                      $scope.done = true;
                                      }, 500);
                           
                           //$scope.$apply();
                           },function(err){
                           console.log(err);
                           $scope.sent = true;
                           setTimeout(function() {
                                      $scope.erro = true;
                                      }, 500);
                           //$scope.showAlert({ title: "Não foi possível enviar seus dados!", fn: function(){} });
                           });
            }
            
            $scope.send();
            
            $scope.save = function(){
            $ionicHistory.nextViewOptions({
                                          disableBack: true
                                          });
            
            $state.go('app.home');
            }
            
            $scope.addSync = function(){
            var sync = localService.getSync();
            delete data.imagem;
            (sync.dados) ? sync.dados.push(data) : sync.dados = [data];
            localService.setSync(sync);
            $scope.save();
            }
            })

.controller('SyncCtrl', function($scope, apiService, $ionicLoading, localService, $ionicHistory, $state, $ionicPopup){
            var senha = 123456;
            $scope.synced = false;
            $scope.logar = {};
            var x = 0; var wdt = 0;
            var el = null;
            
            $scope.showSync = false;
            $scope.doSync = function(){
            console.log("chamou");
            if($scope.logar.senha == senha){
            $scope.showSync = true;
            var dt = localService.getSync();
            (!dt.dados) ? dt = {"dados":[]} : null;
            console.log("sync");
            console.log(dt.dados);
            x = 100/dt.dados.length;
            el = document.getElementById("pgrs");
            console.log(el);
            sincronizar(dt.dados);
            }else{
            $scope.showAlert({
                             title: 'Senha Inválida',
                             template: 'tente novamente.',
                             fn: function(){
                             $scope.logar.senha = null;
                             }
                             });
            }
            }
            
            sincronizar = function(dados){
            if(dados && dados.length > 0){
            var sendData = dados.pop();
            console.log(sendData);
            if(sendData.imgUrl){
            apiService.getFileContentAsBase64(sendData.imgUrl,function(base64Image){
                                              sendData.imagem = base64Image;
                                              
                                              setTimeout(function() {
                                                         console.log("sincronizar");
                                                         console.log(sendData);
                                                         apiService.get(sendData, function (res) {
                                                                        console.log(res);
                                                                        setTimeout(function() {
                                                                                   wdt = wdt+x;
                                                                                   el.style.width = wdt + '%';
                                                                                   sincronizar(dados);
                                                                                   }, 300);
                                                                        },
                                                                        function(res){
                                                                        console.log(res);
                                                                        delete sendData.imagem;
                                                                        dados.push(sendData);
                                                                        localService.setSync({"dados" : dados});
                                                                        setTimeout(function() {
                                                                                   $scope.erro = true;
                                                                                   $scope.$apply();
                                                                                   }, 500);
                                                                        });
                                                         }, 200);
                                              
                                              });
            }else{
            wdt = wdt+x;
            el.style.width = wdt + '%';
            sincronizar(dados);
            }
            }else{
            if(el){
            el.style.width = '0.1%';
            }
            console.log("fim sincronizar");
            localService.setSync({"dados" : dados});
            setTimeout(function() {
                       $scope.synced = true;
                       $scope.$apply();
                       }, 900);
            }
            }
            
            $scope.cancel = function(){
            $ionicHistory.nextViewOptions({
                                          disableBack: true
                                          });
            $state.go('app.home');
            
            $scope.synced = true;
            }
            })
.service('apiService', function($http){
         
         var get = function(data, success, failure){
         return $http.post('https://qualitydigitalserver2.com.br/ServiceHoteisPontoCom/api/values', data)
         .then(function (result) {
               success(result);
               }, function (error) {
               failure(error);
               });
         }
         
         var getFileContentAsBase64 = function(path,callback){
         window.resolveLocalFileSystemURL(path, gotFile, fail);
         
         function fail(e) {
         console.log('Cannot found requested file');
         }
         
         function gotFile(fileEntry) {
         fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onloadend = function(e) {
                        var content = this.result;
                        callback(content);
                        };
                        reader.readAsDataURL(file);
                        });
         }
         }
         
         return {
         get:get,
         getFileContentAsBase64:getFileContentAsBase64
         };
         
         })

.service('localService', function($window){
         var setCadastro = function(data) {
         window.localStorage.cadastro = JSON.stringify(data);
         };
         
         var getCadastro = function(){
         return JSON.parse(window.localStorage.cadastro || '{}');
         };
         
         var setSync = function(data) {
         window.localStorage.sync = JSON.stringify(data);
         };
         
         var getSync = function(){
         return JSON.parse(window.localStorage.sync || '{}');
         };
         
         return {
         getCadastro     : getCadastro,
         setCadastro     : setCadastro,
         getSync         : getSync,
         setSync         : setSync
         };
         
         });

