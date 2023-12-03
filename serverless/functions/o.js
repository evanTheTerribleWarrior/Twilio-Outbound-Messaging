exports.handler = async function(context, event, callback) {

      const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID || 'default';
      const syncListName = context.SYNC_LIST_NAME || 'optout-list';
      const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
    
      const twilioClient = context.getTwilioClient();
      let body = "";
    
      if(Object.keys(event).length != 2){
          body = "Missing parameters";
      }
      else{
          
        let num = base64_to_base10(Object.keys(event)[1]);
        if(!num.startsWith("+")) num = "+" + num;
            
       try {
        const fulfilledValue = await validNumber(twilioClient, num);
                     try {
            await getOrCreateResource(syncClient.maps, syncListName);
            await syncClient.maps(syncListName).syncMapItems.create({
              key: num, data: {}
            });
                body = "You have successfully opted-out";
            } catch (error) {
                console.log(error)
                console.log(error.message.includes("already exists"))
                error.message.includes("already exists") ? body = "You have already opted out" : body = "Something went wrong";
            }
      } catch (rejectedValue) {
         body = "Invalid parameter";
      }
    
        }
    
        const response = new Twilio.Response();
     
        response.setBody(body);
        response.appendHeader('Content-Type', 'text/html');
      
        return callback(null, response);
    
    };
    
    
    async function validNumber (client, num) {
      await twilioClient.lookups.v1.phoneNumbers(num)
                     .fetch()
                     .then(result => {
                         console.log(result);
                        }
                     );
    }
    
    
    // Helper method to simplify getting a Sync resource (Document, List, or Map)
    // that handles the case where it may not exist yet.
    const getOrCreateResource = async (resource, name, options = {}) => {
      try {
        // Does this resource (Sync Document, List, or Map) exist already? Return it
        return await resource(name).fetch();
      } catch (err) {
        // It doesn't exist, create a new one with the given name and return it
        options.uniqueName = name;
        return resource.create(options);
      }
    };
    
    //number decoding
    function base64_to_base10(str) {
        var order = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-";
        var base = order.length;
        var num = 0, r;
        while (str.length) {
            r = order.indexOf(str.charAt(0));
            str = str.substr(1);
            num *= base;
            num += r;
        }
        return num.toString();
    }
    
    
    