// @ts-nocheck

@lazy export const FLOAT_UNSPPORTED = "Scale: Cannot use float type";

@inline
export function instantiateRaw<T>(): T {
    if (!isReference<T>()) {
        return 0 as T;
    }
    else if (isString<T>()) {
        
        return "";
    } else {
        
        if (isDefined(changetype<T>(0).__init)) {
            const res = changetype<T>(__new(offsetof<T>(), idof<T>()));            
            
            res.__init();
            return res;
        } else {
            return instantiate<T>();
        }
    }
}

