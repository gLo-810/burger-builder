import axios from 'axios';

const instance =  axios.create({
  baseURL: 'https://react-my-burger-e97f2.firebaseio.com/'
});

export default instance;