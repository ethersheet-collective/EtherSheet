docCookies = {
  getItem: function (sKey) {
    if (!sKey || !this.hasItem(sKey)) { return null; }
    return unescape(document.cookie.replace(new RegExp("(?:^|.*;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*((?:[^;](?!;))*[^;]?).*"), "$1"));
  },
  /**
  * docCookies.setItem(sKey, sValue, vEnd, sPath, sDomain, bSecure)
  *
  * @argument sKey (String): the name of the cookie;
  * @argument sValue (String): the value of the cookie;
  * @optional argument vEnd (Number, String, Date Object or null): the max-age in seconds (e.g., 31536e3 for a year) or the
  *  expires date in GMTString format or in Date Object format; if not specified it will expire at the end of session; 
  * @optional argument sPath (String or null): e.g., "/", "/mydir"; if not specified, defaults to the current path of the current document location;
  * @optional argument sDomain (String or null): e.g., "example.com", ".example.com" (includes all subdomains) or "subdomain.example.com"; if not
  * specified, defaults to the host portion of the current document location;
  * @optional argument bSecure (Boolean or null): cookie will be transmitted only over secure protocol as https;
  * @return undefined;
  **/
  setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
    if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/.test(sKey)) { return; }
    var sExpires = "";
    if (vEnd) {
      switch (typeof vEnd) {
        case "number": sExpires = "; max-age=" + vEnd; break;
        case "string": sExpires = "; expires=" + vEnd; break;
        case "object": if (vEnd.hasOwnProperty("toGMTString")) { sExpires = "; expires=" + vEnd.toGMTString(); } break;
      }
    }
    document.cookie = escape(sKey) + "=" + escape(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
  },
  removeItem: function (sKey) {
    if (!sKey || !this.hasItem(sKey)) { return; }
    var oExpDate = new Date();
    oExpDate.setDate(oExpDate.getDate() - 1);
    document.cookie = escape(sKey) + "=; expires=" + oExpDate.toGMTString() + "; path=/";
  },
  hasItem: function (sKey) { return (new RegExp("(?:^|;\\s*)" + escape(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie); }
};

function randomString(length) 
{
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var string_length = length;
  var randomstring = '';
  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

function update_usermenu(sheet_data){
  $('#user-count').html(sheet_data.count); 
  $('#user-menu-container').css('background-color', sheet_data.users[docCookies.getItem('user_id')].color);
};
