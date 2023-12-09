import { API_URLS } from "./variables";

export async function fetchTemplates (channelSelection) {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.FETCH_TEMPLATES    
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify({channelSelection: channelSelection}),
        headers: {
          'Content-Type': 'application/json'          
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
      throw new Error(`Failed to fetch templates: ${error}`);
  }
};

export async function fetchServices () {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.FETCH_SERVICES    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'          
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
      throw new Error(`Failed to fetch services: ${error}`);
  }
};


export async function authenticateUser (credentials) {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.AUTHENTICATE    
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: {
          'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
  } catch (error) {
      throw new Error(`Failed to get token: ${error}`);
  }
}

export async function checkAuthentication () {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.CHECK_USER_AUTHENTICATED    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
      throw new Error(`Failed to check authentication: ${error}`);
  }
}

export async function removeJWT () {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.REMOVE_TOKEN    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data;
  } catch (error) {
      throw new Error(`Failed to remove cookie: ${error}`);
  }
}

export async function sendMessages(sendData, sendType, updateProgressBar) {
  try {
    const endpoint = sendType === "broadcast" ? API_URLS.SEND_BROADCAST_API : API_URLS.SEND_SMS_API
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + endpoint 
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(sendData),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    updateProgressBar(sendData.csvData.length)
    return data.data;
  } catch (error) {
      throw new Error(`sendMessages failed with error message: ${error}`);
  }
}

export async function checkNumbers(checkData, updateProgressBar) {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.CHECK_NUMBERS    
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(checkData),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    updateProgressBar(checkData.csvData.length)
    return data.data;
  } catch (error) {
      throw new Error(`checkNumbers failed with error message: ${error}`);
  }
}

export async function getMessageStatus(getData) {
  try {
    const url = API_URLS.PROTOCOL + API_URLS.BASE_URL + API_URLS.GET_MESSAGE_STATUS    
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(getData),
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
      throw new Error(`checkNumbers failed with error message: ${error}`);
  }
}

export const chunkArray = (array, size) => {
  const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
      const chunkData = array.slice(i, i + size);
      chunkedArr.push({ startIndex: i, chunkData });
    }
    return chunkedArr;
}

export const processChunksInBatches = async (chunks, processChunk, limit) => {
  let results = [];
  let activeRequests = [];

  for (let chunk of chunks) {
    const request = processChunk(chunk).finally(() => {
      activeRequests = activeRequests.filter(req => req !== request);
    });

    activeRequests.push(request);

    if (activeRequests.length >= limit) {
      await Promise.race(activeRequests);
    }
    results.push(request);
  }

  return Promise.allSettled(results);
}

export const findDuplicatePhoneIndices = (csvData) => {
  const phoneIndices = {};
  const duplicates = [];

  csvData.forEach((item, index) => {
    if (phoneIndices.hasOwnProperty(item.Phone)) {
      if (phoneIndices[item.Phone].length === 1) {
        duplicates.push(phoneIndices[item.Phone][0]);
      }
      duplicates.push(index);
      phoneIndices[item.Phone].push(index);
    } else {
      phoneIndices[item.Phone] = [index];
    }
  });

  return duplicates;
}

export const convertToCSV = (arr) => {
  const array = [Object.keys(arr[0])].concat(arr);
  return array.map(it => {
    return Object.values(it).toString();
  }).join('\n');
}

export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
