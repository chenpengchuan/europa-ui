'use strict';

angular.module('AuxoApp')
    .factory('Auth', function($http, localStorageService, $rootScope, Restangular, $window ){
        var accessLevels = routingConfig.accessLevels
            , userRoles = routingConfig.userRoles
            , currentUser = { name: '', role: userRoles.public };

        console.log("user Roles: " + JSON.stringify(userRoles))
        console.log("accessLevels: " + JSON.stringify(accessLevels))

        var serverTimeDelta = 0;

        var isExpired = function (user) {
            if(!user.expire)
                return true;
            //console.log("now: " + new Date().toLocaleString() + "; expire: " + new Date(user.expire*1000).toLocaleString())
            var v =  user.expire * 1000 + serverTimeDelta - new Date().getTime() ;
            //v = v - 5 * 60 * 1000; // 5 minutes
            return v <= 0;
        }

        var resetUser = function () {
            changeUser( { name: '', role: userRoles.public });
        }

        if(localStorageService.get('user')) {
            var user = localStorageService.get("user");
            if(!isExpired(user)) {
                currentUser = user;
                $rootScope.token = currentUser.token
            }
            renew();
        }

        function renew(callback){
            if(!currentUser.name||!currentUser.token) {
                if(callback)
                    callback();
                return;
            }
            console.log("Doing token renew!" + new Date(currentUser.expire * 1000).toLocaleString());
            $http.get('/api/auth/renew')
                .success(function (data, status, headers, config) {
                    var user = {};
                    user.token = headers("x-auth-token"); // format like: {"sub":"test1","exp":1464771756,"roles":"ROLE_user"}
                    //console.log("user.token : " + user.token)
                    serverTimeDelta = changeUser(user);
                    if(callback)
                        callback(status)
                })
                .error(function (data, status, headers, config) {
                    console.log("data:" + JSON.stringify(data) + ", status: " + JSON.stringify(status) + "; headers: " + JSON.stringify(headers) + "; config: " + JSON.stringify(config))
                    /*
                    resetUser();
                    if(callback)
                        callback(status)
                    */
                })
        }
        /*
        var renewPeriod = 1000*60*10;
        setInterval(renew, renewPeriod);// ten minutes
        */

        function changeUser(user) {
            var parseJwt = function(token) {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                return JSON.parse($window.atob(base64));
            }
            if(user.token) {
                var obj = parseJwt(user.token);
                user.expire = obj.exp;
                user.issueAt = obj.iat;
                user.tenant = obj.tenant;
                if (obj.permissions.indexOf("europa.user") != -1)
                    user.role = userRoles.user;
                if (obj.permissions.indexOf("europa.admin") != -1)
                    user.role = userRoles.admin;
                if (obj.sub == "root")
                    user.role = userRoles.root;
            }

            angular.extend(currentUser, user);

            var exp = (user.expire * 1000 - new Date().getTime())/ 1000/60 ;
            console.log("expire time(min): " + exp)

            //console.log("user token :" + JSON.stringify(obj))

            if (!currentUser.role || currentUser.role < 0) {
                currentUser.role = userRoles.public;
            }

            if(currentUser.name) {
                localStorageService.set('user', currentUser);
                $rootScope.token = currentUser.token
            }
            else {
                localStorageService.remove('user');
                delete $rootScope.token;
            }

            console.log("logged user: " + JSON.stringify(currentUser))
            if (user.token) {
                return new Date().getTime() - user.issueAt * 1000;
            }
        }

        return {
            authorize: function(accessLevel, role) {
                if(isExpired(currentUser)) {
                    resetUser();
                }
                if(role === undefined) {
                    role = currentUser.role;
                }

                return accessLevel.bitMask & role.bitMask;
            },
            isLoggedIn: function(user) {
                if(isExpired(currentUser)) {
                    resetUser();
                }
                if(user === undefined) {
                    user = currentUser;
                }

                return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
            },
            register: function(user, success, error) {
                var user1 = {
                    loginId: user.name,
                    password: user.password,
                    roles: []
                };
                if(user.role.title === userRoles.user.title)
                    user1.roles.push("ROLE_user");
                else if(user.role.title === userRoles.admin.title)
                    user1.roles.push("ROLE_admin");
                else if(user.role.title === userRoles.root.title)
                    user1.roles.push("ROLE_root");

                $http.post('/api/users', user1).success(function(res) {
                    changeUser(res);
                    success();
                }).error(error);ModelService
            },
            changePassword: function(user, success, error) {
                $http.put('/api/users/'+ currentUser.id + "/passwd?old="+user.oldPassword+"&new="+user.newPassword, {}).success(function(res) {
                    //changeUser(res);
                    success();
                }).error(error);
            },
            login: function(user, success, error) {
                $http.post('/api/auth/login', $.param(user), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                }).success(function (data, status, headers, config) {
                    console.log("login data: " + JSON.stringify(data))
                    angular.extend(user, data);

                    user.token = headers("x-auth-token"); // format like: {"sub":"test1","exp":1464771756,"roles":"ROLE_user"}

                    serverTimeDelta = changeUser(user);
                    if (currentUser.role == userRoles.public) {
                        error({'error': 'No Permission'});
                    } else {
                        success(user);
                    }
                }).error(error);
            },
            logout: function(success, error) {
                resetUser();
                success();
            },
            getToken: function() {
                return currentUser.token;
            },
            renew: renew,
            accessLevels: accessLevels,
            userRoles: userRoles,
            user: currentUser
        };
    });

