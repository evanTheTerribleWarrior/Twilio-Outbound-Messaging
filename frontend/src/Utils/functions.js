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

export async function sendMessages(sendData, sendType) {
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
    return data.data;
  } catch (error) {
      throw new Error(`sendMessages failed with error message: ${error}`);
  }
}

export async function checkNumbers(checkData) {
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
      throw new Error(`getMessageStatus failed with error message: ${error}`);
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

const normalizePhoneNumber = (phoneNumber) => {
  let cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    if (!cleanedNumber.startsWith('+')) {
        cleanedNumber = '+' + cleanedNumber;
    }
    return cleanedNumber;
}

export const findDuplicatePhoneIndices = (csvData, phoneNumberColumn) => {
  const phoneIndices = new Map();
  const duplicates = [];

  csvData.forEach((item, index) => {
      const normalizedPhone = normalizePhoneNumber(item[phoneNumberColumn]);
      if (phoneIndices.has(normalizedPhone)) {
          duplicates.push(index);
          duplicates.push(...phoneIndices.get(normalizedPhone));
      } else {
          phoneIndices.set(normalizedPhone, [index]);
      }
  });

  return Array.from(new Set(duplicates)).sort((a, b) => a - b);
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

export const isVadidObject = (obj) => {
  return obj !== null && typeof obj === 'object' && Object.keys(obj).length > 0;
}