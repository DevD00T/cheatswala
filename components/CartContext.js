import axios from 'axios';
import { SnackBarContext } from './SnackbarContext';
import { useRouter } from 'next/router';

const { createContext, useState, useEffect, useContext, useCallback } = require('react');

export const CartContext = createContext({});

export const CartContextProvider = ({ children }) => {
  const ls = typeof window !== 'undefined' ? window.localStorage : null;
  const [cartProducts, setCartProducts] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
 
  const {snackBarOpen} = useContext(SnackBarContext);
  const router = useRouter();
  
  const validateCartProducts = useCallback(async (cancelToken) => {
    if(!cartProducts.length>0){
      return;
    }
    try {
      const response = await axios.get('/api/products', {
        cancelToken: cancelToken?.token,
      });
      const products = response.data;
      const updatedCartProducts = cartProducts.reduce((acc,productId)=>{
        const product = products.find((product)=>product._id===productId);
        if(product){
          const productCounInCart = acc.filter(id=>id===productId).length;
          if(productCounInCart<product.stock){
            acc.push(productId);
          }else{
            snackBarOpen(`Reduced ${product.title} to ${product.stock} in your cart as ${product.stock === 0 ? "it is out of stock":"that's all we have in stock at the moment"} `,'warning');
          }
        } 
        return acc;
      },[])
      
      // Only update cartProducts if updatedCartProducts is different from cartProducts
      if (JSON.stringify(updatedCartProducts) !== JSON.stringify(cartProducts)) {
        setCartProducts(updatedCartProducts);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request cancelled');
      } else {
        console.log(error);
      }
    }
  },[cartProducts,snackBarOpen]);
  
  useEffect(() => {
    const source = axios.CancelToken.source();
    if (hasMounted) {
      ls?.setItem('cart', JSON.stringify(cartProducts));
      validateCartProducts(source)
    } else {
      setHasMounted(true);
    }

    return () => {
      source.cancel();
    };
  }, [cartProducts,hasMounted,ls,validateCartProducts]);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.href.includes('success')){
      setCartProducts([]);
    }
    else if (ls && ls.getItem('cart')) {
      setCartProducts(JSON.parse(ls.getItem('cart')));
      
    }
  }, [ls]);
  useEffect(() => {
    const source = axios.CancelToken.source();
    validateCartProducts(source);

    return () => {
      source.cancel();
    };
  }, [router.asPath,validateCartProducts]);
  const addProduct = async(productId,stock) => {
    const quantity = cartProducts.filter((id) => id === productId).length;
    try {
      const response = await axios.get(`/api/stock?id=${productId}`);
      const serverStock = response.data?.stock;
      if (serverStock && quantity < serverStock) {
        // If the stock is enough, add product to cart
        setCartProducts((prev) => [...prev, productId]);
      } else if((serverStock || serverStock===0) && quantity > serverStock) {
           
           setCartProducts((prev)=>{
            let removalsNeeded = prev.filter((id) => id === productId).length - serverStock;
            return prev.filter((item)=>{
              if(item===productId && removalsNeeded>0){
               removalsNeeded --;
               return false;
              }
              return true;
            });
           })
        
      }else{
        if(serverStock === 0 ){
          snackBarOpen(`Out of stock`, 'warning')
        }else{
          snackBarOpen(`That's all we have in stock at the moment`, 'warning')
        }
      }
      const returnValue = (serverStock !== undefined && serverStock >= 0) ? serverStock : stock;
      
      return returnValue;
    } catch (error) {
      console.log(error)
      return stock;
    }
  };
  const removeProduct = async(productId,stock)=>{
    
    const quantity = cartProducts.filter((id) => id === productId).length;
    
    try {
      const response = await axios.get(`/api/stock?id=${productId}`);
      const serverStock = response.data?.stock;
      if(quantity>0){
        setCartProducts((prev)=>{
          const pos = prev.indexOf(productId);
          if(pos !== -1){
            return prev.filter((value,index)=>index!==pos)
          }
          return prev;
        })
      }
      const returnValue = (serverStock !== undefined && serverStock >= 0) ? serverStock : stock;
        
        return returnValue;
    } catch (error) {
      console.log(error)
      return stock;
    }
    
  };
  const clearCart = ()=>{
   
    setCartProducts([]);
  }
  const clearSingleProduct = (productId)=>{
    setCartProducts((prev)=>prev.filter(p=>p!==productId));
  }
  return (
    <CartContext.Provider value={{ cartProducts, setCartProducts, addProduct, removeProduct,clearCart,clearSingleProduct,validateCartProducts }}>
      {children}
    </CartContext.Provider>
  );
};
