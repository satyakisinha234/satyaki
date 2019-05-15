//represents the mai model for represnting model(in top_bar page)
//make it accessible from all the javascript file, so it can be added as the property for other view model..

var masterModel =new MasterModel();
notificationmsgarray=ko.observableArray([]);
var allnotificatiodata=[];
notificationStatus=ko.observable('Unread Notifications');
//if current page has view model...
if (hasViewModel) {
    //in case of edit_user_details page, no need to show action link..
    // masterModel.masterModel.notificationmsgarray=ko.observableArray([]);
    if(window.location.href.indexOf('edit_user_details')>-1)
    {
        masterModel.masterModel.actionVisible(false);
    }
    else {
        //if the current page has linkage,need to show options for running linkage...
        if (isLinkage) {
            masterModel.masterModel.linkagePage = ko.observable(true);
        }
        //if the current page doesnt have linkage,no need to show options for running linkage...
        else {
            masterModel.masterModel.linkagePage = ko.observable(false);
        }
        //if current page is material page, show options for handling materials..
        if (isMaterialPage) {
            masterModel.masterModel.materialPage = ko.observable(true);
        }
        //if current page is not material page,dont show options for handling materials..
        else {
            masterModel.masterModel.materialPage = ko.observable(false);
        }
    }
}
else {
    //dont show action options..
    masterModel.masterModel.actionVisible(false);
    //call apply binding here, no need to call for page with hasViewModel true as this apply binding will be called in that page.
    ko.applyBindings(masterModel);
}
function MasterModel() {
    var url = window.location.href;
    currentApp = url.split("/")[3];
    if(url.split("/")[4]=='multisim'){
        currentApp = url.split("/")[4];
        var mainHeader = pageMapping[currentApp].mainHeader;
        var subHeader = pageMapping[currentApp].subHeader;
    }else{
        currentApp = url.split("/")[3];
        var mainHeader = pageMapping[currentApp].mainHeader;
        var subHeader = pageMapping[currentApp].subHeader;
    }
    if(currentApp == 'rollingmill'){
        if((url.split("/")[4])=='rollingMillViewsMultiSimHtml'){
        }else{
            rollmilltype = url.split("/")[4];
            if(rollmilltype == 'cold' || irmss == 1){
                var applicationName = pageMapping[currentApp].application1;
            }
            else if(rollmilltype == 'hot' || irmss == 2){
                var applicationName = pageMapping[currentApp].application2;
            }
            else{
                var applicationName = pageMapping[currentApp].application3;
            }
        }

    }
    else{
        var applicationName = pageMapping[currentApp].application;
    }


    var self = this;
    self.searchParameter=ko.observable('Search');
    self.masterModel={};
    self.masterModel.actionVisible =ko.observable(true);
    self.masterModel.actionItems =ko.observableArray([]);
    self.masterModel.topLevelHeader =ko.observable();
    self.masterModel.applicationName =ko.observable();
    self.enableCalender= ko.observable(false);
    self.searchParameter=ko.observable('Search');
    self.value=ko.observable( $('#dropdown').val());
    // self.masterModel.notificationmsgarray=ko.observableArray([]);
    self.changeValue=function(){
        self.value($('#dropdown').val());
        if(self.value()=='Created' || self.value()=='Updated'){
            self.enableCalender(true);
            document.getElementById('ui-datepicker-div').style.background = "white";
        }
        else{
            self.enableCalender(false);
        }

    };
    if (applicationName)
    {
        self.masterModel.applicationName(applicationName);

    }

    if (mainHeader)
    {
        self.masterModel.topLevelHeader(mainHeader);

    }
    else
    {
        //self.masterModel.topLevelHeader('flat_products');
    }

    self.masterModel.isSubHeaderVisible =ko.observable(true);
    self.masterModel.subHeader =ko.observable();
    if (subHeader)
    {
        self.masterModel.subHeader(subHeader);

    }


    self.masterModel.applicationSelected =function(subHeader,obj,event)
    {
        self.masterModel.applicationName(obj.name);
        window.open(obj.link,"_self");
        event.stopPropagation();
    }
    self.masterModel.subHeaders =ko.observableArray(getSubHeaders(self.masterModel.topLevelHeader(), self.masterModel.subHeader,self.masterModel.applicationName));
    self.masterModel.topHeaderClicked =function(header,obj,event)
    {
        self.masterModel.topLevelHeader(header);
        self.masterModel.subHeaders(getSubHeaders(header,self.masterModel.subHeader,self.masterModel.applicationName));
        return true;
    }
    self.masterModel.subHeaderClicked=function(obj,event)
    {
        if(obj.link) {
            window.location.href = obj.link;
        }
    }
    function notification() {
        setTimeout(function () {
            requestUrl = '/notification/notify/';
            $.ajax(requestUrl, {
                type: 'GET',
                success: function (result) {
                    result=JSON.parse(result);
                    showcountflag=false;
                    if (result.notify=='true'){
                        var notificationmsg=''
                        var el = document.querySelector('.notification');
                        var subcount=0;
                        $.each(result.msg,function(index,obj){
                            subcount=result.msg.length-1;
                            if(obj.current_user==obj.receiver) {
                                var obj={ 'notificationmsg' :obj.sender + ' ' + 'sent you a new record of '+ obj.notification_data.current_app + ' with id' +' ' + obj.notification_data.record_id,
                                    'notificationurl':'/'+currentApp+'/'+obj.notification_data.record_id+ '/input/'
                                }
                                notificationmsgarray.push(obj);
                                showcountflag=true;

                            }
                        })
                        if (showcountflag) {
                            var count = Number(el.getAttribute('data-count')) || subcount;
                            el.setAttribute('data-count', count + 1);
                            el.classList.remove('notify');
                            el.offsetWidth = el.offsetWidth;
                            el.classList.add('notify');
                            el.classList.add('show-count');
                        }

                    }
                    notification();
                },
                error:function()
                {console.log('');}
            });
        },5000);
    }
    // notification();


}
//object represents subheader
function SubHeader(name,link)
{

    var self=this;
    self.name=name;

    self.subHeaderArray =ko.observableArray([]);
    self.link=link;
    self.selectedLink=ko.observable();
    self.selectedApplication =ko.observable();
}
//get the list of subheaders depending upon main header selection...
function getSubHeaders(header,subHeaderObj,applicationObj)
{
    var subHeaders =[];
    if(header=='flat_products')
    {

        /*var subHeader =new SubHeader('Processes');
         subHeader.subHeaderArray.push(new SubHeader('Coil Thermal','/coilthermal/'),new SubHeader('Plate Stretch','/platestretch/'),
         new SubHeader('Hot Rolling Mill','/rollingmill/hot/'),new SubHeader('Cold Rolling Mill','/rollingmill/cold/'),new SubHeader('Continuous Furnace','/furnace/'),
         new SubHeader('Continuous Quench','/continuousquench/'),new SubHeader('Batch Furnace','/batchfurnace/')
         );*/
        subHeaders.push(new SubHeader('Linked Process','/linkage/'));
        //subHeaders.push(new SubHeader('linkage','/linkage/'));

        subHeaders.push(new SubHeader('Coil Thermal','/coilthermal/'));
        subHeaders.push(new SubHeader('Plate Stretch','/platestretch/'));

        var subHeader =new SubHeader('Rolling Mill');
        var subHeaderContinuousQuench =new SubHeader('Continuous Quench');
        var subHeaderContinuousFurnace =new SubHeader('Continuous Furnace');
        var subHeaderBatchFurnace =new SubHeader('Batch Furnace');
        var subHeaderBatchQuench =new SubHeader('Batch Quench');

        subHeader.subHeaderArray.push(new SubHeader('Hot Rolling Mill','/rollingmill/hot/'),new SubHeader('Cold Rolling Mill','/rollingmill/cold/'),new SubHeader('Hot Reversing Mill','/hotreversingmill/'));
        // hot reversing mill has been separated for nov migration
        // subHeader.subHeaderArray.push(new SubHeader('Hot Rolling Mill','/rollingmill/hot/'),new SubHeader('Cold Rolling Mill','/rollingmill/cold/'));
        subHeaderContinuousQuench.subHeaderArray.push(new SubHeader('Continuous Quench Sheet/Plate Rec/Rcx','/continuousquench/'),new SubHeader('Continuous Quench HHT Plate C-Curve','/continuousquenchplate/'),new SubHeader('Continuous Quench Sheet/Plate C-Curve','/continuousquenchccurve/'));
        subHeaderContinuousFurnace.subHeaderArray.push(new SubHeader('Continuous Furnace Convective Rec/Rcx','/furnace/'),new SubHeader('Continuous Furnace Pusher','/furnacepusher/'),new SubHeader('Continuous Furnace Paintline','/continuousfurnacepaintline/'),new SubHeader('Continuous Furnace Convective Equiv Aging Time','/continuousfurnaceconvectiveequivagingtime/'),new SubHeader('Continuous Furnace Infrared  Rec/Rcx','/continuousfurnaceinfrared/'),new SubHeader('Continuous Furnace Convective Prec/Diss','/continuousfurnaceprecdiss/'));
        // subHeaderContinuousFurnace.subHeaderArray.push(new SubHeader('Continuous Furnace Convective Rec/Rcx','/furnace/'),new SubHeader('Continuous Furnace Pusher','/furnacepusher/'),new SubHeader('Continuous Furnace Paintline','/continuousfurnacepaintline/'),new SubHeader('Continuous Furnace Convective Equiv Aging Time','/continuousfurnaceconvectiveequivagingtime/'),new SubHeader('Continuous Furnace Infrared  Rec/Rcx','/continuousfurnaceinfrared/'));
        // subHeaderContinuousFurnace.subHeaderArray.push(new SubHeader('Continuous Furnace Convective Rec/Rcx','/furnace/'),new SubHeader('Continuous Furnace Pusher','/furnacepusher/'),new SubHeader('Continuous Furnace Paintline','/continuousfurnacepaintline/'));
        subHeaderBatchFurnace.subHeaderArray.push(new SubHeader('Batch Furnace Coil Rec/Rcx','/batchfurnace/'),new SubHeader('Batch Furnace Sheet/Plate Equiv Aging Time','/batchfurnacesheetplate/'),new SubHeader('Batch Furnace Specified T vs t Prec/Diss','/batchfurnacespecifiedtvst/'),new SubHeader('Batch Furnace Ingot and Thermal','/batchfurnaceingot/'));

        subHeaderBatchQuench.subHeaderArray.push(new SubHeader('Batch Quench Sheet/Plate C-Curve','/batchquench/'),new SubHeader('Batch Quench SheetPlate Rec/Rcx','/batchquenchsheetplate/'));
        subHeaders.push(subHeader);
        subHeaders.push(subHeaderContinuousQuench);
        subHeaders.push(subHeaderContinuousFurnace);
        subHeaders.push(subHeaderBatchFurnace);
        subHeaders.push(subHeaderBatchQuench);
        // subHeaders.push(new SubHeader('Continuous Furnace','/furnace/'));
        //subHeaders.push(new SubHeader('Continuous Quench','/continuousquench/'));
        // subHeaders.push(new SubHeader('Batch Furnace','/batchfurnace/'));
        // subHeaders.push(new SubHeader('Batch Quench','/batchquench/'));
        subHeaders.push(new SubHeader('Slab Thermal','/slabthermal/'));
        subHeaders.push(new SubHeader('Leveler Work Hardening','/leveler/'));
        subHeaders.push(new SubHeader('Coil Stress','/coilstress/'));
        subHeaders.push(new SubHeader('Caster2D','/caster/'));
        subHeaders.push(new SubHeader('Trim,Scalp,Shear-Mass Balance','/trimscalpshearmass/'));


        if(currentApp == 'rollingmill'){
            if(applicationObj() == 'Cold Rolling Mill'){
                subHeader.selectedApplication(pageMapping[currentApp].application1);
                subHeader.selectedLink(pageMapping[currentApp].application1);
            }
            else if(applicationObj() == 'Hot Rolling Mill'){
                subHeader.selectedApplication(pageMapping[currentApp].application2);
                subHeader.selectedLink(pageMapping[currentApp].application2);
            }
            else if(applicationObj() == 'Hot Reversing Mill'){
                subHeader.selectedApplication(pageMapping[currentApp].application3);
                subHeader.selectedLink(pageMapping[currentApp].application3);
            }
        }
        if(currentApp == 'continuousquench'){
            if(applicationObj() == 'Continuous Quench Sheet/Plate Rec/Rcx'){
                subHeaderContinuousQuench.selectedApplication(pageMapping[currentApp].application1);
                subHeaderContinuousQuench.selectedLink(pageMapping[currentApp].application1);
            }
            else if(applicationObj() == 'Continuous Quench HHT Plate C-Curve'){
                subHeaderContinuousQuench.selectedApplication(pageMapping[currentApp].application2);
                subHeaderContinuousQuench.selectedLink(pageMapping[currentApp].application2);
            }
            else if(applicationObj() == 'Continuous Quench Sheet/Plate C-Curve'){
                subHeaderContinuousQuench.selectedApplication(pageMapping[currentApp].application3);
                subHeaderContinuousQuench.selectedLink(pageMapping[currentApp].application3);
            }
        }
        if(currentApp == 'furnace'){
            if(applicationObj() == 'Continuous Furnace'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application1);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application1);
            }
            else if(applicationObj() == 'Continuous Furnace Pusher'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application2);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application2);
            }
            else if(applicationObj() == 'Continuous Furnace Paintline'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application3);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application3);
            }
            else if(applicationObj() == 'Continuous Furnace Convective Equiv Aging Time'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application4);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application4);
            }
            else if(applicationObj() == 'Continuous Furnace Infrared  Rec/Rcx'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application5);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application5);
            }
            else if(applicationObj() == 'Continuous Furnace convective prec/diss'){
                subHeaderContinuousFurnace.selectedApplication(pageMapping[currentApp].application6);
                subHeaderContinuousFurnace.selectedLink(pageMapping[currentApp].application6);
            }
        }
        if(currentApp == 'batchfurnace'){
            if(applicationObj() == 'Batch Furnace Coil Rec/Rcx'){
                subHeaderBatchFurnace.selectedApplication(pageMapping[currentApp].application1);
                subHeaderBatchFurnace.selectedLink(pageMapping[currentApp].application1);
            }
            else if(applicationObj() == 'Batch Furnace Sheet/Plate Equiv Aging Time'){
                subHeaderBatchFurnace.selectedApplication(pageMapping[currentApp].application2);
                subHeaderBatchFurnace.selectedLink(pageMapping[currentApp].application2);
            }
            else if(applicationObj() == 'Batch Furnace Specified T vs t Prec/Diss'){
                subHeaderBatchFurnace.selectedApplication(pageMapping[currentApp].application2);
                subHeaderBatchFurnace.selectedLink(pageMapping[currentApp].application2);
            }
            else if(applicationObj() == 'Batch Furnace Ingot and Thermal'){
                subHeaderBatchFurnace.selectedApplication(pageMapping[currentApp].application2);
                subHeaderBatchFurnace.selectedLink(pageMapping[currentApp].application2);
            }
        }
        else{
            /*if(pageMapping[currentApp].application)
             {
             subHeader.selectedApplication(pageMapping[currentApp].application);
             subHeader.selectedLink(pageMapping[currentApp].application);
             }*/
            /*else
             {
             if(pageMapping[currentApp].subHeader!='Linkage') {
             /!*subHeader.selectedApplication('Coil Thermal');
             subHeader.selectedLink('/coilthermal/');*!/
             subHeader.selectedApplication('Processes');
             subHeader.selectedLink('/flatrolled/');
             }
             else
             {
             subHeader.selectedApplication('Processes');
             subHeader.selectedLink('/flatrolled/');

             }
             }*/
        }
        /*if(pageMapping[currentApp].application)
         {
         subHeader.selectedApplication(pageMapping[currentApp].application);
         subHeader.selectedLink(pageMapping[currentApp].application);
         }
         else
         {
         if(pageMapping[currentApp].subHeader!='Linkage') {
         subHeader.selectedApplication('Coil Thermal');
         subHeader.selectedLink('/coilthermal/');
         }
         else
         {
         subHeader.selectedApplication('Processes');
         subHeader.selectedLink('/coilthermal/');
         }
         }*/

        //subHeaders.push(subHeader);


        if(!subHeaderObj())
        {
            /*subHeaderObj('Processes');
             //applicationObj('Coil Thermal');
             applicationObj('Processes');*/
        }

    }
    else if(header=='castings')
    {

        subHeaders.push(new SubHeader('Linked Process','/linkageCasting/'));
        subHeaders.push(new SubHeader('A622 Fluxing', '/fluxing/'),new SubHeader('Trough-2D', '/troughcasting/'));
        if (!subHeaderObj()) {
            if(currentApp=='fluxing') {
                subHeaderObj('A622 Fluxing');
            }
            else if(currentApp=='Trough'){
                subHeaderObj('Trough-2D');
            }
        }
    }

    else if(header=='toolbox')
    {
        subHeaders.push(new SubHeader('Spray ToolBox','/spraydesign/')
            ,new SubHeader('AlShape','/alshape/')
            ,new SubHeader('Automotive Heat Treat','/autoht/')
            ,new SubHeader('XPA','/xpa/'),
            new SubHeader('Trough','/troughv1/'));
        if(!subHeaderObj())
        {
            subHeaderObj('Spray ToolBox');
        }

    }

    return subHeaders;
}

$(document).ready(function(){
    // lazy loading plugins for improved page performance
    function loadStyleSheet(){
        $("head").append($("<link rel='stylesheet' href='/static/css/toastr.min.css' type='text/css'/>"));
        $("head").append($("<link rel='stylesheet' href='/static/css/filter.css' type='text/css'/>"));
        $("head").append($("<script src='/static/js/toastr.min.js'></script>"));
        $("head").append($("<script src='/static/js/jquery.slimscroll.min.js'></script>"));
        $("head").append($("<link rel='stylesheet' href='/static/css/Jquery.modal.css' type='text/css'/>"));
        $("head").append($("<script src='/static/js/Jquery.modal.min.js'></script>"));
    }
    loadStyleSheet();
    toastr.options= {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": false,
        "positionClass": "toast-bottom-full-width",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "600",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
    // overriding default scroll
    $('#customscroll').slimScroll({
        height: '250px'
    });
    var socketaddr='';
    function getsocketaddr (){
        requestUrl='/notification/socket/';
        $.ajax(requestUrl, {
            type: 'GET',
            async:false,
            success: function (result) {
                socketaddr='ws://'+result
            },
            error:function()
            {console.log('');}
        });
    }

    getsocketaddr();
    $("li.dropdown.dropdown-custom").on('mouseenter',function(){
        $("li.open").removeClass('open');
    });
    $('#notify').on('click',function (){
        realtime_count=0;
        $("#notificationModal").find('.modal-title').text('Notifications');
        var el = document.querySelector('.notification');
        el.setAttribute('data-count',0);
        el.classList.remove('show-count');
        requestUrl='/notification/changereadreceipt/';
        $.ajax(requestUrl, {
            type: 'GET',
            success: function (result) {
                console.log('');
            },
            error:function()
            {console.log('');}
        });
    })
    $('#cleardata').on('click',function(){
        realtime_count=0;
        notificationmsgarray.removeAll();
        requestUrl='/notification/deleteNotification/';
        $.ajax(requestUrl, {
            type: 'GET',
            success: function (result) {
                console.log('success');
            },
            error:function()
            {console.log('');}
        });
    });

    function realtimenotification() {
        requestUrl='/notification/realtime/';
        $.ajax(requestUrl, {
            type: 'POST',
            data:{'shared_users':sharelist.length},
            success: function (result) {
                result=JSON.parse(result);
                if (result.msg.length!=0) {
                    var notificationmsg = ''
                    var count=0
                    var subcount = 0;
                    $.each(result.msg, function (index, obj) {
                        subcount = result.msg.length - 1;
                        if (obj.notification_data.current_app=='Linkage'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id'  + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else if(obj.notification_data.current_app.search('Rolling Mill')>-1){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else if(obj.notification_data.current_app=='Multisim'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else if(obj.notification_data.current_app=='Spray Design'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else if(obj.notification_data.current_app=='Alshape'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app,
                                'notificationurl': obj.notification_data.current_app_root_url,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else if(obj.notification_data.current_app=='Plate Stretch'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app,
                                'notificationurl': obj.notification_data.current_app_root_url,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        else {
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id + '/input/',
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app,
                                'receiver':obj.receiver
                            }
                        }
                        allnotificatiodata.push(item);
                    })
                    socket.send(JSON.stringify(allnotificatiodata));
                }
            },
            error:function()
            {console.log('');}
        });
    }
    setTimeout(function () {
        requestUrl='/notification/unreadNotification/';
        $.ajax(requestUrl, {
            type: 'GET',
            success: function (result) {
                result=JSON.parse(result);
                if (result.msg.length!=0) {
                    var notificationmsg = ''
                    var el = document.querySelector('.notification');
                    var count=0
                    var subcount = 0;
                    $.each(result.msg, function (index, obj) {
                        subcount = result.msg.length - 1;
                        if (obj.notification_data.current_app=='Linkage'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id'  + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else if(obj.notification_data.current_app.search('Rolling Mill')>-1){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else if(obj.notification_data.current_app=='Multisim'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else if(obj.notification_data.current_app=='Spray Design'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else if(obj.notification_data.current_app=='Alshape'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app,
                                'notificationurl': obj.notification_data.current_app_root_url,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else if(obj.notification_data.current_app=='Plate Stretch'){
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app,
                                'notificationurl': obj.notification_data.current_app_root_url,
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        else {
                            var item = {
                                'notificationmsg': obj.sender + ' ' + 'sent you a new record of ' + obj.notification_data.current_app + ' with id' + ' ' + obj.notification_data.record_id,
                                'notificationurl': obj.notification_data.current_app_root_url + obj.notification_data.record_id + '/input/',
                                'read_flag':obj.read_receipt,
                                'currentapp':obj.notification_data.current_app
                            }
                        }
                        notificationmsgarray.push(item);
                    })
                    if(result.read_receipt==0) {
                        count = Number(el.getAttribute('data-count')) || result.no_of_unread_notifications-1;
                        el.setAttribute('data-count', count + 1);
                        el.classList.remove('notify');
                        el.offsetWidth = el.offsetWidth;
                        el.classList.add('notify');
                        el.classList.add('show-count');
                    }
                    else{
                        // el.setAttribute('data-count', count + 1);
                        notificationStatus('Read Notifications');
                    }
                }
            },
            error:function()
            {console.log('');}
        });
    },10)

    // for sharing indiviual records
    var sharelist=[];
    var shareID ='';
    var realtime_count = 0;

    var socket = new WebSocket(socketaddr);
    socket.onopen=function(){
        console.log('connected to real time server');
    }
    socket.onclose=function(){
        console.log('connection is closed');
    }
    $('.shareCheckbox').on('change',function() {
        var sharename=this.name;
        try {
            if (this.checked) {
                $('.' + sharename.replace(/\s/g, '')).css({'background': 'lightgoldenrodyellow'});
            }
            else{
                $('.' + sharename.replace(/\s/g, '')).css({'background': ''});
            }
        }
        catch{console.log('');}
        if (this.checked){
            sharelist.push(sharename);
        }
        else {
            sharelist=$.grep(sharelist,function(value){
                return value != sharename;
            })
        }
    });
    $('.sharingrecord').on('click',function() {
        var currentapp_root_url='/'+window.location.href.split("/")[3]+'/';
        var requestUrl = currentapp_root_url+'share/';
        var sharingFlag=true;
        if(sharelist.length==0){
            toastr.warning('Please select at least one user !!');
            sharingFlag=false;
        }
        if(sharingFlag) {
            $.ajax(requestUrl, {
                type: "post",
                data: {'sharelist': ko.toJSON(sharelist), 'sharingid': shareID},
                success: function (results) {
                    realtimenotification();
                    console.log('success');
                    toastr.success('Successfully shared !!');
                },
                error:function(){
                    toastr.error('Sharing failed !!');
                }

            });
        }
        $('input:checkbox').removeAttr('checked');

    })

    $('.shareclick').on('click',function() {
        shareID=this.id;
        sharelist=[];
        $('#searchCriteria').val('');
        $('.filterDiv').show();
        $('.panel-body').css({'background': ''});
        $('input:checkbox').removeAttr('checked');
    })

    socket.onmessage = function (message) {
        // console.log('New message: ' + message.data);
        var notify_flag=false;
        var showMultisimMessage=false;
        notificationmsgarray([]);
        try {
            real_time_Server_data = JSON.parse(JSON.parse(message.data).user);
            if (JSON.parse(message.data).notification_data == 'multisim' && real_time_Server_data.user == currentuser) {
                notify_flag = true;
                msg = 'Multisim with id' + ' ' + real_time_Server_data.multisim_id + ' ' + 'completed.Please launch Multisim to see the results.'
                notificationmsgarray.unshift({
                    'notificationmsg': msg,
                    'notificationurl': '/multisim/' + real_time_Server_data.multisim_id,
                    'read_flag':0
                });
                showMultisimMessage = true;
            }
        }
        catch {console.log();};
        if(showMultisimMessage==false) {
            notification_data = JSON.parse(message.data)
            $.each(notification_data, function (index, obj) {
                if (obj.receiver == currentuser) {
                    notificationmsgarray.unshift(obj);
                    notify_flag = true;
                }
            });
        }

        // notificationmsgarray.push(JSON.parse(message.data));
        // if (message.data == 'ping') {
        //     // socket.send('pong');
        // }
        if(showMultisimMessage==true && currentApp=='multisim'){
            console.log();
            if(real_time_Server_data.multisim_id==window.location.href.split("/")[4]){
                notify_flag=false;
                toastr.success('Multisim completed.');
                setTimeout(function () {
                    location.reload();
                },3000);
            }
            else{
                // toastr.success('Multisim completed.');
                notify_flag=true;
            }

        }
        else if(showMultisimMessage==true && currentApp!='multisim'){
            toastr.success('Multisim completed.');
        }
        if(notify_flag) {
            var el = document.querySelector('.notification');
            realtime_count+=1;
            el.setAttribute('data-count', realtime_count);
            el.classList.remove('notify');
            el.offsetWidth = el.offsetWidth;
            el.classList.add('notify');
            el.classList.add('show-count');
        }
    };
    $('#searchCriteria').keyup(function(){
        searchparameter=$(this).val();
        $('.filterDiv').each(function(){
            if($(this).text().trim().toUpperCase().startsWith(searchparameter.toUpperCase())){
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    })
    $('#searchCriteriaequipment').keyup(function(){
        searchparameter=$(this).val();
        $('.filterDivEquip').each(function(){
            if($(this).text().trim().toUpperCase().startsWith(searchparameter.toUpperCase())){
                $(this).show();
            }
            else {
                $(this).hide();
            }
        });
    })
    $("#notify").mouseover(function(){
        var el = document.querySelector('#notify');
        // realtime_count+=1;
        // el.setAttribute('data-count', realtime_count);
         el.classList.remove('notify');
        setTimeout(function() { el.classList.add('notify'); }, 100);
        // el.offsetWidth = el.offsetWidth;
        // el.classList.add('notify');
        // el.classList.add('show-count');
    })

// // for showing dropdowns from a div whose overflow:hidden
// $('.nonClipped').on('show.bs.dropdown', function () {
//     $('#modifiedDiv').css({'margin-bottom':'13px'})
//     $('body').append($('.nonClipped').css({
//         position:'absolute',
//         left:$('.nonClipped').offset().left,
//         top:$('.nonClipped').offset().top,
//     }).detach());
// });
});
