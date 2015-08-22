var TSmfClassID = [
	"ciAction",
	"ciAnimation",
	"ciApplication",
	"ciButton",
	"ciCombo",
	"ciDataSet",
	"ciDataSource",
	"ciEdit",
	"ciEvent",
	"ciHttp",
	"ciLabel",
	"ciPage",
	"ciPicture",
	"ciRepeatBox",
	"ciRss",
	"ciTable",
	"ciTicker",
	"ciTimer",
	"ciUpdateStatus",
	"ciVideo",
	"ciWebService",
	"ciMenu",
	"ciMenuItem",
	"ciGalleryVideoTable",
	"ciGalleryImageTable",
	"ciGallerySoundTable",
	"ciContactsTable",
	"ciRectangle",
	"ciLine",
	"ciCbmTable",
	"ciAppsTable",
	"ciCamera",
	"ciGsmStatus",
	"ciCoverageStatus",
	"ciBatteryStatus",
	"ciDeviceInfoTable",
	"ciWebView",
	"ciCodeReader",
	"ciContainer",
	"ciScrollView",
	"ciSwitchButton",
	"ciTabBar",
	"ciNavigationBar",
	"ciDatePicker",
	"ciTimePicker",
	"ciMapView",
	"ciWebClient",
	"ciActivityIndicator",
	"ciAdMob",
	"ciFunction",
	"ciSlider",
	"ciDeviceContactTable",
	"ciSegmentedControl",
	"ciInAppProductsList",
	"ciChart",
	"ciGesture",
	"ciCanvas",
	"ciSearchBar"
];

function findClassIndex(target){
	for(var i = 0; i < TSmfClassID.length; i++){
		if(TSmfClassID[i] === target){
			return i;
		}
	}
	return false;
}

module.exports = {
	findClassIndex: findClassIndex
};