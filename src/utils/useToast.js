import { toast } from 'react-toastify';

const useCustomToast = () => {
  
    const showToast = (message, type) => {
    const options = {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (type) {
      case 'info':
        toast.info(message, options);
        break;
      case 'success':
        toast.success(message, options);
        break;
      case 'warning':
        toast.warn(message, options);
        break;
      case 'error':
        toast.error(message, options);
        break;
      default:
        toast(message, options);
    }
  };

  return { showToast };
};

export default useCustomToast;
